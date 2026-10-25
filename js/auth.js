/* Formulário de reserva em HTML (quando a tela de login em iframe não responde ready a tempo —
   ver lgMount() em screens-bridge.js). Usa a mesma lógica de authCore()/authCoreLocal() (Fase 1 do
   backend: Supabase quando disponível, local como reserva), só muda de onde lê os campos. */
async function submitAuth(){
 const id=$('#fid').value.trim().toLowerCase(),pw=$('#fpw').value,em=$('#fem')?$('#fem').value.trim():'',p2=$('#fp2')?$('#fp2').value:'';
 G.f={id,em};const up=G.mode==='up';
 const err=await authCore(up,id,pw,em,p2);
 if(err)G.err=err;else G.f=null;
 R();
}
/* Numa conta Supabase a nuvem é quem decide (sincroniza entre aparelhos — ver load() em
   js/state.js), mesmo que este navegador nunca tenha visto essa conta antes (cache local vazio).
   Pra conta local de antes da Fase 1/2, continua decidindo pelo cache local, igual sempre foi. */
async function enter(){if(SB&&isSbId(ME)){await load();return}const d=U()[ME]&&U()[ME].data;if(d&&d.team&&d.team.length)load();else{G={team:[],badges:[],coins:0,screen:d&&d.hero?'start':'hero',battle:null,hero:d&&d.hero||null};R()}}
function guest(){ME=null;G={team:[],badges:[],coins:0,screen:'hero',battle:null};R()}
/* E-mail real opcional, só pra recuperação de senha (nunca usado pra login) — ver
   set_recovery_email() no banco e CLAUDE.md. Grava o valor digitado em #rcem na própria conta. */
async function saveRecoveryEmail(){
 if(!SB||!isSbId(ME))return;
 const em=($('#rcem').value||'').trim();
 if(em&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){G.rcErr='Digite um e-mail válido (ou deixe em branco para remover).';G.rcMsg='';R();return}
 G.rcErr='';G.rcMsg='Salvando…';R();
 try{
  const{error}=await SB.rpc('set_recovery_email',{email:em});
  if(error){G.rcErr='Não foi possível salvar. Tente novamente.';G.rcMsg='';console.error('[numius] set_recovery_email falhou:',error)}
  else{G.rcEm0=em;G.rcMsg=em?'E-mail de recuperação salvo!':'E-mail de recuperação removido.'}
 }catch(e){G.rcErr='Não foi possível salvar. Tente novamente.';G.rcMsg=''}
 R();
}
/* "Esqueci minha senha": chama a Edge Function password-reset-request (fora de qualquer sessão —
   por isso não passa SB.auth, é um fetch direto, igual pvp-report/boss-claim fazem autenticados).
   A resposta é sempre genérica de propósito (ver a função), então a mensagem de sucesso não
   confirma se a conta existia. */
async function forgotPw(){
 const id=($('#ffid').value||'').trim().toLowerCase(),em=($('#ffem').value||'').trim();
 if(!/^[a-z0-9_]{3,20}$/.test(id)){G.err='Digite seu nome de treinador.';G.note='';R();return}
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){G.err='Digite um e-mail válido.';G.note='';R();return}
 if(!SB){G.err='Recuperação de senha precisa de conexão. Tente novamente mais tarde.';G.note='';R();return}
 G.err='';G.note='Enviando…';R();
 try{
  const r=await fetch(SB_URL+'/functions/v1/password-reset-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:id,recoveryEmail:em})});
  const d=await r.json().catch(()=>({}));
  G.note=d.message||'Se o nome de treinador e o e-mail baterem com uma conta, enviamos um link de recuperação.';
 }catch(e){G.err='Não foi possível enviar agora. Tente novamente.';G.note=''}
 R();
}
async function logout(){musicOff();if(SB&&isSbId(ME))try{await cloudSaveFlushNow()}catch(e){}if(SB&&SB.auth)try{SB.auth.signOut()}catch(e){}ME=null;try{localStorage.removeItem('mon-session')}catch(e){}G={team:[],badges:[],coins:0,screen:'auth',mode:'in',battle:null};R()}
