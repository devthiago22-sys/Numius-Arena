// Fase 3 do backend (ver CLAUDE.md): validação server-side do resultado de um duelo PvP.
// NÃO é um replay completo da batalha (isso exigiria portar hit()/pvpResolve/legend.js pro Deno,
// um trabalho grande e arriscado de manter sincronizado com o motor do jogo) — é uma validação de
// limites + auditoria: o cliente ainda decide quem venceu, mas o servidor nunca deixa um delta de LP
// fora do que a fórmula de pvpEnd() (js/pvp.js) poderia produzir, limita a frequência de chamadas e
// guarda cada resultado reportado em public.pvp_matches pra auditoria futura. Isso impede o ataque
// trivial (editar localStorage/variável e dar LP infinito pra si mesmo) sem exigir reescrever o motor
// de batalha inteiro em outra linguagem.
import { createClient } from "jsr:@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Mesmos limites da fórmula em pvpEnd() (js/pvp.js):
// vitória: dl = 25 + clamp(-10,15, round(d/20))  -> entre 15 e 40
// derrota: dl = -(15 + clamp(-5,5, round(-d/40))) -> entre -20 e -10
const BOUNDS = { win: [15, 40], lose: [-20, -10] } as const;
const MIN_SECONDS_BETWEEN_REPORTS = 5;

function cors(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors({});
  if (req.method !== "POST") return cors({ ok: false, error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return cors({ ok: false, error: "no_auth" }, 401);

  // Cliente "como o usuário", só pra confirmar quem está chamando (nunca confiar num user_id vindo do corpo).
  const asUser = createClient(SB_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: userRes, error: userErr } = await asUser.auth.getUser(jwt);
  if (userErr || !userRes?.user) return cors({ ok: false, error: "invalid_session" }, 401);
  const userId = userRes.user.id;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return cors({ ok: false, error: "bad_json" }, 400);
  }

  const bid = typeof body?.bid === "string" ? body.bid.slice(0, 120) : "";
  const won = body?.won === true;
  const turns = Number.isInteger(body?.turns) ? body.turns : -1;
  const lpDelta = Number.isInteger(body?.lpDelta) ? body.lpDelta : NaN;

  if (!bid) return cors({ ok: false, error: "missing_bid" }, 400);
  if (turns < 1 || turns > 200) return cors({ ok: false, error: "turns_out_of_range" }, 400);
  const [lo, hi] = won ? BOUNDS.win : BOUNDS.lose;
  if (!Number.isInteger(lpDelta) || lpDelta < lo || lpDelta > hi) {
    return cors({ ok: false, error: "lp_delta_out_of_range" }, 400);
  }

  // Service role: só a Edge Function usa essa chave, nunca vai pro front (ver CLAUDE.md, seção Back-end).
  const admin = createClient(SB_URL, SERVICE_KEY);

  // Mesmo bid já reportado por essa conta? Recusa (evita reportar a mesma partida duas vezes).
  const { data: dup } = await admin
    .from("pvp_matches")
    .select("id")
    .eq("user_id", userId)
    .eq("bid", bid)
    .limit(1);
  if (dup && dup.length) return cors({ ok: false, error: "duplicate_report" }, 409);

  // Limite de frequência: duelos levam mais que alguns segundos pra terminar de verdade.
  const { data: last } = await admin
    .from("pvp_matches")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (last && last.length) {
    const ageSec = (Date.now() - new Date(last[0].created_at).getTime()) / 1000;
    if (ageSec < MIN_SECONDS_BETWEEN_REPORTS) {
      return cors({ ok: false, error: "rate_limited" }, 429);
    }
  }

  const { data: pv, error: rpcErr } = await admin.rpc("pvp_apply_result", {
    p_user_id: userId,
    p_delta: lpDelta,
    p_won: won,
  });
  if (rpcErr) return cors({ ok: false, error: "apply_failed" }, 500);

  const lpAfter = pv && typeof pv === "object" ? (pv as any).lp ?? null : null;
  await admin.from("pvp_matches").insert({
    user_id: userId,
    bid,
    won,
    turns,
    lp_delta: lpDelta,
    lp_after: lpAfter,
  });

  return cors({ ok: true, pv });
});
