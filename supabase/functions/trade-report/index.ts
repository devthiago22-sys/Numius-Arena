// Fase 5 do backend (ver CLAUDE.md): auditoria leve da Troca de Numius. A troca é um acordo entre
// DUAS contas, sem relógio nem recompensa fixa pra se apoiar (diferente do PvP/Boss) — então, por
// agora, o servidor não vira autoridade da troca (os dois lados já aplicaram local, por acordo direto
// via Realtime, antes de chamar isso). Esta função só confere se o Numiu que a conta diz ter DADO
// realmente existia no save dela na nuvem antes da troca, e grava um registro em public.trade_log —
// serve pra investigar depois uma troca suspeita, não pra bloquear uma em andamento.
import { createClient } from "jsr:@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STK = ["h", "a", "sa", "d", "sd", "sp"];

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

// Mesmo formato de xc1()/xcOffNow() em js/trade.js: {i, l, v:[6 ints], e:[6 ints], mv}.
function sane(x: any) {
  return x && Number.isInteger(x.i) && x.i >= 0 && x.i < 2000 &&
    Number.isInteger(x.l) && x.l >= 1 && x.l <= 100 &&
    Array.isArray(x.v) && x.v.length === 6 && x.v.every((n: any) => Number.isInteger(n) && n >= 0 && n <= 31) &&
    Array.isArray(x.e) && x.e.length === 6 && x.e.every((n: any) => Number.isInteger(n) && n >= 0 && n <= 252);
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

  const tradeId = typeof body?.tradeId === "string" ? body.tradeId.slice(0, 120) : "";
  const gave = body?.gave;
  const got = body?.got;
  if (!tradeId || !sane(gave) || !sane(got)) return cors({ ok: false, error: "bad_payload" }, 400);

  const admin = createClient(SB_URL, SERVICE_KEY);
  const { data: saveRow } = await admin.from("saves").select("team").eq("user_id", userId).maybeSingle();
  const team: any[] = Array.isArray(saveRow?.team) ? saveRow!.team : [];

  // "Deu" esse Numiu de verdade? Confere se o save na nuvem (antes da troca chegar lá) tem alguma
  // entrada com a mesma espécie e os mesmos 6 IVs — IV não muda com XP/nível, é uma assinatura estável.
  const verified = team.some((m) => {
    if (!m || m.i !== gave.i || !m.iv) return false;
    return STK.every((k, j) => (m.iv[k] == null ? 15 : m.iv[k]) === gave.v[j]);
  });

  await admin.from("trade_log").insert({ user_id: userId, trade_id: tradeId, gave, got, verified });

  return cors({ ok: true, verified });
});
