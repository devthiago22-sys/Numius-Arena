/* Troca de Numius (ilha "CIDADE NEXUS", `nav:"trade"`). Reaproveita a sala peer-to-peer do PvP
   (`ensureRoom()` em js/pvp.js, claude.use('room')) com campos de presença próprios (prefixo `xc`), sem
   interferir no pareamento do PvP — os dois sistemas convivem na mesma sala de presença.
   A troca em si é determinística (sem RR()): não existe "servidor" de verdade, então cada aparelho aplica
   a troca sozinho assim que vê os dois lados com o mesmo `xcId` confirmado (`xcOk`) — não precisa de
   autoridade central porque o resultado (trocar A por B) não depende de sorte. */
const XC={st:'idle',with:null,id:null,ok:null,out:null,rm:null,seen:{},gone:0,doneId:null};
const xc1=m=>({i:m.i,l:m.l,v:STK.map(k=>m.iv[k]==null?15:m.iv[k]),e:STK.map(k=>m.ev[k]||0),mv:m.mv||0});
const xcOffNow=()=>{const m=G.xcSel!=null?G.team[G.xcSel]:null;return m?xc1(m):null};
/* Sem sala de amigos escolhida, só pareia com quem também está em xcRm:null (pool público); com sala, só
   pareia com quem tem o mesmo código (xcRm) — mesmo truque do PV.rm no PvP (pvOthers em screens-bridge.js). */
