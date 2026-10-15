/* Pontes com as telas em iframe: login, menu, equipe, ginásios, mostruário, PvP, táticas e conta */
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
  TY.forEach(t=>{const e=effv(t,m);if(e>1)fr.push({icon:TE[t],label:t+(e>2?' ×4':'')});else if(e<1)rs.push({icon:TE[t],label:t})});
  if(!EQ.sent[s.fam]){const u=spUrl(s.fam);if(u){imgs[s.fam]=u;EQ.sent[s.fam]=1}}
  const nx=LS(s.fam).find(a=>a[0]>m.l);
  return{id:m.uid,fam:s.fam,px:0,nome:s.n,nivel:m.l,tipos:[s.t,s.t2].filter(Boolean),tipoIcons:[s.t,s.t2].filter(Boolean).map(ic),tipoColor:TCOL[s.t]||'#2a9d5a',
   hp:m.hp,hpMax:m.max,fraco:fr,resiste:rs,habilidade:PA(m).n,habilidadeDesc:pdesc(m),
   evolucao:s.x!==undefined?'Nv '+(s.s===1?16:36)+' → '+S[s.x].n:'forma final',first:i===act,
   moves:moves(m).map((x,j)=>({id:'k'+j+'_'+x.n,nome:x.n,tipo:x.t,icon:ic(x.t),poder:x.p,cc:m.pp?m.pp[j]:x.pp,ccMax:x.pp,stab:x.t===s.t,
    desc:x.x==='dr'?'Drena PS: recupera 40% do dano causado.':x.x==='cr'?'Sempre causa dano crítico (+50%).':'Golpe do tipo '+x.t+(x.t===s.t?' — recebe bônus de tipo (STAB).':'.')})),
   proximoGolpe:nx?{nome:MOVES[nx[1]].n,nivel:nx[0]}:{nome:'',nivel:m.l,fim:1}}});
 return{numius:1,k:'team',team,imgs}
}
function eqSend(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('eqf');if(EQ.ready&&f&&f.contentWindow&&G.team.length)f.contentWindow.postMessage(eqData(),'*')}
function eqToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('eqf');if(f)f.style.display=(G.screen==='team'&&!G.efb)?'block':'none'}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('eqf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 if(d.k==='ready'){EQ.ready=true;EQ.sent={};eqSend()}
 else if(G.screen!=='team')return;
 else if(d.k==='nav'&&d.to==='map'){G.screen='map';R()}
 else if(d.k==='cfg')openCfg()
 else if(d.k==='mv'){const i=G.team.findIndex(m=>m.uid===d.id);if(i>=0&&(d.d===1||d.d===-1))mvUp(i,d.d)}});
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
  const s=S[i],o=d.includes(i),f=s.fam;
  if(!DXS.sent[f]){const u=spUrl(f);if(u){imgs[f]=u;DXS.sent[f]=1}}
  const e={id:k+1,fam:f,px:0,family:s.ps?'Única':'F'+s.s,discovered:o,name:o?s.n:'???',realName:o?s.n:'???',types:[],cells:[],desc:''};
  if(o){
   const {w,r}=wk({i}),evo=s.x!==undefined?'Nv '+(s.s===1?16:36)+' → '+S[s.x].n:'Forma final',pd=pdesc({i}),ab=FAM[f][7][0];
   e.types=[s.t,s.t2].filter(Boolean);
   e.desc='Habilidade '+ab+': '+pd+'.';
   e.cells=[['Tipo',e.types.join(' · ')],['Forma',s.ps?'Única':'Forma '+s.s],['Evolução',evo],['Habilidade',ab],['PS base',String(s.h)],['Ataque base',String(s.a)],['Fraco contra',w.join(' · ')||'—',1],['Resiste a',r.join(' · ')||'—',1],['Golpes',LS(f).map(([lv,m])=>(lv===1?'Inicial':'Nv '+lv)+' '+MOVES[m].n).join(' · '),1]];
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
function mnData(){const nb=G.badges.length,dx=(G.dex||[]).length;return{name:G.hero?String(G.hero.name):(ME||'Convidado'),coins:G.coins||0,guest:!ME,sub:ME?'conectado':'sem salvar',bl:['Pd','Ag','El','Pl','Ge','Vo','Ps','Fo'],bc:GY.map(g=>ARENA[g.ty][1]),be:GY.map((g,i)=>G.badges.includes(i)),bn:GY.map(g=>g.n),cnt:{gyms:nb+'/8',tac:'8',team:G.team.length+'/6',numios:''+dx,dex:dx+'/'+DEX.length,train:''+(G.vc||0)}}}
const NAV={gyms:()=>{G.screen='gyms';R()},tac:()=>{G.screen='tac';R()},team:()=>{G.screen='team';R()},numios:()=>{G.screen='numios';R()},dex:()=>{G.screen='dex';R()},pvp:()=>pvpOpen(),train:()=>{G.screen='train';R()},heal:()=>goHeal(),cfg:()=>openCfg(),exit:()=>quitGame()};
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
