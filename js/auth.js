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
async function logout(){musicOff();if(SB&&isSbId(ME))try{await cloudSaveFlushNow()}catch(e){}if(SB&&SB.auth)try{SB.auth.signOut()}catch(e){}ME=null;try{localStorage.removeItem('mon-session')}catch(e){}G={team:[],badges:[],coins:0,screen:'auth',mode:'in',battle:null};R()}
