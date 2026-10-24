function lgMount(){const f=$('#lgf');if(!f||!f.dataset||f.dataset.m)return;f.dataset.m=1;LG.ready=false;f.srcdoc=dec(LG);clearTimeout(LG.t);LG.t=setTimeout(()=>{if(!LG.ready&&G.screen==='auth'){G.fb=1;G.tp=2;G.mode='in';R()}},6000)}
function lgErr(m){const f=$('#lgf');if(f&&f.contentWindow)f.contentWindow.postMessage({numius:1,k:'err',msg:m},'*')}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=$('#lgf');if(!f||!f.contentWindow||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;if(d.k==='ready')LG.ready=true;else if(d.k==='login')authCore(false,d.id,d.pw);else if(d.k==='signup')authCore(true,d.id,d.pw,d.em,d.p2);else if(d.k==='guest')guest()});
function mnMount(){
 if(typeof document.createElement!=='function')return;
 const f=iw('mnf',MN,'Menu principal');
 if(MN.ready&&f.contentWindow)f.contentWindow.postMessage({numius:1,k:'data',d:mnData()},'*');
 else if(!MN.ready&&!MN.tt&&G.screen==='map'){MN.tt=1;MN.t=setTimeout(()=>{if(!MN.ready&&G.screen==='map'){G.mfb=1;R()}},9000)}
 mnToggle();
}
const EQ={n:'team',ready:false,sent:{},c:{}};
function eqMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('eqf');
 if(!f){f=document.createElement('iframe');f.id='eqf';f.className='lgf';f.title='Equipe';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(EQ)}
 if(!EQ.ready&&!EQ.tt){EQ.tt=1;EQ.t=setTimeout(()=>{if(!EQ.ready&&G.screen==='team'){G.efb=1;R()}},12000)}
 eqToggle();
}
function spUrl(f){if(EQ.c[f]!==undefined)return EQ.c[f];const e=document.createElement('i');e.className='f'+f;e.style.cssText='position:absolute;width:1px;height:1px;opacity:0';document.body.appendChild(e);const v=getComputedStyle(e).backgroundImage;e.remove();const m=/url\(["']?(.*?)["']?\)$/.exec(v);return EQ.c[f]=m?m[1]:''}
const TCOL={Fogo:'#FF6B35',Água:'#00B4D8',Planta:'#2a9d5a',Elétrico:'#e0b92b',Pedra:'#8d6e63',Gelo:'#5cc8f0',Psíquico:'#b060e0',Voador:'#7ec8ff',Dragão:'#7c4dff',Normal:'#9aa0a6'};
function eqData(){
 const ic=t=>t==='Dragão'?'🐉':t==='Normal'?'◎':TE[t]||'⚪',imgs={},act=G.team.findIndex(m=>m.hp>0);
 const team=G.team.map((m,i)=>{
  m.uid=m.uid||Math.random().toString(36).slice(2,9);
  const s=S[m.i],fr=[],rs=[];
  TYX.forEach(t=>{const e=effv(t,m);if(e>1)fr.push({icon:TE[t],label:t+(e>2?' ×4':'')});else if(e<1)rs.push({icon:TE[t],label:t})});
  if(!EQ.sent[m.i]){const u=spUrl(m.i);if(u){imgs[m.i]=u;EQ.sent[m.i]=1}}
  const nx=LS(s.fam).find(a=>a[0]>m.l);
  return{id:m.uid,fam:m.i,px:0,nome:s.n,nivel:m.l,tipos:[s.t,s.t2].filter(Boolean),tipoIcons:[s.t,s.t2].filter(Boolean).map(ic),tipoColor:TCOL[s.t]||'#2a9d5a',
   hp:m.hp,hpMax:m.max,fraco:fr,resiste:rs,habilidade:PA(m).n,habilidadeDesc:pdesc(m),
   evolucao:s.x!==undefined?'Nv '+(s.s===1?16:36)+' → '+S[s.x].n:'forma final',attrs:[['PS',m.max],['ATQ',m.a],['ATQ.M',m.sa],['DEF',m.d],['DEF.M',m.sd],['VEL',m.sp]],first:i===act,
   moves:moves(m).map((x,j)=>({id:'k'+j+'_'+x.n,nome:x.n,tipo:x.t,icon:ic(x.t),poder:x.p,cc:m.pp?m.pp[j]:x.pp,ccMax:x.pp,stab:x.t===s.t||x.t===s.t2,
    desc:x.x==='def'?'O dano é calculado com a Defesa de quem usa, em vez do Ataque.':x.x==='dr'?'Drena PS: recupera 40% do dano causado.':x.x==='cr'?'Sempre causa dano crítico (+50%).':'Golpe do tipo '+x.t+(x.t===s.t?' — recebe bônus de tipo (STAB).':'.')})),
   proximoGolpe:nx?{nome:MOVES[nx[1]].n,nivel:nx[0]}:{nome:'',nivel:m.l,fim:1}}});
 return{numius:1,k:'team',team,imgs,legs:{sel:lgSel(),cost:LGC,list:Object.keys(LEG).map(id=>({id,n:LEG[id].n,ab:LEG[id].ab,ic:LEG[id].ic,col:LEG[id].col,t:LEG[id].t,d:LEG[id].d,has:lgHas(id),fr:(G.frag||{})[id]|0}))}}
}
function eqSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('eqf');if(EQ.ready&&f&&f.contentWindow&&G.team.length)f.contentWindow.postMessage(eqData(),'*')}
function eqToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('eqf');if(f)f.style.display=(G.screen==='team'&&!G.efb)?'block':'none'}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('eqf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){EQ.ready=true;EQ.sent={};eqSend()}
 else if(G.screen!=='team')return;
 else if(d.k==='nav'&&d.to==='map'){G.screen='map';R()}
 else if(d.k==='cfg')openCfg()
 else if(d.k==='mv'){const i=G.team.findIndex(m=>m.uid===d.id);if(i>=0&&(d.d===1||d.d===-1))mvUp(i,d.d)}
 else if(d.k==='leg'){if(d.id===null||lgHas(d.id)){G.legSel=d.id||null;save()}eqSend()}});
