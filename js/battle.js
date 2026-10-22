const PSC=[.7,.85,1];
const PA=m=>{const a=S[m.i].ab;return{n:a[0],k:a[1],s:1}};
const pdesc=m=>({nectar:'Todos os ataques do tipo Planta e Pedra ganham +10% de dano',reflect:'Todo dano físico recebido é refletido em 15% para o inimigo',millennium:'Todo começo de turno aumenta a Defesa e a Defesa Mágica em +2 e reduz em 50% qualquer dano super efetivo',brasa:'Conforme a vida diminui, os ataques do tipo Fogo ganham cada vez mais força',vontade:'Quanto mais forte o inimigo, mais os status evoluem por turno, até +30%',rei:'Ao entrar em campo cria um campo de lava: +10% de dano e velocidade e queima todos, menos ele',antidote:'Status negativos não funcionam nele; qualquer um aplicado é transferido para o inimigo',harmony:'Não recebe dano de ataques do tipo Água e Dragão',tsunami:'Todo começo de turno um tsunami fere todos no campo, menos o tipo Água; cada Numiu derrotado dá +20% em todos os status'})[PA(m).k];
let RR=Math.random;
function hit(a,d,k){
 const B=G.battle,mv=k<0?STRUG:moves(a)[k],pa=PA(a),pd=PA(d);let M=effv(mv.t,d),ex='';if(k>=0&&a.pp)a.pp[k]=Math.max(0,a.pp[k]-1);
 if(pd.k==='harmony'&&(mv.t==='Água'||mv.t==='Dragão'))M=0;
 const ph=mv.c!=='e',A=sx(a,mv.x==='def'?'d':ph?'a':'sa'),D=sx(d,ph?'d':'sd'),st=(mv.t===S[a.i].t||mv.t===S[a.i].t2)?1.25:1;
 let dmg=Math.floor(((2*a.l/5+2)*mv.p*st*A/D/50+2)*M*(.85+RR()*.15));
 if(M>0)dmg=Math.max(1,dmg);
 if(dmg>0&&pd.k==='dodge'&&RR()<.14*pd.s){dmg=0;ex=' · Esquivou!'}
 if(dmg>0){
  if(mv.x==='cr'||(pa.k==='crit'&&RR()<.15*pa.s)){dmg=Math.floor(dmg*1.5);ex+=' · Crítico!'}
  if(pa.k==='fury'&&a.hp<a.max/3)dmg=Math.floor(dmg*(1+.35*pa.s));
  if(pa.k==='first'&&B&&!(B.fa=B.fa||[]).includes(a))dmg=Math.floor(dmg*(1+.3*pa.s));
  if(pa.k==='nectar'&&(mv.t==='Planta'||mv.t==='Pedra'))dmg=Math.floor(dmg*1.1);
  if(pa.k==='brasa'&&mv.t==='Fogo')dmg=Math.floor(dmg*(1+.5*(1-a.hp/a.max)));
  if(pa.k==='rei')dmg=Math.floor(dmg*1.1);
  if(pd.k==='millennium'&&M>1)dmg=Math.max(1,Math.floor(dmg*.5));
 }
 if(B)(B.fa=B.fa||[]).includes(a)||B.fa.push(a);
 (G.fxq=G.fxq||[]).push({a:B&&B.foe===a?'e':'p',d,dmg,M,t:mv.t,pre:d.hp/d.max});d.hp=Math.max(0,d.hp-dmg);
 let rec=0,kbUp=false;
 if(d.hp<=0&&dmg>0&&pa.k==='tsunami'){AB(a).kb=(AB(a).kb||0)+.2;kbUp=true;ex+=' · +20% em todos os status'}
 let heal=0;
 if(dmg>0){if(pa.k==='lifesteal')heal+=dmg*.2*pa.s;if(mv.x==='dr')heal+=dmg*.4}
 const hh=Math.min(a.max-a.hp,Math.floor(heal));if(hh>0){a.hp+=hh;ex+=` · +${hh} PS`}
 const ahpH=a.hp;
 if(dmg>0&&pd.k==='thorn'&&a.hp>1){const t=Math.min(a.hp-1,Math.max(1,Math.floor(a.max*.07*pd.s)));a.hp-=t;rec+=t;ex+=` · ${S[d.i].n} feriu o atacante (−${t})`}
 if(dmg>0&&ph&&pd.k==='reflect'&&a.hp>1){const t=Math.min(a.hp-1,Math.max(1,Math.floor(dmg*.15)));a.hp-=t;rec+=t;ex+=` · ${S[d.i].n} refletiu ${t} de dano físico`}
 if(k<0&&dmg>0){const rc=Math.max(1,Math.ceil(dmg*.25));a.hp=Math.max(1,a.hp-rc);rec+=rc;ex+=` · recuo (−${rc})`}
 {const as=sideOf(a),li=B?B.log.length+1:0;evp({t:'move',s:as,mv:mv.n,ty:mv.t,c:mv.c||'f',x:mv.x||'',dmg,M,crit:ex.includes('Crítico'),dodge:ex.includes('Esquivou'),hp:d.hp,heal:hh>0?hh:0,ahp:ahpH},li);if(rec>0)evp({t:'recoil',s:as,hp:a.hp,dmg:rec},li);if(kbUp)evp({t:'buff',s:as,bu:btBu(a),txt:'TODOS ▲ +'+Math.round((AB(a).kb||0)*100)+'%',col:'#fbbf24'},li)}
 return `${S[a.i].n} usou ${mv.n}! −${dmg} PS${M>1?' · Super efetivo!':M===0?' · Sem efeito!':M<1?' · Pouco efetivo…':''}${ex}`;
}
const AB=m=>{const B=G.battle;if(!B)return{};const mp=B.abm||(B.abm=new Map());let o=mp.get(m);if(!o){o={};mp.set(m,o)}return o};
const evp=(o,li)=>{const B=G.battle;if(B)(B.ev=B.ev||[]).push({...o,li:li!=null?li:B.log.length})};
const sideOf=m=>G.battle&&G.battle.foe===m?'e':'p';
const btBu=m=>{const o=AB(m);return{df:o.df||0,b:Math.round((o.b||0)*100),kb:Math.round((o.kb||0)*100)}};
const btSnap=m=>{const s=S[m.i];return{i:m.i,n:s.n,l:m.l,hp:m.hp,max:m.max,ty:[s.t,s.t2].filter(Boolean),bn:!!AB(m).burn,bu:btBu(m)}};
const STN={h:'PS',a:'Ataque',sa:'Atq. Mágico',d:'Defesa',sd:'Def. Mágica',sp:'Velocidade'};
function sx(m,k){const o=AB(m),p=PA(m).k;let mul=1+(o.b||0)+(o.kb||0);if(k==='sp'&&p==='rei')mul*=1.1;if(k==='a'&&o.burn)mul*=.75;let v=(m[k]||1)*mul;if(k==='d'||k==='sd')v+=(o.df||0);return Math.max(1,v)}
function applyStatus(t,s,src){const B=G.battle,o=AB(t);if(o[s])return false;const nt=S[t.i].n,ns=S[src.i].n,lbl=s==='burn'?'queimadura':'status negativo';
 if(PA(t).k==='antidote'){B.log.push(`🧪 ${nt}: Antídoto Eterno — a ${lbl} foi transferida para ${ns}!`);evp({t:'shield',s:sideOf(t),txt:'ANTÍDOTO!'});if(PA(src).k==='antidote'||(PA(src).k==='rei'&&s==='burn')){B.log.push(`${ns} não é afetado.`);return false}const so=AB(src);if(so[s])return false;so[s]=1;B.log.push(`🔥 ${ns} sofreu ${lbl}!`);evp({t:'status',s:sideOf(src),st:s});return true}
 if(PA(t).k==='rei'&&s==='burn')return false;
 o[s]=1;B.log.push(`🔥 ${nt} sofreu ${lbl}!`);evp({t:'status',s:sideOf(t),st:s});return true}