const xcOthers=()=>PV.peers.filter(p=>!p.sameTab&&p.kind==='viewer'&&p.presence&&p.presence.xc===1&&(p.presence.xcRm||null)===(XC.rm||null));
async function xcOpen(){
 G.xcfb=0;G.screen='trade';R();
 await ensureRoom();
 if(G.xcSel==null||!G.team[G.xcSel])G.xcSel=G.team.length>1?0:null;
 pvpPres({xc:1,nm:String((G.hero&&G.hero.name)||'Treinador').slice(0,14),xcSt:XC.st,xcOff:xcOffNow(),xcRm:XC.rm||null,xcWith:null,xcId:null,xcOk:null,xcCh:null});
 R();
}
function xcRoom(op,code){
 if(!PV.ok)return;
 if(op==='create'){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=n=>Array.from({length:n},()=>A[Math.floor(Math.random()*A.length)]).join('');XC.rm=r(4)+'-'+r(4)}
 else if(op==='join'){const c=String(code||'').trim().toUpperCase();if(!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)){PV.msg='Código inválido. Use o formato XXXX-XXXX.';R();return}XC.rm=c}
 else if(op==='leave')XC.rm=null;
 XC.st='idle';XC.with=null;XC.id=null;XC.ok=null;XC.out=null;
 pvpPres({xcRm:XC.rm||null,xcSt:'idle',xcWith:null,xcId:null,xcOk:null,xcCh:null});
 R();
}
function xcSelect(i){if(XC.with||!G.team[i])return;G.xcSel=i;pvpPres({xcOff:xcOffNow()});R()}
function xcSearch(){if(!PV.ok||XC.with||G.team.length<2||G.xcSel==null)return;XC.st='search';pvpPres({xcSt:'search'});R();xcOnPeers()}
function xcCancel(){XC.st='idle';XC.with=null;XC.id=null;XC.ok=null;XC.out=null;pvpPres({xcSt:'idle',xcWith:null,xcId:null,xcOk:null,xcCh:null});R()}
function xcChallenge(peer){const bid=myPeer()+':'+Date.now();XC.out={to:peer,bid};pvpPres({xcCh:{to:peer,bid}});R();
 setTimeout(()=>{if(XC.out&&XC.out.bid===bid){XC.out=null;pvpPres({xcCh:null});if(G.screen==='trade')R()}},25000);
}
function xcAcceptFrom(peer){const p=peerOf(peer);if(!p||!p.presence.xcCh||p.presence.xcCh.to!==myPeer())return;
 const bid=p.presence.xcCh.bid;XC.with=peer;XC.id=bid;XC.st='paired';XC.ok=null;XC.doneId=null;XC.gone=0;
 pvpPres({xcAcc:bid,xcSt:'paired',xcWith:peer,xcId:bid,xcOk:null,xcCh:null});R();
}
function xcConfirm(){if(!XC.with||!XC.id)return;XC.ok=XC.id;pvpPres({xcOk:XC.id});R()}
function xcLeave(){XC.st='idle';XC.with=null;XC.id=null;XC.ok=null;XC.out=null;XC.rm=null;
 pvpPres({xc:null,nm:null,xcSt:null,xcOff:null,xcRm:null,xcWith:null,xcId:null,xcOk:null,xcCh:null,xcAcc:null});
 G.screen='map';R();
}
function xcOnPeers(){
 if(G.screen!=='trade'||!PV.ok)return;
 const mp=myPeer();
 if(XC.with){
  const p=peerOf(XC.with);
  if(!p||p.presence.xc!==1||p.presence.xcWith!==mp||p.presence.xcId!==XC.id){
   if(!XC.gone){XC.gone=Date.now();setTimeout(xcOnPeers,8500)}
   else if(Date.now()-XC.gone>8000){XC.st='idle';XC.with=null;XC.id=null;XC.ok=null;XC.gone=0;PV.msg='O outro treinador saiu da troca.';pvpPres({xcSt:'idle',xcWith:null,xcId:null,xcOk:null});R()}
   return;
  }
  XC.gone=0;
  if(XC.ok===XC.id&&p.presence.xcOk===XC.id&&XC.doneId!==XC.id){
   XC.doneId=XC.id;
   const mine=G.xcSel,theirs=p.presence.xcOff;
   if(mine!=null&&G.team[mine]&&theirs&&S[theirs.i|0]){
    const gaveSnap=xc1(G.team[mine]),gave=S[G.team[mine].i].n,got=pvpBuild(theirs),rcv=S[got.i].n;
    G.team[mine]=got;G.xcDone=(G.xcDone||0)+1;save();
    PV.msg=`🔁 Troca concluída! Você deu ${gave} e recebeu ${rcv}.`;
    /* Fase 5 do backend (ver CLAUDE.md): auditoria leve, numa conta Supabase — só registra e confere
       se o Numiu dado realmente existia no save na nuvem; não bloqueia a troca (já aplicada acima). */
    if(SB&&isSbId(ME))xcReport(XC.id,gaveSnap,theirs).catch(()=>{});
   }
   XC.st='idle';XC.with=null;XC.id=null;XC.ok=null;
   G.xcSel=G.team.length?Math.min(G.xcSel??0,G.team.length-1):null;
   pvpPres({xcSt:'idle',xcWith:null,xcId:null,xcOk:null,xcOff:xcOffNow()});R();
  }
  return;
 }
 if(XC.st==='search'&&XC.out){
  /* Mandei um desafio (xcChallenge) e ainda não me pareei — confere se quem eu desafiei já
     aceitou (xcAcceptFrom do outro lado grava xcWith/xcId apontando pra mim). Sem isso, o lado que
     desafia nunca percebia o aceite do outro e a troca nunca fechava (bug achado testando ao vivo
     com dois navegadores: quem aceitava via para 'paired', quem desafiou ficava preso em 'search'
     até o aceitante dar timeout e voltar pra 'idle' sozinho). */
  const p=peerOf(XC.out.to);
  if(p&&p.presence.xc===1&&p.presence.xcWith===mp&&p.presence.xcId===XC.out.bid){
   XC.with=XC.out.to;XC.id=XC.out.bid;XC.st='paired';XC.ok=null;XC.doneId=null;XC.gone=0;XC.out=null;
   pvpPres({xcSt:'paired',xcWith:XC.with,xcId:XC.id,xcOk:null,xcCh:null});R();
  }
  return;
 }
 if(XC.st==='search'&&!XC.out){
  const oth=xcOthers();
  const inc=oth.find(p=>p.presence.xcCh&&p.presence.xcCh.to===mp&&p.presence.xcSt==='search'&&!XC.seen[p.presence.xcCh.bid]);
  if(inc){xcAcceptFrom(inc.peer);return}
  const cand=oth.filter(p=>p.presence.xcSt==='search'&&!(p.presence.xcCh&&p.presence.xcCh.to)&&String(mp)<String(p.peer)).sort((a,b)=>String(a.peer)<String(b.peer)?-1:1)[0];
  if(cand){xcChallenge(cand.peer);return}
 }
}