const GM={n:'gyms',ready:false};
function gyMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('gyf');
 if(!f){f=document.createElement('iframe');f.id='gyf';f.className='lgf';f.title='Ginásios';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(GM)}
 if(!GM.ready&&!GM.tt){GM.tt=1;GM.t=setTimeout(()=>{if(!GM.ready&&G.screen==='gyms'){G.gfb=1;R()}},12000)}
 gyToggle();
}
function gyData(){const n=Math.min(6,G.team.length);return{numius:1,k:'gyms',conq:G.badges.map(i=>i+1),list:GY.map((g,i)=>({id:i+1,name:g.c.toUpperCase(),subtitle:GYX[i].bio,type:g.ty.toUpperCase(),badge:g.n.replace('Insígnia ','').toUpperCase(),level:g.t[0][1],count:n,leader:g.l,emoji:GYX[i].e}))}}
function gySend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('gyf');if(GM.ready&&f&&f.contentWindow)f.contentWindow.postMessage(gyData(),'*')}
function gyToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('gyf');if(f)f.style.display=(G.screen==='gyms'&&!G.gfb)?'block':'none'}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('gyf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){GM.ready=true;gySend()}
 else if(G.screen!=='gyms')return;
 else if(d.k==='nav'&&d.to==='map'){G.screen='map';R()}
 else if(d.k==='gym'){const i=(d.id|0)-1;if(i<0||i>=GY.length||i>G.badges.length||!G.team.length)return;if(!G.team.some(m=>m.hp>0)){goHeal();return}gym(i)}});