function turnFx(B){
 const p=act(),e=B.foe,ls=B.log;
 [[p,e],[e,p]].forEach(([m,o])=>{
  if(!m||!o||m.hp<=0||o.hp<=0)return;
  const k=PA(m).k,mo=AB(m),nm=S[m.i].n,on=S[o.i].n;
  if(k==='millennium'){mo.df=(mo.df||0)+2;ls.push(`🪨 ${nm}: Endurecer do Milênio — Defesa e Def. Mágica +2 (total +${mo.df}).`);evp({t:'buff',s:sideOf(m),bu:btBu(m),txt:'DEFESA ▲ +2',col:'#4ade80'})}
  else if(k==='vontade'){const pw=x=>x.max+x.a+x.sa+x.d+x.sd+x.sp,inc=Math.max(.02,Math.min(.08,.04*pw(o)/Math.max(1,pw(m))));mo.b=Math.min(.3,(mo.b||0)+inc);ls.push(`🔥 ${nm}: Vontade do Fogo — todos os status +${Math.round(mo.b*100)}%.`);evp({t:'buff',s:sideOf(m),bu:btBu(m),txt:'STATUS ▲ +'+Math.round(mo.b*100)+'%',col:'#f97316'})}
  else if(k==='tsunami'&&!S[o.i].tt.includes('Água')){const d=Math.max(1,Math.floor(o.max*.07));o.hp=Math.max(0,o.hp-d);ls.push(`🌊 ${nm} trouxe um tsunami! ${on} −${d} PS.`);evp({t:'tsunami',s:sideOf(m),hp:o.hp,dmg:d});if(o.hp<=0){mo.kb=(mo.kb||0)+.2;ls.push(`${nm} ganhou +20% em todos os status.`);evp({t:'buff',s:sideOf(m),bu:btBu(m),txt:'TODOS ▲ +'+Math.round(mo.kb*100)+'%',col:'#fbbf24'})}}
  else if(k==='rei')applyStatus(o,'burn',m);
 });
 [p,e].forEach(m=>{if(!m||m.hp<=0)return;if(AB(m).burn){const d=Math.max(1,Math.floor(m.max*.06));m.hp=Math.max(0,m.hp-d);ls.push(`🔥 ${S[m.i].n} sofre com a queimadura! −${d} PS.`);evp({t:'dot',s:sideOf(m),hp:m.hp,dmg:d})}});
}
function regen(B){[act(),B.foe].forEach(m=>{if(!m||m.hp<=0)return;const p=PA(m);if(p.k==='regen'&&m.hp<m.max){const h=Math.min(m.max-m.hp,Math.max(1,Math.floor(m.max*.06*p.s)));m.hp+=h;B.log.push(`${S[m.i].n} recuperou ${h} PS (${p.n}).`)}})}
function eTurn(){
 const B=G.battle,p=act(),e=B.foe;
 let k=moves(e).map((mv,i)=>e.pp&&e.pp[i]<=0?-1:mv.p*effv(mv.t,p)).reduce((b,v,i,a)=>v>a[b]?i:b,0);
 if((B.tt||B.vt)&&B.tier<1)k=rnd(moves(e).length);
 if((B.tt||B.vt)&&B.tier>=3&&B.pot>0&&e.hp<e.max*.3){B.pot--;e.hp=Math.min(e.max,e.hp+Math.floor(e.max*.4));B.log.push(`Treinador usou uma poção! ${S[e.i].n} recuperou PS.`);return}
 if(k>=0&&e.pp&&e.pp[k]<=0)k=-1;
 B.log.push(hit(e,p,k));
 if(p.hp<=0){B.log.push(`${S[p.i].n} desmaiou!`);evp({t:'faint',s:'p'});
  const n=act();
  if(n){B.log.push(`Você enviou ${S[n.i].n}!`);evp({t:'send',s:'p',mon:btSnap(n)})}
  else{B.log.push('Você ficou sem monstrinhos…');B.over='lose'}}
}
function gain(p,e){
 const xp=Math.floor(e.l*10*(G.battle.wild?1:1.5));
 p.xp+=xp;G.coins=(G.coins||0)+Math.floor(xp/2);G.battle.log.push(`${S[p.i].n} ganhou ${xp} XP e ${Math.floor(xp/2)} 💰.`);
 while(p.xp>=10*p.l){p.xp-=10*p.l;p.l++;G.battle.lvF=1;calc(p);p.hp=Math.min(p.max,p.hp+6);evo(p);learnCheck(p);G.battle.log.push(`⬆️ ${S[p.i].n} subiu para o nível ${p.l}!`);evp({t:'lvup',l:p.l})}
}
function rewardMon(n){
 if(G.team.length>=6){G.battle.log.push('Equipe cheia: sem novo monstrinho de recompensa.');return}
 const g=GY[n],have=G.team.map(m=>S[m.i].fam),cand=BASE.filter(i=>!have.includes(S[i].fam)),pref=cand.filter(i=>S[i].t===g.ty||S[i].t2===g.ty),arr=pref.length?pref:cand.length?cand:BASE;
 const r=mk(arr[rnd(arr.length)],Math.max(5,g.t[0][1]-6));G.team.push(r);reg(r.i);
 G.battle.log.push(`🎁 Recompensa: ${S[r.i].n} (Nv ${r.l}) entrou na sua equipe!`);
}
function foeDown(){
 const B=G.battle,p=act(),e=B.foe;
 B.log.push(`${S[e.i].n} desmaiou!`);evp({t:'faint',s:'e'});gain(p,e);
 if(B.queue.length){B.foe=B.queue.shift();B.log.push(`${B.tt?'Treinador '+B.tt:B.vt?'O rival':GY[B.gym].l} enviou ${S[B.foe.i].n} (Nv ${B.foe.l})!`);evp({t:'send',s:'e',mon:btSnap(B.foe)})}
 else{B.over='win';
  if(B.vt){const r=2+B.vt;G.vc=(G.vc||0)+r;G.vbest=Math.max(G.vbest||0,B.vt);G.vn=B.vt+1;G.vsel=B.vt+1;B.log.push(`🪙 +${r} Moedas Virtuosas!`)}
  if(!B.wild&&!B.tt&&!B.vt&&!G.badges.includes(B.gym)){G.badges.push(B.gym);B.log.push(`🏅 Você ganhou a ${GY[B.gym].n}!`);rewardMon(B.gym)}}
}
function turn(k){
 const B=G.battle;if(B.over)return;if(B.pvp)return pvpAct({t:'a',k});B.log=[];if(k>=0&&act().pp&&act().pp[k]<=0)k=-1;
 {const p0=act();turnFx(B);
  if(B.foe.hp<=0){foeDown();save();R();return}
  if(p0.hp<=0){B.log.push(`${S[p0.i].n} desmaiou!`);evp({t:'faint',s:'p'});const n=act();if(n){B.log.push(`Você enviou ${S[n.i].n}!`);evp({t:'send',s:'p',mon:btSnap(n)})}else{B.log.push('Você ficou sem monstrinhos…');B.over='lose'}save();R();return}}
 const pl=act(),foeFirst=sx(B.foe,'sp')>sx(pl,'sp');
 if(foeFirst){eTurn();if(B.over||pl.hp<=0){save();R();return}}
 if(B.tt)B.used.push(S[act().i].t);B.log.push(hit(act(),B.foe,k));
 if(B.foe.hp<=0)foeDown();else{if(!foeFirst)eTurn();if(!B.over)regen(B)}
 save();R();
}
function swap(){
 const B=G.battle;
 if(!G.team.some(m=>m.hp>0&&m!==act())){B.log=['Você precisa de outro monstrinho saudável na equipe para trocar. Venza um ginásio para ganhar mais um.'];return R()}
 B.pick=true;R();
}
function swapTo(i){
 const B=G.battle,m=G.team[i];
 if(!m||m.hp<=0||m===act())return;
 if(B.pvp){B.pick=false;pvpAct({t:'s',i});return}
 B.pick=false;G.team.unshift(G.team.splice(i,1)[0]);
 B.log=[`Vai, ${S[m.i].n}!`];evp({t:'send',s:'p',mon:btSnap(m)});eTurn();save();R();
}
function leave(){if(G.battle.pvp){pvpAct({t:'f'});return}const B=G.battle;B.over='quit';G.note='🏳️ Você desistiu da batalha. A desistência foi registrada.';end()}
function cap(){
 const B=G.battle,e=B.foe;
 if(G.team.length>=6){B.log=['Sua equipe já tem 6 monstrinhos!'];return R()}
 if(Math.random()<.2+.6*(1-e.hp/e.max)){G.team.push(e);reg(e.i);B.log=[`🎯 Você capturou ${S[e.i].n}!`];B.over='caught';evp({t:'cap',ok:true})}
 else{B.log=['A bola falhou!'];evp({t:'cap',ok:false});eTurn()}
 save();R();
}
function flee(){G.battle.log=['Você fugiu!'];G.battle.over='fled';R()}
function wild(){
 const lv=5+G.badges.length*4+rnd(3);
 G.battle={wild:true,foe:mk(BASE[rnd(BASE.length)],lv),queue:[],log:['Um monstrinho selvagem apareceu!'],over:null};G.screen='battle';R();
}
function gym(n){
 const g=GY[n],cnt=Math.min(6,G.team.length),pool=[...new Set([...g.t.map(x=>x[0]),...BASE.filter(i=>S[i].t===g.ty||S[i].t2===g.ty),...BASE])],q=Array.from({length:cnt},(_,k)=>mk(pool[k%pool.length],g.t[0][1]+2*k)),f=q.shift();
 G.battle={wild:false,gym:n,foe:f,queue:q,log:[`${GY[n].l} quer batalhar! Enviou ${S[f.i].n} (Nv ${f.l})!`],over:null};G.screen='battle';R();
}
function end(){if(G.battle.pvp){pvpEnd();return}
 {const B=G.battle;if(B.tt){const T=G.tac[B.tt];T.seen=[...T.seen,...B.used].slice(-40);if(B.over==='win')T.w++;if(B.over==='quit')T.q=(T.q||0)+1}}
 if(G.battle.over==='lose')G.team.forEach(m=>{m.hp=m.max;restPP(m)});
 const tt=G.battle.tt,gy=G.battle.gym,vt=G.battle.vt;G.battle=null;const dst=vt?'vir':tt?'tac':gy!==undefined?'gyms':'map';if(G.learn&&G.learn.length){G.after=dst;G.screen='learn'}else G.screen=dst;save();R();
}
function learnCheck(p){LS(S[p.i].fam).filter(a=>a[0]===p.l).forEach(([lv,k])=>{if(p.mv.includes(k))return;if(p.mv.length<4){p.mv.push(k);p.pp.push(MOVES[k].pp);G.battle.log.push(`📘 ${S[p.i].n} aprendeu ${MOVES[k].n}!`)}else{(G.learn=G.learn||[]).push({m:p,k});G.battle.log.push(`📘 ${S[p.i].n} quer aprender ${MOVES[k].n}!`)}})}
function learnNext(){if(G.learn&&G.learn.length){R();return}G.screen=G.after||'map';G.after=null;save();R()}
function learnForget(j){const q=G.learn.shift();if(q&&q.m.mv[j]!==undefined){q.m.mv[j]=q.k;q.m.pp[j]=MOVES[q.k].pp}learnNext()}
function learnSkip(){G.learn.shift();learnNext()}
function vstart(n){
 const pl=Math.max(5,(G.team[0]||{l:5}).l),L=pl+2*(n-1),cnt=Math.min(6,3+Math.floor((n-1)/2)),tier=Math.min(3,Math.floor((n-1)/2)),seen=G.team.map(m=>S[m.i].t);
 const q=Array.from({length:cnt},()=>{const m=mk(BASE[rnd(BASE.length)],L+rnd(2)),v=Math.min(31,3*n),e=Math.min(252,20*n);m.iv={h:Math.min(31,m.iv.h+v),a:Math.min(31,m.iv.a+v)};m.ev={h:e,a:e};
  if(tier>=2){const t=S[m.i].t,c=TY.map(x=>({x,s:seen.reduce((s,y)=>s+mult(x,y),0)+(x===t?.5:0)})).sort((a,b)=>b.s-a.s)[0].x,dm=m.mv.slice();if(c!==t)dm[1]=2+TY.indexOf(c);m.mv=dm;restPP(m)}
  calc(m);m.hp=m.max;return m}),f=q.shift();
 G.battle={wild:false,vt:n,tier,pot:tier>=3?2:0,used:[],foe:f,queue:q,log:[`Batalha Virtuosa — Fase ${n}! O rival enviou ${S[f.i].n} (Nv ${f.l})!`],over:null};
 G.screen='battle';R();
}
function trEV(i,s){const m=G.team[i];m.ev[s]=m.ev[s]||0;if((G.vc||0)<2||m.ev[s]>=252){G.note='Moedas Virtuosas insuficientes ou limite de EV atingido.';R();return}G.vc-=2;m.ev[s]=Math.min(252,m.ev[s]+8);const o=m.max;calc(m);m.hp+=m.max-o;save();R()}
function trIV(i,s){const m=G.team[i];m.iv[s]=m.iv[s]==null?15:m.iv[s];if((G.vc||0)<6||m.iv[s]>=31){G.note='Moedas Virtuosas insuficientes ou IV já no máximo.';R();return}G.vc-=6;m.iv[s]=Math.min(31,m.iv[s]+4);const o=m.max;calc(m);m.hp+=m.max-o;save();R()}
function tac(t){
 const T=G.tac||(G.tac={});T[t]=T[t]||{w:0,seen:[]};const X=T[t],w=X.w,tier=Math.min(3,w),L=Math.max(5,G.team[0].l),pool=(p=>p.length?p:BASE.slice())([...S.keys()].filter(i=>(S[i].t===t||S[i].t2===t)&&BASE.includes(i)));
 const q=Array.from({length:6},(_,k)=>{const m=mk(pool[k%pool.length],L);m.iv={h:Math.min(31,m.iv.h+6*w),a:Math.min(31,m.iv.a+6*w)};m.ev={h:Math.min(252,30*w),a:Math.min(252,30*w)};
  if(tier>=2&&X.seen.length){const c=TY.map(x=>({x,s:X.seen.reduce((s,y)=>s+mult(x,y),0)+(x===t?.5:0)})).sort((a,b)=>b.s-a.s)[0].x;const dm=m.mv.slice();if(c!==t)dm[1]=2+TY.indexOf(c);m.mv=dm;restPP(m)}
  calc(m);m.hp=m.max;return m}),f=q.shift();
 G.battle={wild:false,tt:t,tier,pot:tier>=3?2:0,used:[],foe:f,queue:q,log:[`Treinador ${t} (tática: ${TN[tier]}) enviou ${S[f.i].n} (Nv ${f.l})!`],over:null};G.screen='battle';R();
}
function mvUp(i,d){const j=i+d;if(j<0||j>=G.team.length)return;[G.team[i],G.team[j]]=[G.team[j],G.team[i]];save();R()}
function setMv(i,s,v){const m=G.team[i],c=(m.mv||defMv(m)).slice();c[s]=+v;m.mv=c;save();R()}
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const rb=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
