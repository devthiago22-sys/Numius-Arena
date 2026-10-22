/* BOSS SEMANAL: raid de 5 treinadores contra um dos 3 dragões lendários.
   Este arquivo tem os dados dos chefes, a simulação do combate (por turnos, com semente) e a ponte com a tela
   screens/boss.html (iframe `bsf`). A tela só mostra e anima: toda regra fica aqui.
   Equilíbrio: ajuste as constantes BSX, BSR e EGG. */

const BOSSES=[
 {id:'aurelion',n:'AURELION',tt:'Dragão Cristal do Alvorecer',t:'Dragão',t2:'Pedra',col:'#ffd54a',col2:'#fff3b0',
  mv:{s:{n:'Lança de Cristal',t:'Pedra',p:95,c:'f'},a:{n:'Chuva de Estilhaços',t:'Dragão',p:65,c:'e'},u:{n:'Eclipse Dourado',t:'Dragão',p:140,c:'e'}},
  ph:['Casca de Cristal','Coroa Solar'],fx:'shield',fxd:'Cria um escudo de cristal que absorve dano'},
 {id:'nyxar',n:'NYXAR',tt:'Dragão do Vazio Estelar',t:'Dragão',t2:'Psíquico',col:'#a855f7',col2:'#e9d5ff',
  mv:{s:{n:'Garra do Vazio',t:'Psíquico',p:95,c:'f'},a:{n:'Maré Galáctica',t:'Psíquico',p:65,c:'e'},u:{n:'Singularidade',t:'Dragão',p:140,c:'e'}},
  ph:['Fome do Abismo','Horizonte de Eventos'],fx:'void',fxd:'Marca dois treinadores: perdem vida por turno e curam o dragão'},
 {id:'chronos',n:'CHRONOS',tt:'Dragão Guardião do Tempo',t:'Psíquico',t2:'Elétrico',col:'#7dd3fc',col2:'#e0f2fe',
  mv:{s:{n:'Ampulheta Quebrada',t:'Elétrico',p:95,c:'f'},a:{n:'Pêndulo Eterno',t:'Psíquico',p:65,c:'e'},u:{n:'Colapso Temporal',t:'Psíquico',p:140,c:'e'}},
  ph:['Tempo Acelerado','Fim dos Ponteiros'],fx:'freeze',fxd:'Congela dois treinadores no tempo: perdem o turno'}
];
/* Ordem e semana iguais às do menu (a ilha do boss usa a mesma conta). */
const BSW=6048e5,BSO=4*864e5;
const bsWeek=()=>Math.floor((Date.now()-BSO)/BSW);
const bsNow=()=>{const w=bsWeek();return{w,i:((w%3)+3)%3,left:(w+1)*BSW+BSO-Date.now()}};
const BSR={frag:5,coins:500,egg:1};                 // recompensa por vencer na semana
const BSTOP={frag:20,coins:1500,egg:3};             // top 3 do ranking mundial (entregue pelo servidor)
const BSX={lv:50,turns:13,cycle:{1:['s','a','s','c','u'],2:['s','a','c','u'],3:['a','s','c','u']},enrage:[1,1.2,1.4],
 atk:[0.9,12],def:[1.25,26],hp:[1150,30],sync:.07,crit:.08};
/* Ovo: peso por estágio da forma e nível em que nasce. Mais raro = menor chance. */
const EGG={1:{w:70,l:5,k:'Comum',c:'#9ca3af'},2:{w:24,l:16,k:'Raro',c:'#60a5fa'},3:{w:6,l:36,k:'Épico',c:'#f59e0b'}};
const BSALLY=[{n:'Lia',e:'👧'},{n:'Davi',e:'🧑‍🎤'},{n:'Mari',e:'🧙‍♀️'},{n:'Theo',e:'🧑‍🚀'},{n:'Aya',e:'🥷'},{n:'Rafa',e:'🧑‍🔧'}];