const TR={n:'train',ready:false};
function trMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('trf');
 if(!f){f=document.createElement('iframe');f.id='trf';f.className='lgf';f.title='Treinamento';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(TR)}
 if(!TR.ready&&!TR.tt){TR.tt=1;TR.t=setTimeout(()=>{if(!TR.ready&&G.screen==='train'){G.trfb=1;R()}},12000)}
 trToggle();
}
function trData(){
 const best=G.vbest||0,sel=Math.max(1,Math.min(G.vsel||G.vn||1,best+1));
 return{numius:1,k:'trdata',vc:G.vc||0,vbest:best,vsel:sel,
  team:G.team.map((m,i)=>({idx:i,i:m.i,n:S[m.i].n,e:S[m.i].e,l:m.l,t:S[m.i].t,t2:S[m.i].t2||null,
   st:STK.map(s=>({k:s,n:STN[s],v:s==='h'?m.max:m[s],iv:m.iv[s]==null?15:m.iv[s],ev:m.ev[s]||0}))})),
  phases:VPH.map((p,k)=>({id:k+1,nome:p.nome,rival:p.rival,e:p.e,nivel:p.nivel,tatica:p.tatica,numios:p.numios,r:p.r,cor:p.cor,locked:k+1>best+1})),
  imgs:TR.sent?null:(TR.sent=1,btImgs())};
}
function trSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('trf');if(TR.ready&&f&&f.contentWindow)f.contentWindow.postMessage(trData(),'*')}
function trToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('trf');if(f)f.style.display=(G.screen==='train'&&!G.trfb)?'block':'none'}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('trf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){TR.ready=true;TR.sent=0;trSend()}
 else if(G.screen!=='train')return;
 else if(d.k==='nav'){G.screen='map';R()}
 else if(d.k==='ev'){const i=d.i|0;if(G.team[i]&&STK.includes(d.s))trEV(i,d.s)}
 else if(d.k==='iv'){const i=d.i|0;if(G.team[i]&&STK.includes(d.s))trIV(i,d.s)}
 else if(d.k==='fight'){const n=d.n|0;if(n>=1&&n<=(G.vbest||0)+1&&G.team.length){if(!G.team.some(m=>m.hp>0)){goHeal();return}vstart(n)}}});
const TW={n:'tower',ready:false};
function twMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('twf');
 if(!f){f=document.createElement('iframe');f.id='twf';f.className='lgf';f.title='Torre de Gelo';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(TW)}
 if(!TW.ready&&!TW.tt){TW.tt=1;TW.t=setTimeout(()=>{if(!TW.ready&&G.screen==='tower'){G.twfb=1;R()}},12000)}
 twToggle();
}
function twData(){
 const best=G.twBest||0;
 return{numius:1,k:'twdata',coins:G.coins||0,best,
  floors:Array.from({length:30},(_,k)=>{const f=twFloor(k+1);return{id:f.floor,tier:f.tier,icon:f.icon,neon:f.neon,trainer:f.trainer,cnt:f.cnt,reward:f.reward,boss:f.boss,spi:f.spi,spn:f.spn,locked:f.floor>best+1}}),
  imgs:TW.sent?null:(TW.sent=1,btImgs())};
}
function twSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('twf');if(TW.ready&&f&&f.contentWindow)f.contentWindow.postMessage(twData(),'*')}
function twToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('twf');if(f)f.style.display=(G.screen==='tower'&&!G.twfb)?'block':'none'}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('twf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){TW.ready=true;TW.sent=0;twSend()}
 else if(G.screen!=='tower')return;
 else if(d.k==='nav'){G.screen='map';R()}
 else if(d.k==='fight'){const n=d.n|0;if(n>=1&&n<=30&&n<=(G.twBest||0)+1&&G.team.length){if(!G.team.some(m=>m.hp>0)){goHeal();return}twStart(n)}}});