async function xcReport(tradeId,gave,got){
 try{
  const{data:sess}=await SB.auth.getSession();const tok=sess&&sess.session&&sess.session.access_token;if(!tok)return;
  await fetch(SB_URL+'/functions/v1/trade-report',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify({tradeId,gave,got})});
 }catch(e){}
}
/* ---------- ponte com a tela ---------- */
const XCS={n:'trade',ready:false,sent:false};
function xcMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('xcf');
 if(!f){f=document.createElement('iframe');f.id='xcf';f.className='lgf';f.title='Troca de Numius';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(XCS)}
 if(!XCS.ready&&!XCS.tt){XCS.tt=1;XCS.t=setTimeout(()=>{if(!XCS.ready&&G.screen==='trade'){G.xcfb=1;R()}},12000)}
 xcToggle();
}
function xcData(){
 const mp=myPeer(),partner=XC.with&&peerOf(XC.with),msg=PV.msg||'';if(PV.msg)PV.msg='';
 return{numius:1,k:'xcdata',online:PV.ok===true,st:XC.st,rm:XC.rm||null,done:G.xcDone||0,msg,
  team:G.team.map((m,k)=>({k,i:m.i,n:S[m.i].n,l:m.l,t:S[m.i].t,t2:S[m.i].t2||null})),
  sel:G.xcSel,canOffer:G.team.length>1,
  mine:(G.xcSel!=null&&G.team[G.xcSel])?{i:G.team[G.xcSel].i,n:S[G.team[G.xcSel].i].n,l:G.team[G.xcSel].l}:null,
  partner:XC.with?(partner?{i:partner.presence.xcOff&&partner.presence.xcOff.i,n:partner.presence.xcOff?S[partner.presence.xcOff.i].n:'',l:partner.presence.xcOff&&partner.presence.xcOff.l,nm:String(partner.presence.nm||'Treinador').slice(0,14),ok:partner.presence.xcOk===XC.id}:{n:'',nm:'Treinador',ok:false}):null,
  meOk:XC.ok===XC.id&&!!XC.id,
  players:xcOthers().filter(p=>p.peer!==mp&&!p.presence.xcWith).map(p=>({id:p.peer,nm:String(p.presence.nm||'Treinador').slice(0,14),searching:p.presence.xcSt==='search',off:p.presence.xcOff?S[p.presence.xcOff.i].n:'?'})),
  imgs:XCS.sent?null:(XCS.sent=1,btImgs())};
}
function xcSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('xcf');if(XCS.ready&&f&&f.contentWindow)f.contentWindow.postMessage(xcData(),'*')}
function xcToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('xcf');if(f)f.style.display=(G.screen==='trade'&&!G.xcfb)?'block':'none'}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('xcf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){XCS.ready=true;xcSend()}
 else if(G.screen!=='trade')return;
 else if(d.k==='nav'){xcLeave()}
 else if(d.k==='offer'){xcSelect(d.i|0)}
 else if(d.k==='search'){xcSearch()}
 else if(d.k==='cancel'){xcCancel()}
 else if(d.k==='confirm'){xcConfirm()}
 else if(d.k==='room'){xcRoom(d.op,d.code)}
});
