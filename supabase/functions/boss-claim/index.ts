// Fase 4 do backend (ver CLAUDE.md): valida/aplica a recompensa do Boss semanal no servidor.
// Diferente do PvP, aqui a recompensa é um valor FIXO (BSR em js/boss.js: +5 fragmentos do dragão da
// semana, +500 moedas, +1 ovo) e a semana/dragão da vez saem só do relógio (nunca do cliente) — então
// dá pra garantir "no máximo 1 resgate por conta por semana" de forma exata, via unique constraint em
// public.boss_claims(user_id, week), em vez de limites aproximados. Ainda não é um replay do combate:
// o cliente continua decidindo se venceu ou não (ver pvp-report pro mesmo raciocínio/tradeoff).
import { createClient } from "jsr:@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Mesmas constantes de js/boss.js (bsWeek/bsNow) — a ordem dos 3 chefes é fixa (AURELION, NYXAR, CHRONOS).
const BSW = 6048e5, BSO = 4 * 864e5;
const BOSS_IDS = ["aurelion", "nyxar", "chronos"];
const BSR = { frag: 5, coins: 500, egg: 1 };

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

function weekAndBoss() {
  const w = Math.floor((Date.now() - BSO) / BSW);
  const idx = ((w % 3) + 3) % 3;
  return { week: w, bossId: BOSS_IDS[idx] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors({});
  if (req.method !== "POST") return cors({ ok: false, error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return cors({ ok: false, error: "no_auth" }, 401);

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

  const win = body?.win === true;
  const turns = Number.isInteger(body?.turns) ? body.turns : -1;
  if (turns < 1 || turns > 100) return cors({ ok: false, error: "turns_out_of_range" }, 400);

  if (!win) return cors({ ok: true, claimed: false, reason: "not_a_win" });

  const { week, bossId } = weekAndBoss();
  const admin = createClient(SB_URL, SERVICE_KEY);

  // O unique constraint (user_id, week) é a trava de verdade contra chamadas em paralelo/repetidas —
  // se o insert falhar por conflito, é porque essa conta já resgatou essa semana.
  const { error: insErr } = await admin.from("boss_claims").insert({
    user_id: userId,
    week,
    boss_id: bossId,
    turns,
  });
  if (insErr) {
    if (insErr.code === "23505") return cors({ ok: true, claimed: false, reason: "already_claimed" });
    return cors({ ok: false, error: "insert_failed" }, 500);
  }

  const { data: saved, error: rpcErr } = await admin.rpc("boss_apply_claim", {
    p_user_id: userId,
    p_boss_id: bossId,
    p_frag: BSR.frag,
    p_coins: BSR.coins,
    p_egg: BSR.egg,
  });
  if (rpcErr) return cors({ ok: false, error: "apply_failed" }, 500);

  return cors({ ok: true, claimed: true, bossId, reward: BSR, saved });
});