const DXS={n:'dex',ready:false,sent:{}};
function dxMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('dxf');
 if(!f){f=document.createElement('iframe');f.id='dxf';f.className='lgf';f.title='Mostruário';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(DXS)}
 if(!DXS.ready&&!DXS.tt){DXS.tt=1;DXS.t=setTimeout(()=>{if(!DXS.ready&&G.screen==='dex'){G.xfb=1;R()}},12000)}
 dxToggle();
}
function dxData(){
 const d=G.dex||[],imgs={};
 const list=DEX.map((i,k)=>{
  const s=S[i],o=d.includes(i),f=i;
  if(!DXS.sent[f]){const u=spUrl(f);if(u){imgs[f]=u;DXS.sent[f]=1}}
  const e={id:k+1,fam:f,px:0,family:s.ps?'Única':'F'+s.s,discovered:o,name:o?s.n:'???',realName:o?s.n:'???',types:[],cells:[],desc:''};
  if(o){
   const {w,r}=wk({i}),evo=s.x!==undefined?'Nv '+(s.s===1?16:36)+' → '+S[s.x].n:'Forma final',pd=pdesc({i}),ab=S[i].ab[0];
   e.types=[s.t,s.t2].filter(Boolean);
   e.desc='Habilidade '+ab+': '+pd+'.';
   e.cells=[['Tipo',e.types.join(' · ')],['Forma',s.ps?'Única':'Forma '+s.s],['Evolução',evo],['Habilidade',ab],['PS base',String(s.h)],['Ataque',String(s.a)],['Atq. Mágico',String(s.sa)],['Defesa',String(s.d)],['Def. Mágica',String(s.sd)],['Velocidade',String(s.sp)],['Fraco contra',w.join(' · ')||'—',1],['Resiste a',r.join(' · ')||'—',1],['Golpes',LS(s.fam).map(([lv,m])=>(lv===1?'Inicial':'Nv '+lv)+' '+MOVES[m].n).join(' · '),1]];
  }
  return e});
 return{numius:1,k:'dex',list,imgs}
}
function dxSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('dxf');if(DXS.ready&&f&&f.contentWindow)f.contentWindow.postMessage(dxData(),'*')}
function dxToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('dxf');if(f)f.style.display=(G.screen==='dex'&&!G.xfb)?'block':'none'}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('dxf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){DXS.ready=true;DXS.sent={};dxSend()}
 else if(G.screen!=='dex')return;
 else if(d.k==='nav'&&d.to==='map'){G.screen='map';R()}});
