const $=s=>document.querySelector(s),rnd=n=>Math.floor(Math.random()*n);
let G={team:[],badges:[],screen:'auth',mode:'in',battle:null};
let hasSave=false;

function save(){if(!ME||G.rt)return;try{const u=U();if(u[ME]){u[ME].data={team:G.team,badges:G.badges,coins:G.coins||0,tac:G.tac||{},pv:G.pvp||null,dex:G.dex||[],hero:G.hero||null,vc:G.vc||0,vn:G.vn||1,vbest:G.vbest||0,v:5};setU(u)}}catch(e){}}
const H=async(p,s)=>{const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(p),'PBKDF2',false,['deriveBits']);const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(atob(s),c=>c.charCodeAt(0)),iterations:100000,hash:'SHA-256'},k,256);return btoa(String.fromCharCode(...new Uint8Array(b)))};
const U=()=>{try{return JSON.parse(localStorage.getItem('mon-users'))||{}}catch(e){return{}}};
const setU=u=>{try{localStorage.setItem('mon-users',JSON.stringify(u))}catch(e){}};
let ME=null;
function load(){try{const d=U()[ME].data;if(d.v!==5){G={team:[],badges:[],coins:0,screen:d.hero?'start':'hero',battle:null,hero:d.hero||null,note:'🌍 O mundo mudou! Os iniciais agora evoluem em 3 formas. Escolha o seu parceiro.'};R();return}if(d.v===2)d.team.forEach(m=>{delete m.mv});G.team=d.team;G.team.forEach(m=>{if(!m.pp||!m.mv||!m.mv.length){m.mv=initMoves(m.i,m.l);m.pp=m.mv.map(k=>MOVES[k].pp)}});G.badges=d.badges;G.coins=d.coins||0;G.vc=d.vc||0;G.vn=d.vn||1;G.vbest=d.vbest||0;G.tac=d.tac||{};G.pvp=d.pv||null;G.team.forEach(calc);G.team.forEach(m=>{const ni=form(m.i,m.l);if(ni!==m.i){m.i=ni;calc(m);m.hp=m.max}});G.dex=d.dex||[];G.dex.slice().forEach(reg);G.team.forEach(m=>reg(m.i));G.hero=d.hero||null;G.screen=G.hero?'map':'hero';R()}catch(e){}}
const STK=['h','a','sa','d','sd','sp'];
function calc(m){const iv=m.iv||(m.iv={}),ev=m.ev||(m.ev={}),s=S[m.i],L=m.l,I=k=>iv[k]==null?15:iv[k],E=k=>(ev[k]||0)>>2;
 m.max=Math.floor(s.h*L/12)+L+10+Math.floor((I('h')+E('h'))*L/50);
 m.a=Math.floor(s.a*L/50)+5+Math.floor((I('a')+E('a'))*L/100);
 m.sa=Math.floor(s.sa*L/50)+5+Math.floor((I('sa')+E('sa'))*L/100);
 m.d=Math.floor(s.d*(L+5)/60)+Math.floor((I('d')+E('d'))*L/100);
 m.sd=Math.floor(s.sd*(L+5)/60)+Math.floor((I('sd')+E('sd'))*L/100);
 m.sp=Math.floor(s.sp*L/50)+5+Math.floor((I('sp')+E('sp'))*L/100)}
function reg(i){G.dex=G.dex||[];while(i!==undefined){if(!G.dex.includes(i))G.dex.push(i);i=PREV[i]}}
function form(i,l){let s=S[i];while(s.x!==undefined&&((s.s===1&&l>=16)||(s.s===2&&l>=36))){i=s.x;s=S[i]}return i}
function evo(m){const ni=form(m.i,m.l);if(ni!==m.i){const o=S[m.i].n;m.i=ni;reg(ni);G.battle.evoF=1;calc(m);m.hp=m.max;G.battle.log.push(`✨ ${o} evoluiu para ${S[ni].n}!`);evp({t:'evolve',mon:btSnap(m)})}}
function mk(i,l){const m={i:form(i,l),l,xp:0,iv:{h:rnd(32),a:rnd(32),sa:rnd(32),d:rnd(32),sd:rnd(32),sp:rnd(32)},ev:{h:0,a:0,sa:0,d:0,sd:0,sp:0}};calc(m);m.hp=m.max;m.mv=initMoves(m.i,l);m.pp=m.mv.map(k=>MOVES[k].pp);return m}
const moves=m=>(m.mv||defMv(m)).map(k=>{const x=MOVES[k];return x.f!==undefined?{...x,p:mp(x,m)}:x});
const mult=(a,d)=>a==='Normal'?1:SE[a].includes(d)?2:NV[a].includes(d)?.5:1;
const act=()=>G.team.find(m=>m.hp>0);
const bar=m=>{const r=m.hp/m.max;return `<div class=bar><i style="width:${100*r}%;background:${r>.5?'var(--acc)':r>.2?'var(--warn)':'var(--bad)'}"></i></div>`};
const card=(m,c='')=>`<div class="card mon ${c}"><span class=sp>${S[m.i].e}</span><div><b>${S[m.i].n}</b> <small>Nv ${m.l} · ${S[m.i].t}</small>${bar(m)}<small>${m.hp}/${m.max} PS</small></div></div>`;
const badgesHTML=()=>`<div class=badges>${GY.map((g,i)=>`<div class="bd ${G.badges.includes(i)?'on':''}" title="${g.n}">${g.bd}</div>`).join('')}</div>`;
