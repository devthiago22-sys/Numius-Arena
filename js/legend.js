/* Lendários invocáveis + Mochila.
   - Liberados com LGC fragmentos do Boss semanal (G.frag) -> G.leg[id]=1.
   - Em qualquer partida (inclusive PvP) o jogador invoca UM único lendário (escolhe entre os liberados): ação livre.
   - Estado da partida em G.battle.lg: u (usados por lado), lux (campo de Luz), ecl (Eclipse), frz (Paradoxo).
     Lados: 'p' = sua equipe (G.team), 'e' = oponente. Tudo determinístico (o PvP calcula nos dois aparelhos). */
const LGC=60;
const LEG={
 aurelion:{n:'AURELION',t:'Luz',ab:'Reencarnação Pura',ic:'✨',col:'#ffd54a',
  d:'Seus Numius viram tipo Luz e um campo de luz cura 30% dos PS e remove status negativos no fim de cada turno, até o fim da partida. Só se desfaz se o oponente invocar um lendário ou trouxer uma habilidade de campo.'},
 nyxar:{n:'NYXAR',t:'Trevas',ab:'Eclipse das Trevas',ic:'🌑',col:'#a855f7',
  d:'Um eclipse envolve o campo adversário: por 2 turnos os golpes de cada inimigo têm 25% menos potência, seja qual for o alvo.'},
 chronos:{n:'CHRONOS',t:'Cósmico',ab:'Paradoxo Temporal',ic:'🌌',col:'#7dd3fc',
  d:'Paralisa o oponente no tempo por 3 turnos: ele não pode realizar nenhuma ação até o fim desses turnos.'}
};
const LGF=['rei','tsunami']; // habilidades de campo que desfazem a Luz quando entram em campo
const lgHas=id=>!!(G.leg&&G.leg[id]);
function lgUnlock(id){const f=G.frag||(G.frag={});if(!LEG[id]||lgHas(id)||(f[id]|0)<LGC)return false;f[id]-=LGC;(G.leg=G.leg||{})[id]=1;save();return true}
const teamSide=m=>G.team.includes(m)?'p':'e';
const lgS=B=>B.lg||(B.lg={u:{p:{},e:{}},lux:{},luxSeen:{},ecl:{},frz:{}});
/* tipos considerando o campo de Luz (usado por effv) */
function tyOf(m){const B=typeof G!=='undefined'&&G&&G.battle;return B&&B.lg&&B.lg.lux[teamSide(m)]?['Luz']:S[m.i].tt}
const lgAct=(B,s)=>s==='p'?act():B.pvp?B.oq.find(m=>m.hp>0):B.foe;
const lgDone=(B,s)=>!!(B&&B.lg&&Object.keys(B.lg.u[s]).length);
const lgFrz=(B,s)=>!!(B&&B.lg&&B.lg.frz[s]>0);
const lgEcl=(B,m)=>!!(B&&B.lg&&B.lg.ecl[teamSide(m)]>0);
const lgWho=(B,s)=>s==='p'?'Você':B.pvp?B.oname:'O oponente';
const lgTo=(B,s)=>s==='p'?'você':B.pvp?B.oname:'o oponente';
function lgCast(s,id,B){
 const L=lgS(B),o=s==='p'?'e':'p',X=LEG[id],a=lgAct(B,s),oa=lgAct(B,o);L.u[s][id]=1;
 B.log.push(`${X.ic} ${lgWho(B,s)} invocou ${X.n}! ${X.ab}!`);
 if(L.lux[o]){delete L.lux[o];B.log.push(`A Luz de ${lgTo(B,o)} se desfez diante de ${X.n}.`);evp({t:'shield',s:o,txt:'LUZ DESFEITA'})}
 if(id==='aurelion'){L.lux[s]=1;L.luxSeen[s]=oa||null;B.log.push(`✨ ${s==='p'?'Seus Numius agora são':'Os Numius de '+lgTo(B,s)+' agora são'} do tipo Luz, e um campo de luz cobre o ${s==='p'?'seu':'lado deles'}${s==='p'?' lado':''}.`);if(a)evp({t:'buff',s,bu:btBu(a),txt:'✨ TIPO LUZ',col:'#fde68a'})}
 else if(id==='nyxar'){L.ecl[o]=2;B.log.push(`🌑 Um eclipse envolve o campo de ${lgTo(B,o)}: golpes com −25% de potência por 2 turnos.`);if(oa)evp({t:'shield',s:o,txt:'🌑 ECLIPSE −25%'})}
 else if(id==='chronos'){L.frz[o]=3;B.log.push(`🌌 O tempo parou para ${lgTo(B,o)}: paralisado por 3 turnos!`);if(oa)evp({t:'shield',s:o,txt:'⏳ PARALISADO'})}
 lgFx(id,s);
}
/* fim de turno: campo de Luz cura e limpa status; contadores do eclipse e do paradoxo */
function lgEnd(B){
 const L=B&&B.lg;if(!L||B.over)return;
 for(const s of ['p','e']){
  if(L.lux[s]){const o=s==='p'?'e':'p',oa=lgAct(B,o);
   if(oa&&oa!==L.luxSeen[s]&&LGF.includes(PA(oa).k)){delete L.lux[s];B.log.push(`🌋 ${S[oa.i].n} trouxe uma habilidade de campo e desfez a Luz!`);evp({t:'shield',s,txt:'LUZ DESFEITA'});continue}
   const m=lgAct(B,s);if(m&&m.hp>0){const h=Math.min(m.max-m.hp,Math.floor(m.max*.3)),st=AB(m).burn;if(st)AB(m).burn=0;m.hp+=h;
    if(h>0||st){B.log.push(`✨ O campo de luz curou ${S[m.i].n}${h>0?` (+${h} PS)`:''}${st?' e removeu os status negativos':''}.`);evp({t:'buff',s,bu:btBu(m),txt:h>0?'✨ +'+h+' PS':'✨ STATUS LIMPO',col:'#fde68a'})}}}
  if(L.ecl[s]>0&&--L.ecl[s]===0)B.log.push(`🌑 O eclipse sobre ${lgTo(B,s)} se dissipou.`);
  if(L.frz[s]>0&&--L.frz[s]===0)B.log.push(`🌌 O tempo voltou a correr para ${lgTo(B,s)}.`);
 }
}
/* clique no botão: na partida comum invoca na hora; no PvP marca para o turno (vai junto com a jogada) */
function lgUse(id){
 const B=G.battle;if(!B||B.over||!lgHas(id)||B.pick||B.wait||lgOv.on)return;const L=lgS(B);if(lgDone(B,'p'))return;
 if(B.pvp){B.lgP=B.lgP===id?null:id;B.log=[B.lgP?`${LEG[id].ic} ${LEG[id].n} será invocado junto com a sua próxima jogada.`:'Invocação cancelada.'];R();return}
 B.log=[];lgCast('p',id,B);save();lgBarSync();
 const RMx=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;setTimeout(()=>{if(G.battle===B)R()},RMx?1400:2700);
}
/* ---------- interface: coluna de botões na arena ---------- */
function lgBarSync(){
 if(typeof document.getElementById!=='function')return;let el=document.getElementById('lgbar');const B=G.battle,show=G.screen==='battle'&&B&&(!B.over);
 if(!show){if(el)el.style.display='none';return}
 if(!el){el=document.createElement('div');el.id='lgbar';el.setAttribute('role','toolbar');el.setAttribute('aria-label','Lendários');document.body.appendChild(el)}
 el.style.display='flex';const L=lgS(B),f=G.frag||{};
 const done=lgDone(B,'p');
 const btn=Object.keys(LEG).map(id=>{const X=LEG[id],has=lgHas(id),me=!!L.u.p[id],used=done,pend=B.lgP===id,dis=!has||used||B.pick||B.wait;
  const st=!has?`🔒 ${Math.min(f[id]|0,LGC)}/${LGC}`:me?'USADO':used?'BLOQUEADO':pend?'NESTE TURNO':'PRONTO';
  return `<button class="lgb lgimg-${id} ${has?'':'lk'} ${used?'us':''} ${pend?'pd':''}" style="--lc:${X.col}" ${dis?'disabled':''} onclick="lgUse('${id}')" aria-label="${has?(used?(me?X.n+' já foi usado nesta partida':'Você já invocou um lendário nesta partida'):'Invocar '+X.n+': '+X.ab):X.n+' bloqueado: '+Math.min(f[id]|0,LGC)+' de '+LGC+' fragmentos'}" title="${X.n} · ${X.ab}\n${X.d}"><span class=lgt>${X.ic}</span><small>${st}</small></button>`}).join('');
 const ch=[];const nm=s=>s==='p'?'Você':'Oponente';
 for(const s of ['p','e']){if(L.lux[s])ch.push(`<span style="--lc:#fde68a">✨ ${nm(s)}: campo de Luz</span>`);if(L.ecl[s]>0)ch.push(`<span style="--lc:#a855f7">🌑 ${nm(s)}: eclipse ${L.ecl[s]}t</span>`);if(L.frz[s]>0)ch.push(`<span style="--lc:#7dd3fc">⏳ ${nm(s)}: paralisado ${L.frz[s]}t</span>`)}
 el.innerHTML=`<div class=lgh>LENDÁRIOS</div>${btn}${done?'<div class=lgc><span style="--lc:#9ca3af">1 lendário por partida</span></div>':''}${ch.length?`<div class=lgc>${ch.join('')}</div>`:''}`;
}
/* ---------- animação de invocação (sobre a arena) ---------- */
const lgOv={on:0,q:[]};
function lgFx(id,s){lgOv.q.push([id,s]);if(!lgOv.on)lgFxNext()}
function lgFxNext(){
 if(typeof document.createElement!=='function'){lgOv.q=[];return}
 const n=lgOv.q.shift();if(!n){lgOv.on=0;lgBarSync();return}lgOv.on=1;const [id,s]=n,X=LEG[id];
 const d=document.createElement('div');d.className='lgov lgk-'+id;d.style.setProperty('--lc',X.col);d.setAttribute('role','status');
 d.innerHTML=`<div class=lgbg></div><div class=lgfx></div><div class="lgmon lgimg-${id}"></div><div class=lgtx><b>${X.n}</b><span>${X.ic} ${X.ab}</span><small>${s==='p'?'invocado por você':'invocado pelo oponente'}</small></div><div class=lgfl></div>`;
 document.body.appendChild(d);const RMx=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 setTimeout(()=>{d.classList.add('out');setTimeout(()=>{d.remove();lgFxNext()},380)},RMx?1300:2500);
}
/* ---------- Mochila (tela screens/bag.html) ---------- */
const BG={n:'bag',ready:false};
function bgMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('bgf');
 if(!f){f=document.createElement('iframe');f.id='bgf';f.className='lgf';f.title='Mochila';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(BG)}
 if(!BG.ready&&!BG.tt){BG.tt=1;BG.t=setTimeout(()=>{if(!BG.ready&&G.screen==='bag'){G.bgfb=1;R()}},12000)}
 bgToggle();
}
function bgToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('bgf');if(f)f.style.display=(G.screen==='bag'&&!G.bgfb)?'block':'none'}
function bgData(){
 const f=G.frag||{};
 return{numius:1,k:'bgdata',cost:LGC,coins:G.coins||0,vc:G.vc||0,eggs:G.eggs||0,teamFull:G.team.length>=6,
  egg:Object.values(EGG).map(e=>({k:e.k,w:e.w,c:e.c})),
  legs:Object.keys(LEG).map(id=>({id,...LEG[id],fr:f[id]|0,has:lgHas(id)})),
  badges:GY.map((g,k)=>({n:g.n,l:g.l,c:g.c,bd:g.bd,ty:g.ty,got:G.badges.includes(k)})),
  imgs:BG.sent?null:(BG.sent=1,btImgs())}
}
function bgSend(){const f=document.getElementById('bgf');if(BG.ready&&f&&f.contentWindow)f.contentWindow.postMessage(bgData(),'*')}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('bgf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 const post=o=>f.contentWindow.postMessage(Object.assign({numius:1},o),'*');
 if(d.k==='ready'){BG.ready=true;BG.sent=0;bgSend();bgToggle()}
 else if(d.k==='nav'){G.screen=d.to==='boss'?'boss':'map';if(d.to==='boss')G.bsfb=0;R()}
 else if(d.k==='unlock'){const ok=lgUnlock(d.id);post({k:'bgunlock',id:d.id,ok});bgSend()}
 else if(d.k==='hatch'){const r=bsHatch();post({k:'bghatch',...r,eggs:G.eggs||0,imgs:r.i!=null?btImgs():null});bgSend()}
});