const PVS={n:'pvp',ready:false};
const pvOthers=()=>PV.peers.filter(p=>!p.sameTab&&p.kind==='viewer'&&p.presence&&p.presence.pv===1&&((p.presence.rm||null)===(PV.rm||null)));
function pvMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('pvf');
 if(!f){f=document.createElement('iframe');f.id='pvf';f.className='lgf';f.title='PvP online';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(PVS)}
 if(!PVS.ready&&!PVS.tt){PVS.tt=1;PVS.t=setTimeout(()=>{if(!PVS.ready&&G.screen==='pvp'){G.pfb=1;R()}},12000)}
 pvToggle();
}
function pvData(){
 const mp=myPeer(),others=pvOthers(),q=pv0(),h=G.hero||{name:'Treinador'};
 const ent=p=>{const x=p.presence;return{id:p.peer,name:String(x.nm||'Rival').slice(0,14),level:(x.lv|0)||Math.max(1,...(x.tm||[]).map(c=>c.l|0)),badges:x.bd|0,team:(x.tm||[]).slice(0,3).map(c=>S[c.i]?(TE[S[c.i].t]||'⚪'):'⚪'),wins:x.wn|0,status:x.st==='battle'?'em duelo':x.st==='search'?'procurando':'online',avatar:String(x.nm||'R')[0].toUpperCase(),color:COLS[x.col|0]||COLS[0]}};
 const inc=others.filter(p=>p.presence.ch&&p.presence.ch.to===mp&&['idle','search'].includes(p.presence.st)&&!PV.seen[p.presence.ch.bid]).map(p=>({...ent(p),bid:p.presence.ch.bid}));
 const op=PV.out&&peerOf(PV.out.to);
 const msg=PV.msg||'';PV.msg='';
 return{numius:1,k:'pvp',online:PV.ok===true,me:{name:String(h.name),level:Math.max(1,...G.team.map(m=>m.l)),badges:G.badges.length,lp:q.lp|0,w:q.w|0,l:q.l|0},players:others.map(ent),incoming:PV.search?[]:inc,out:op?ent(op):(PV.out?{name:'Rival',level:0,badges:0,color:'#ff6b9d',avatar:'?'}:null),searching:!!PV.search,room:PV.rm||null,share:String(location.href).split('#')[0],msg}
}
function pvSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('pvf');if(PVS.ready&&f&&f.contentWindow)f.contentWindow.postMessage(pvData(),'*')}
function pvToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('pvf');if(f)f.style.display=(G.screen==='pvp'&&!G.pfb)?'block':'none'}
function pvpSearch(on){if(!PV.ok)return;PV.search=!!on;clearTimeout(PV.st);if(on){PV.st=setTimeout(()=>{if(PV.search){PV.search=false;PV.msg='Nenhum oponente encontrado agora.';pvpPres({st:'idle'});if(G.screen==='pvp')R()}},90000)}pvpPres({st:on?'search':'idle'});if(on)pvpOnPeers();else R()}
function pvpRoom(op,code){if(!PV.ok)return;if(op==='create'){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=n=>Array.from({length:n},()=>A[Math.floor(Math.random()*A.length)]).join('');PV.rm=r(4)+'-'+r(4)}else if(op==='join'){const c=String(code||'').trim().toUpperCase();if(!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)){PV.msg='Código inválido. Use o formato XXXX-XXXX.';R();return}PV.rm=c}else if(op==='leave')PV.rm=null;PV.search=false;PV.out=null;pvpPres({rm:PV.rm||null,ch:null,st:'idle'});R()}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('pvf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){PVS.ready=true;pvSend()}
 else if(G.screen!=='pvp')return;
 else if(d.k==='nav'&&d.to==='map')pvpLeave()
 else if(d.k==='cfg')openCfg()
 else if(d.k==='challenge'){const p=peerOf(d.id);if(p&&p.presence&&p.presence.st==='idle'&&!PV.out&&PV.ok)pvpChallenge(d.id)}
 else if(d.k==='accept'){const p=peerOf(d.id);if(p&&p.presence&&p.presence.ch&&p.presence.ch.to===myPeer())pvpAccept(d.id)}
 else if(d.k==='decline'){if(typeof d.bid==='string')pvpDecline(d.bid)}
 else if(d.k==='cancel')pvpCancel()
 else if(d.k==='search')pvpSearch(!!d.on)
 else if(d.k==='room')pvpRoom(d.op,d.code)});
