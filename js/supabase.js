/* Cliente Supabase (Fase 1 do backend — ver CLAUDE.md). O SDK carrega via CDN em index.html, antes
   deste arquivo. Se a CDN não carregar (sem internet, bloqueada), SB fica null e o login/cadastro
   caem pro fluxo local antigo (mon-users/PBKDF2 em js/state.js) em vez de quebrar — ver authCore()
   em js/screens-bridge.js. */
const SB_URL='https://nrkfxlmjztjtpgcrprsv.supabase.co';
/* Chave "legacy anon" (JWT clássico), não a "publishable" nova (sb_publishable_...): essa é a que
   deu erro ("Não foi possível verificar o nome") no cadastro de verdade — o formato novo de chave é
   recente e provavelmente não é reconhecido do jeito esperado pela versão do supabase-js carregada
   via CDN em index.html. A JWT clássica é o formato testado há anos, segura pra expor no front (role
   "anon", protegida pelas políticas de RLS) e compatível com qualquer versão do cliente. */
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ya2Z4bG1qenRqdHBnY3JwcnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NzkyMzgsImV4cCI6MjEwODQ1NTIzOH0.UB-LD-7P49Q5dhM_n7yemATlTYAw2dJKL_I_KoHBmvo';
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

/* Identifica uma conta Supabase (ME vira o uuid depois de logar por lá — ver authCore em
   screens-bridge.js) — nome de treinador local nunca bate com esse formato (sem hífen), então não
   precisa de uma flag separada. */
const isSbId=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id||'');

/* Nome pra mostrar na tela. Numa conta Supabase, ME é o uuid (não dá pra mostrar pro jogador) — busca
   o nome de treinador guardado por cacheAcct(). Numa conta local de antes da Fase 1, ME já É o nome de
   treinador, então não precisa buscar nada. */
const meName=()=>{if(!ME)return'';const u=U()[ME];return(u&&u.username)?u.username:ME};

/* Fase 2 do backend — ver CLAUDE.md: espelha o save (já gravado local por save(), em js/state.js) na
   tabela public.saves, com debounce pra não martelar a API a cada chamada de save() (XP, troca de
   golpe, etc. chamam save() várias vezes por minuto). O local continua sendo a cópia rápida/offline;
   a nuvem é só pra sincronizar entre aparelhos. Falha aqui nunca trava o jogo — só loga no console. */
let SB_SAVE_T=null,SB_SAVE_PEND=null;
function cloudSaveQ(d){
 if(!SB||!isSbId(ME))return;
 SB_SAVE_PEND=d;
 clearTimeout(SB_SAVE_T);
 SB_SAVE_T=setTimeout(cloudSaveFlush,1500);
}
async function cloudSaveFlush(){
 if(!SB_SAVE_PEND)return;
 const d=SB_SAVE_PEND;SB_SAVE_PEND=null;
 try{
  const{error}=await SB.from('saves').upsert({user_id:ME,...d},{onConflict:'user_id'});
  if(error)console.error('[numius] cloudSave falhou:',error);
 }catch(e){console.error('[numius] cloudSave falhou:',e)}
}
/* Grava na nuvem na hora, sem esperar o debounce — usado ao sair, pra não perder os últimos
   segundos de progresso. */
function cloudSaveFlushNow(){clearTimeout(SB_SAVE_T);return cloudSaveFlush()}