const BSS={n:'boss',ready:false};
const bsd=()=>{const w=bsWeek();if(!G.bs||G.bs.w!==w)G.bs={w,best:0,bt:0,win:false,claimed:false,tries:0};if(!G.frag)G.frag={aurelion:0,nyxar:0,chronos:0};if(G.eggs==null)G.eggs=0;return G.bs};

/* ---------- ranking (hoje só local; trocar por chamadas ao servidor) ---------- */
const BSRANK={
 submit(score,turns,win){const b=bsd();if(score>b.best){b.best=score;b.bt=turns;b.win=!!win||b.win}save()},
 /* top(): quando houver servidor, devolva [{name,score,win}] ordenado. Hoje: só você. */
 top(){const b=bsd();return b.best?[{name:(G.hero&&G.hero.name)||ME||'Você',score:b.best,me:1}]:[]},
 world:false
};

/* ---------- simulação ---------- */
const bsRng=Z=>{Z.s=(Z.s+0x6D2B79F5)>>>0;let t=Z.s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
const bsEffB=(t,B)=>mult(t,B.t)*(B.t2?mult(t,B.t2):1);
function bsMember(src,id,tr,me,ai){
 const m=JSON.parse(JSON.stringify(src));calc(m);const s=S[m.i];
 return{id,tr:tr.n,e:tr.e,me,ai,i:m.i,l:m.l,n:s.n,hp:m.max,max:m.max,a:m.a,sa:m.sa,d:m.d,sd:m.sd,sp:m.sp,t:s.t,t2:s.t2||null,ab:s.ab[1],
  mv:moves(m).slice(0,4).map(x=>({n:x.n,t:x.t,p:x.p,c:x.c==='e'?'e':'f',x:x.x||''})),alive:true,def:0,fz:0,vd:0,dm:0,lastDm:0}
}
function bsNew(bi,pick){
 const bd=BOSSES[bi],mine=G.team[pick]||G.team[0],L=mine.l;
 const BL=BSX.lv;
 const Z={s:(Date.now()^(bi*7919))>>>0,bi,n:0,ci:0,charging:false,over:null,mono:0};
 const hp=Math.round(BSX.hp[0]+BSX.hp[1]*BL*BL/10);
 Z.b={n:bd.n,t:bd.t,t2:bd.t2,lv:BL,hp,max:hp,sh:0,ph:1,a:Math.floor(BSX.atk[0]*BL+BSX.atk[1]),d:Math.floor(BSX.def[0]*BL+BSX.def[1])};
 Z.b.sd=Z.b.d;
 const hero=(G.hero&&G.hero.name)||'Você',al=BSALLY.slice().sort(()=>bsRng(Z)-.5).slice(0,4);
 const used=new Set([mine.i]),mk2=k=>{let f;for(let t=0;t<9;t++){f=BASE[Math.floor(bsRng(Z)*BASE.length)];if(!used.has(form(f,L))||t>5)break}const u=mk(f,Math.max(5,L+Math.floor(bsRng(Z)*5)-2));used.add(u.i);return u};
 Z.p=[bsMember(mine,'p2',{n:hero,e:'⭐'},true,false),...al.map((a,k)=>bsMember(mk2(k),'p'+(k<2?k:k+1),a,false,true))].sort((a,b)=>a.id<b.id?-1:1);
 Z.me=Z.p.find(m=>m.me);Z.log=[];
 return Z;
}
const bsNext=Z=>Z.charging?'u':BSX.cycle[Z.b.ph][Z.ci%BSX.cycle[Z.b.ph].length];
const bsWarn=Z=>{const k=bsNext(Z),B=BOSSES[Z.bi];return k==='u'?{k,n:B.mv.u.n,txt:'ULTIMATE'}:k==='c'?{k,n:B.mv.u.n,txt:'CARREGANDO'}:k==='a'?{k,n:B.mv.a.n,txt:'ATAQUE EM ÁREA'}:{k,n:B.mv.s.n,txt:'ATAQUE FOCADO'}};
const bsSnap=Z=>({b:{hp:Z.b.hp,max:Z.b.max,sh:Z.b.sh,ph:Z.b.ph},p:Z.p.map(m=>({id:m.id,hp:m.hp,max:m.max,alive:m.alive,fz:m.fz,vd:m.vd,def:m.def}))});
function bsPick(Z,m){ // escolha dos aliados controlados pela IA
 const B=Z.b;let best=0,bv=-1;
 m.mv.forEach((x,k)=>{const ph=x.c!=='e',A=x.x==='def'?m.d:ph?m.a:m.sa,v=x.p*A*bsEffB(x.t,B)*((x.t===m.t||x.t===m.t2)?1.25:1);if(v>bv){bv=v;best=k}});
 const low=m.hp/m.max;
 if(Z.charging){ // na ultimate, os 2 mais feridos protegem o grupo
  const ws=Z.p.filter(x=>x.alive&&!x.me).sort((a,b)=>a.hp/a.max-b.hp/b.max).slice(0,2);
  if(ws.includes(m))return{k:'def'};
 }else if(low<.2&&bsRng(Z)<.35)return{k:'def'};
 return{k:'mv',i:best};
}
function bsHit(Z,m,x,mul){
 const B=Z.b,ph=x.c!=='e',A=x.x==='def'?m.d:ph?m.a:m.sa,D=ph?B.d:B.sd,M=bsEffB(x.t,B),st=(x.t===m.t||x.t===m.t2)?1.25:1;
 let dmg=Math.floor(((2*m.l/5+2)*x.p*st*A/D/50+2)*M*(.85+bsRng(Z)*.15)*mul),crit=false;
 if(M>0)dmg=Math.max(1,dmg);
 if(dmg>0&&bsRng(Z)<BSX.crit){dmg=Math.floor(dmg*1.5);crit=true}
 if(m.ab==='nectar'&&(x.t==='Planta'||x.t==='Pedra'))dmg=Math.floor(dmg*1.1);
 if(m.ab==='brasa'&&x.t==='Fogo')dmg=Math.floor(dmg*(1+.5*(1-m.hp/m.max)));
 if(m.ab==='rei')dmg=Math.floor(dmg*1.1);
 return{dmg,M,crit};
}
function bsDealB(Z,dmg){const B=Z.b;let ab=0;if(B.sh>0){ab=Math.min(B.sh,dmg);B.sh-=ab}B.hp=Math.max(0,B.hp-(dmg-ab));return ab}
function bsHurt(Z,m,P,t,c,mul){ // dano do chefe em um membro
 const B=Z.b,ph=c!=='e',D=ph?m.d:m.sd;let M=effv(t,{i:m.i});
 let dmg=Math.floor(((2*B.lv/5+2)*P*B.a/D/50+2)*M*(.85+bsRng(Z)*.15)*BSX.enrage[B.ph-1]*mul);
 if(m.ab==='millennium'&&M>1)dmg=Math.floor(dmg*.5);
 return Math.max(1,dmg);
}
function bsTurn(Z,pa){
 if(Z.over)return{evs:[],snap:bsSnap(Z),over:Z.over,warn:null,turn:Z.n};
 const ev=[],B=Z.b,bd=BOSSES[Z.bi],alive=()=>Z.p.filter(m=>m.alive);
 Z.n++;ev.push({t:'turn',n:Z.n});
 const order=alive().sort((a,b)=>b.sp-a.sp),acts=[];
 order.forEach(m=>{
  if(m.fz>0){m.fz=0;ev.push({t:'fz',who:m.id});acts.push({m,k:'skip'});return}
  const a=m.me?(pa||{k:'def'}):bsPick(Z,m);
  if(a.k==='def'){m.def=1;ev.push({t:'def',who:m.id});acts.push({m,k:'def'})}else acts.push({m,k:'mv',x:m.mv[a.i]||m.mv[0],i:a.i|0});
 });
 const atk=acts.filter(a=>a.k==='mv'),n=atk.length,mul=1+BSX.sync*Math.max(0,n-1);
 atk.forEach(a=>{
  if(B.hp<=0)return;
  const r=bsHit(Z,a.m,a.x,mul),ab=bsDealB(Z,r.dmg);a.m.dm+=r.dmg;a.m.lastDm=r.dmg;
  if(a.m.ab==='reflect'&&a.x.c!=='e'&&B.hp>0){const q=Math.floor(r.dmg*.15);B.hp=Math.max(0,B.hp-q)}
  ev.push({t:'atk',who:a.m.id,mv:{n:a.x.n,t:a.x.t,c:a.x.c,p:a.x.p},dmg:r.dmg,M:r.M,crit:r.crit,abs:ab,hp:B.hp,sh:B.sh,n});
 });
 if(n>=3&&B.hp>0){const burst=Math.round(B.max*.011*n);bsDealB(Z,burst);if(atk.some(a=>a.m.me))Z.me.dm+=Math.round(burst/n);ev.push({t:'sync',n,mult:mul,burst,all:n>=alive().length&&n>=4,hp:B.hp,sh:B.sh})}
 const kill=()=>{Z.over='win';ev.push({t:'end',win:true});return{evs:ev,snap:bsSnap(Z),over:'win',warn:null,turn:Z.n}};
 if(B.hp<=0)return kill();
 /* fases */
 const r=B.hp/B.max,np=r<=.33?3:r<=.66?2:1;
 if(np>B.ph){
  B.ph=np;Z.ci=0;const fx={t:'phase',ph:np,name:bd.ph[np-2],fx:bd.fx};
  if(bd.fx==='shield'){B.sh=Math.round(B.max*.1);fx.sh=B.sh}
  else{const tg=alive().sort(()=>bsRng(Z)-.5).slice(0,2);fx.tg=tg.map(m=>m.id);tg.forEach(m=>{if(bd.fx==='void')m.vd=3;else m.fz=1})}
  ev.push(fx);
 }
 /* chefe */
 const bossAct=(k)=>{
  const mvB=bd.mv[k==='u'?'u':k==='a'?'a':'s'];
  if(k==='c'){Z.charging=true;ev.push({t:'tele',name:bd.mv.u.n});return}
  const tg=alive();if(!tg.length)return;
  if(k==='s'){
   const mxd=Math.max(1,...tg.map(m=>m.lastDm||0)),w=tg.map(m=>1+2*(m.lastDm||0)/mxd);let tot=w.reduce((a,b)=>a+b,0),x=bsRng(Z)*tot,v=tg[0];for(let j=0;j<tg.length;j++){x-=w[j];if(x<=0){v=tg[j];break}}
   let red=null,mul2=1;const dfs=tg.filter(m=>m.def&&m!==v);
   if(v.def)mul2=.5;else if(dfs.length){red=dfs[0];mul2=.5}
   const tgt=red||v,dmg=bsHurt(Z,tgt,mvB.p,mvB.t,mvB.c,mul2);tgt.hp=Math.max(0,tgt.hp-dmg);
   let heal=0;if(bd.fx==='void'){heal=Math.min(B.max-B.hp,Math.floor(dmg*.3));B.hp+=heal}
   ev.push({t:'bs',name:mvB.n,ty:mvB.t,who:v.id,tgt:tgt.id,redir:!!red,dmg,hp:tgt.hp,heal,bhp:B.hp,block:!!(v.def||red)});
   if(tgt.hp<=0){tgt.alive=false;ev.push({t:'faint',who:tgt.id})}
  }else{
   const ult=k==='u',kdef=tg.filter(m=>m.def).length,bar=ult?Math.min(.6,kdef*.2):0,hits=[];
   tg.forEach(m=>{let mu=ult?(1-bar)*(m.def?.7:1):(m.def?.6:1);const dmg=bsHurt(Z,m,mvB.p,mvB.t,mvB.c,mu);m.hp=Math.max(0,m.hp-dmg);hits.push({who:m.id,dmg,hp:m.hp,def:!!m.def});if(m.hp<=0){m.alive=false}});
   ev.push({t:'baoe',name:mvB.n,ty:mvB.t,ult,bar:Math.round(bar*100),hits});
   hits.forEach(h=>{if(h.hp<=0)ev.push({t:'faint',who:h.who})});
   if(ult){Z.charging=false;if(bd.fx==='freeze'&&B.ph>=2){const live=alive().sort(()=>bsRng(Z)-.5).slice(0,1);live.forEach(m=>{m.fz=1;ev.push({t:'st',who:m.id,k:'freeze'})})}}
  }
 };
 const k=bsNext(Z);Z.ci++;bossAct(k);
 if(B.ph===3&&alive().length&&k!=='c'&&k!=='u'&&!Z.charging)bossAct('s');
 /* fim de turno: vazio */
 const vv=alive().filter(m=>m.vd>0);let heal=0;
 vv.forEach(m=>{const d=Math.max(1,Math.floor(m.max*.06));m.hp=Math.max(0,m.hp-d);m.vd--;heal+=Math.floor(d*.5);ev.push({t:'st',who:m.id,k:'void',dmg:d,hp:m.hp});if(m.hp<=0){m.alive=false;ev.push({t:'faint',who:m.id})}});
 if(heal){B.hp=Math.min(B.max,B.hp+heal);ev.push({t:'bheal',v:heal,hp:B.hp})}
 Z.p.forEach(m=>m.def=0);
 if(!alive().length){Z.over='lose';ev.push({t:'end',win:false})}
 return{evs:ev,snap:bsSnap(Z),over:Z.over,warn:Z.over?null:bsWarn(Z),turn:Z.n};
}

/* ---------- recompensas e ovos ---------- */
function bsFinish(Z,win){
 const b=bsd(),bd=BOSSES[Z.bi];let rw=null;
 BSRANK.submit(Z.me.dm,Z.n,win);b.tries++;
 if(win&&!b.claimed){b.claimed=true;G.frag[bd.id]=(G.frag[bd.id]||0)+BSR.frag;G.coins=(G.coins||0)+BSR.coins;G.eggs=(G.eggs||0)+BSR.egg;rw={frag:BSR.frag,coins:BSR.coins,egg:BSR.egg,boss:bd.id}}
 save();return rw;
}
function bsHatch(){
 const b=bsd();if(!(G.eggs>0))return{err:'Você não tem ovos.'};
 if(G.team.length>=6)return{err:'Sua equipe está cheia (6/6). Libere um espaço para chocar o ovo.'};
 const pool=S.map((s,i)=>({i,s:s.s,w:EGG[s.s]?EGG[s.s].w:0})),cnt={};pool.forEach(p=>cnt[p.s]=(cnt[p.s]||0)+1);
 pool.forEach(p=>p.w=p.w/(cnt[p.s]||1));
 const tot=pool.reduce((a,p)=>a+p.w,0);let x=Math.random()*tot,pk=pool[0];for(const p of pool){x-=p.w;if(x<=0){pk=p;break}}
 const e=EGG[pk.s]||EGG[1],m=mk(pk.i,e.l);m.i=pk.i;calc(m);m.hp=m.max;m.mv=initMoves(m.i,m.l);m.pp=m.mv.map(k=>MOVES[k].pp);
 G.eggs--;G.team.push(m);reg(m.i);save();
 return{i:m.i,n:S[m.i].n,l:m.l,rar:e.k,col:e.c,t:S[m.i].t,t2:S[m.i].t2||null};
}

/* ---------- ponte com a tela ---------- */
function bsMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('bsf');
 if(!f){f=document.createElement('iframe');f.id='bsf';f.className='lgf';f.title='Boss semanal';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(BSS)}
 if(!BSS.ready&&!BSS.tt){BSS.tt=1;BSS.t=setTimeout(()=>{if(!BSS.ready&&G.screen==='boss'){G.bsfb=1;R()}},12000)}
 bsToggle();
}
function bsData(){
 const b=bsd(),nw=bsNow(),d=Math.floor(nw.left/864e5),h=Math.floor(nw.left%864e5/36e5),mn=Math.floor(nw.left%36e5/6e4);
 const bd=BOSSES[nw.i];
 return{numius:1,k:'bsdata',w:nw.w,bi:nw.i,left:d+'d '+h+'h '+mn+'min',
  bosses:BOSSES.map(x=>({id:x.id,n:x.n,tt:x.tt,t:x.t,t2:x.t2,col:x.col,col2:x.col2,mv:x.mv,fxd:x.fxd,ph:x.ph})),
  frag:G.frag,eggs:G.eggs||0,coins:G.coins||0,claimed:b.claimed,best:b.best,bt:b.bt,win:b.win,tries:b.tries,
  rew:BSR,top:BSTOP,egg:Object.values(EGG).map(e=>({k:e.k,w:e.w,c:e.c})),
  team:G.team.map((m,k)=>({k,i:m.i,n:S[m.i].n,l:m.l,t:S[m.i].t,t2:S[m.i].t2||null,mv:moves(m).slice(0,4).map(x=>x.n)})),
  hero:(G.hero&&G.hero.name)||ME||'Você',rank:{world:BSRANK.world,list:BSRANK.top()},
  imgs:BSS.sent?null:(BSS.sent=1,btImgs()),teamFull:G.team.length>=6}
}
function bsSend(){const f=document.getElementById('bsf');if(BSS.ready&&f&&f.contentWindow)f.contentWindow.postMessage(bsData(),'*')}
function bsToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('bsf');if(f)f.style.display=(G.screen==='boss'&&!G.bsfb)?'block':'none'}
function bsStartMsg(Z){
 const bd=BOSSES[Z.bi];
 return{numius:1,k:'bsstart',boss:{...Z.b,id:bd.id},
  party:Z.p.map(m=>({id:m.id,tr:m.tr,e:m.e,me:m.me,ai:m.ai,i:m.i,l:m.l,n:m.n,hp:m.hp,max:m.max,t:m.t,t2:m.t2,
   mv:m.mv.map(x=>({n:x.n,t:x.t,p:x.p,c:x.c,M:bsEffB(x.t,Z.b)}))})),warn:bsWarn(Z)}
}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('bsf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 const post=o=>f.contentWindow.postMessage(Object.assign({numius:1},o),'*');
 if(d.k==='ready'){BSS.ready=true;bsSend()}
 else if(G.screen!=='boss')return;
 else if(d.k==='nav'&&d.to==='map'){BSS.Z=null;G.screen='map';R()}
 else if(d.k==='leave'){const Z=BSS.Z;if(Z&&!Z.over){Z.over='left';bsFinish(Z,false)}BSS.Z=null;setTimeout(bsSend,50)}
 else if(d.k==='start'){const nw=bsNow();BSS.Z=bsNew(nw.i,d.pick|0);post(bsStartMsg(BSS.Z))}
 else if(d.k==='turn'){const Z=BSS.Z;if(!Z)return;const r=bsTurn(Z,d.a);let rw=null;if(r.over)rw=bsFinish(Z,r.over==='win');
  post({k:'bsturn',evs:r.evs,snap:r.snap,over:r.over,warn:r.warn,turn:r.turn,reward:rw,score:Z.me.dm,best:bsd().best,coins:G.coins||0,frag:G.frag,eggs:G.eggs||0});if(r.over)setTimeout(bsSend,50)}
 else if(d.k==='hatch'){const r=bsHatch();post({k:'bshatch',...r,eggs:G.eggs||0,imgs:r.i!=null?btImgs():null});setTimeout(bsSend,50)}
});