const BT={n:'battle',ready:false,seq:0,sent:false};
function btMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('btf');
 if(!f){f=document.createElement('iframe');f.id='btf';f.className='lgf';f.title='Batalha';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(BT)}
 if(!BT.ready&&!BT.tt){BT.tt=1;BT.t=setTimeout(()=>{if(!BT.ready&&G.screen==='battle'){G.btfb=1;R()}},12000)}
 btToggle();
}
function btToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('btf');if(f)f.style.display=(G.screen==='battle'&&!G.btfb)?'block':'none'}
function btCu(c){BT.c=BT.c||{};if(BT.c[c]!==undefined)return BT.c[c];const e=document.createElement('i');e.className=c;e.style.cssText='position:absolute;width:1px;height:1px;opacity:0';document.body.appendChild(e);const v=getComputedStyle(e).backgroundImage;e.remove();const m=/url\(["']?(.*?)["']?\)$/.exec(v);return BT.c[c]=m?m[1]:''}
function btImgs(){const o={};S.forEach((s,i)=>{o['f'+i]=btCu('f'+i);if(s.b)o['b'+i]=btCu('b'+i)});return o}
function btData(){
 const B=G.battle,p=act()||G.team[0],mv=moves(p);
 const title=B.vt?'Batalha Virtuosa — Fase '+B.vt:B.tw?'Torre de Gelo — Andar '+B.tw:B.pvp?'PvP: '+B.oname:B.tt?'Batalha tática: '+B.tt:B.wild?'Batalha selvagem':GY[B.gym].c;
 let overText='';
 if(B.over)overText=B.pvp?(B.over==='win'?'Você venceu o duelo!':'Você perdeu o duelo.'):({win:'Você venceu a batalha!',lose:'Você perdeu… voltando ao Centro de cura.',fled:'Você escapou com segurança.',caught:'Um novo monstrinho entrou na sua equipe!',quit:'A desistência foi registrada.'})[B.over]||'';
 return{title,wild:!!B.wild,over:B.over||null,overText,
  moves:mv.map((m,k)=>({n:m.n,t:m.t,c:m.c||'f',p:m.p,pp:p.pp?p.pp[k]:m.pp,max:m.pp,M:effv(m.t,B.foe)})),
  struggle:!!(p.pp&&mv.every((m,k)=>p.pp[k]<=0)),pick:!!B.pick,wait:!!B.wait,
  team:G.team.map((m,i)=>({i,n:S[m.i].n,l:m.l,hp:m.hp,max:m.max,fa:m.hp<=0,act:m===p})),
  log:B.log.slice(),p:btSnap(p),e:btSnap(B.foe)}
}
function btSend(){
 if(typeof document.getElementById!=='function')return;const f=document.getElementById('btf'),B=G.battle;
 if(!BT.ready||!f||!f.contentWindow||!B)return;
 const evs=(B.ev||[]).splice(0);
 f.contentWindow.postMessage({numius:1,k:'bstate',seq:++BT.seq,st:btData(),evs},'*');
 if((B.over==='win'||B.over==='lose')&&!B.sfx){B.sfx=1;try{sfx(B.over==='win',Math.min(5,evs.length*.9+.4))}catch(e){}}
}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('btf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){BT.ready=true;f.contentWindow.postMessage({numius:1,k:'bimgs',imgs:btImgs()},'*');btSend()}
 else if(d.k==='bact'&&G.screen==='battle'&&G.battle){const B=G.battle;
  if(d.a==='end'){if(B.over)end()}
  else if(B.over)return;
  else if(d.a==='move'){if(!B.wait&&!B.pick)turn(d.i|0)}
  else if(d.a==='swap')swap()
  else if(d.a==='swapTo')swapTo(d.i|0)
  else if(d.a==='cancelPick'){B.pick=false;R()}
  else if(d.a==='cap'&&B.wild)cap()
  else if(d.a==='flee'&&B.wild)flee()
  else if(d.a==='leave')leave()}});
const TB={n:'tactical'};
function tbMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('tbf');
 if(!f){f=document.createElement('iframe');f.id='tbf';f.className='lgf';f.title='Batalhas táticas';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(TB)}
 let x=document.getElementById('tbx');
 if(!x){x=document.createElement('button');x.id='tbx';x.textContent='✕ Mapa';x.setAttribute('aria-label','Voltar ao mapa');x.style.cssText='position:fixed;right:10px;top:calc(10px + env(safe-area-inset-top,0px));z-index:60;min-height:36px;padding:6px 12px;font-size:13px;display:none';x.onclick=()=>{G.screen='map';R()};document.body.appendChild(x)}
 tbToggle();
}
const TBMAP={fogo:'Fogo',agua:'Água',terra:'Pedra',grama:'Planta',eletrico:'Elétrico',gelo:'Gelo',psiquico:'Psíquico',inseto:'Voador'};
function tbData(){const L=Math.max(5,(G.team[0]||{l:5}).l);return{numius:1,k:'data',t:Object.keys(TBMAP).map(k=>{const T=(G.tac&&G.tac[TBMAP[k]])||{w:0};return{tipo:k,derrotas:T.w||0,tatic:TN[Math.min(3,T.w||0)],nivel:L}})}}
function tbSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('tbf');if(TB.ready&&f&&f.contentWindow)f.contentWindow.postMessage(tbData(),'*')}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('tbf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){TB.ready=true;tbSend()}
 else if(d.k==='nav'&&d.to==='map'){G.screen='map';R()}
 else if(d.k==='tac'&&G.screen==='tac'){const ty=TBMAP[d.tipo];if(!ty||!G.team.length)return;if(!G.team.some(m=>m.hp>0)){goHeal();return}tac(ty)}});
