/* Cliente Supabase (Fase 1 do backend — ver CLAUDE.md). O SDK carrega via CDN em index.html, antes
   deste arquivo. Se a CDN não carregar (sem internet, bloqueada), SB fica null e o login/cadastro
   caem pro fluxo local antigo (mon-users/PBKDF2 em js/state.js) em vez de quebrar — ver authCore()
   em js/screens-bridge.js. */
const SB_URL='https://nrkfxlmjztjtpgcrprsv.supabase.co';
const SB_KEY='sb_publishable_Nmc0npQyZBb7LUaNZXpb3g_g3qxHWTI';
const SB=(typeof window!=='undefined'&&window.supabase&&window.supabase.createClient)
 ?window.supabase.createClient(SB_URL,SB_KEY)
 :null;

/* Mantém a conta Supabase (uuid) num registro local em `mon-users`, do mesmo jeito que as contas
   locais de antes — assim save()/load() (js/state.js) continuam funcionando sem mudar nada: só o
   que muda é a chave (uuid em vez de nome de treinador) e que não existe mais hash de senha local
   pra essas contas (quem autentica é o Supabase). A Fase 2 troca isso por ler/escrever a tabela
   `saves` de verdade; até lá o progresso de uma conta Supabase continua só neste navegador. */
function cacheAcct(uid,email,username){
 const u=U();
 if(!u[uid])u[uid]={email,username,data:null};
 else{u[uid].email=email;u[uid].username=username}
 setU(u);
}