function tbToggle(){if(typeof document.getElementById!=='function')return;const on=G.screen==='tac',f=document.getElementById('tbf'),x=document.getElementById('tbx');if(f)f.style.display=on?'block':'none';if(x)x.style.display=on?'block':'none'}
function mnToggle(){if(typeof document.getElementById!=='function')return;ifv(document.getElementById('mnf'),G.screen==='map'&&!G.mfb,MN)}
function mnData(){const nb=G.badges.length,dx=(G.dex||[]).length;return{lv:Math.max(1,...G.team.map(m=>m.l)),isl:{vale:Math.min(100,(G.vbest||0)*10),cristal:Math.round((G.twBest||0)/30*100),canion:Math.min(100,Math.round((G.xcDone||0)/10*100)),porto:Math.min(100,Math.round(sfState().mo/MSDAY*100))},name:G.hero?String(G.hero.name):(ME||'Convidado'),coins:G.coins||0,guest:!ME,sub:ME?'conectado':'sem salvar',bl:['Pd','Ag','El','Pl','Ge','Vo','Ps','Fo'],bc:GY.map(g=>ARENA[g.ty][1]),be:GY.map((g,i)=>G.badges.includes(i)),bn:GY.map(g=>g.n),cnt:{gyms:nb+'/8',tac:'8',team:G.team.length+'/6',dex:dx+'/'+DEX.length,bag:''+(Object.keys(G.leg||{}).length+'/3'),missoes:''+msCount()}}}
const NAV={gyms:()=>{G.screen='gyms';R()},tac:()=>{G.screen='tac';R()},team:()=>{G.screen='team';R()},dex:()=>{G.screen='dex';R()},pvp:()=>pvpOpen(),boss:()=>{G.screen='boss';G.bsfb=0;R()},bag:()=>{G.screen='bag';G.bgfb=0;R()},safari:()=>{G.screen='safari';G.sffb=0;R()},missoes:()=>{G.screen='missions';G.msfb=0;R()},train:()=>{G.screen='train';G.trfb=0;R()},tower:()=>{G.screen='tower';G.twfb=0;R()},trade:()=>xcOpen(),heal:()=>goHeal(),cfg:()=>openCfg(),exit:()=>quitGame()};
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=$('#mnf');if(!f||!f.contentWindow||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;if(d.k==='ready'){MN.ready=true;f.contentWindow.postMessage({numius:1,k:'data',d:mnData()},'*');mnToggle()}else if(d.k==='nav'&&NAV[d.to])NAV[d.to]()});
async function authCore(up,id,pw,em,p2){
 id=String(id||'').trim().toLowerCase();em=String(em||'').trim();pw=String(pw||'');p2=String(p2||'');const u=U();let err='';
 if(!/^[a-z0-9_]{3,20}$/.test(id))err='O nome deve ter de 3 a 20 letras minúsculas, números ou _.';
 else if(up&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))err='Digite um e-mail válido.';
 else if(up&&pw.length<6)err='A senha precisa ter pelo menos 6 caracteres.';
 else if(up&&pw!==p2)err='As senhas não coincidem.';
 else if(up&&u[id])err='Esse nome de treinador já está em uso.';
 else if(up&&Object.values(u).some(x=>x.email===em.toLowerCase()))err='Esse e-mail já está cadastrado.';
 else if(!up&&!u[id])err='Treinador não encontrado. Toque em CRIAR CONTA.';
 else{
  try{
   if(up){const s=rb();let old=null;try{old=JSON.parse(localStorage.getItem('mon-save'));localStorage.removeItem('mon-save')}catch(e){}u[id]={email:em.toLowerCase(),salt:s,hash:await H(pw,s),data:old};setU(u)}
   else if(await H(pw,u[id].salt)!==u[id].hash)err='Senha incorreta.';
   if(!err){ME=id;try{localStorage.setItem('mon-session',id)}catch(e){}enter();return ''}
  }catch(e){err='Não foi possível concluir. Tente novamente.'}
 }
 lgErr(err);return err;
}
