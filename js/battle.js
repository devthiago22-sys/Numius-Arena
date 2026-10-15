/* Motor de batalha: dano, habilidades passivas, IA, XP, aprendizado de golpes, treino, batalhas táticas e virtuosas */
const PSC=[.7,.85,1];
const PA=m=>{const a=FAM[S[m.i].fam][7];return{n:a[0],k:a[1],t:a[2],s:S[m.i].ps||PSC[S[m.i].s-1]}};
const pdesc=m=>{const p=PA(m),pc=v=>Math.round(v*p.s*100)+'%';return{thorn:`Quem atinge perde ${pc(.07)} dos próprios PS`,regen:`Recupera ${pc(.06)} dos PS a cada turno`,lifesteal:`Recupera ${pc(.2)} do dano causado`,fury:`+${pc(.35)} de dano com menos de 1/3 da vida`,dodge:`${pc(.14)} de chance de esquivar`,crit:`${pc(.15)} de chance de golpe crítico`,first:`+${pc(.3)} de dano no primeiro golpe`,tough:`Recebe ${pc(.14)} menos dano`,immune:`Imune a golpes de ${p.t}`}[p.k]};
let RR=Math.random;
function hit(a,d,k){
 const B=G.battle,mv=k<0?STRUG:moves(a)[k],pa=PA(a),pd=PA(d);let M=effv(mv.t,d),ex='';if(k>=0&&a.pp)a.pp[k]=Math.max(0,a.pp[k]-1);
 if(pd.k==='immune'&&mv.t===pd.t)M=0;
 let dmg=Math.floor(((2*a.l/5+2)*mv.p*(mv.t===S[a.i].t?1.25:1)*a.a/(d.l+5)/50+2)*M*(.85+RR()*.15));
 if(M>0)dmg=Math.max(1,dmg);
 if(dmg>0&&pd.k==='dodge'&&RR()<.14*pd.s){dmg=0;ex=' · Esquivou!'}
 if(dmg>0){
  if(mv.x==='cr'||(pa.k==='crit'&&RR()<.15*pa.s)){dmg=Math.floor(dmg*1.5);ex+=' · Crítico!'}
  if(pa.k==='fury'&&a.hp<a.max/3)dmg=Math.floor(dmg*(1+.35*pa.s));
  if(pa.k==='first'&&B&&!(B.fa=B.fa||[]).includes(a))dmg=Math.floor(dmg*(1+.3*pa.s));
  if(pd.k==='tough')dmg=Math.max(1,Math.floor(dmg*(1-.14*pd.s)));
 }
 if(B)(B.fa=B.fa||[]).includes(a)||B.fa.push(a);
 (G.fxq=G.fxq||[]).push({a:B&&B.foe===a?'e':'p',d,dmg,M,t:mv.t,pre:d.hp/d.max});d.hp=Math.max(0,d.hp-dmg);
 let heal=0;
 if(dmg>0){if(pa.k==='lifesteal')heal+=dmg*.2*pa.s;if(mv.x==='dr')heal+=dmg*.4}
 const hh=Math.min(a.max-a.hp,Math.floor(heal));if(hh>0){a.hp+=hh;ex+=` · +${hh} PS`}
 if(dmg>0&&pd.k==='thorn'&&a.hp>1){const t=Math.min(a.hp-1,Math.max(1,Math.floor(a.max*.07*pd.s)));a.hp-=t;ex+=` · ${S[d.i].n} feriu o atacante (−${t})`}
 if(k<0&&dmg>0){const rc=Math.max(1,Math.ceil(dmg*.25));a.hp=Math.max(1,a.hp-rc);ex+=` · recuo (−${rc})`}
 return `${S[a.i].n} usou ${mv.n}! −${dmg} PS${M>1?' · Super efetivo!':M===0?' · Sem efeito!':M<1?' · Pouco efetivo…':''}${ex}`;
}
function regen(B){[act(),B.foe].forEach(m=>{if(!m||m.hp<=0)return;const p=PA(m);if(p.k==='regen'&&m.hp<m.max){const h=Math.min(m.max-m.hp,Math.max(1,Math.floor(m.max*.06*p.s)));m.hp+=h;B.log.push(`${S[m.i].n} recuperou ${h} PS (${p.n}).`)}})}
function eTurn(){
 const B=G.battle,p=act(),e=B.foe;
 let k=moves(e).map((mv,i)=>e.pp&&e.pp[i]<=0?-1:mv.p*effv(mv.t,p)).reduce((b,v,i,a)=>v>a[b]?i:b,0);
 if((B.tt||B.vt)&&B.tier<1)k=rnd(moves(e).length);
 if((B.tt||B.vt)&&B.tier>=3&&B.pot>0&&e.hp<e.max*.3){B.pot--;e.hp=Math.min(e.max,e.hp+Math.floor(e.max*.4));B.log.push(`Treinador usou uma poção! ${S[e.i].n} recuperou PS.`);return}
 if(k>=0&&e.pp&&e.pp[k]<=0)k=-1;
 B.log.push(hit(e,p,k));
 if(p.hp<=0){B.log.push(`${S[p.i].n} desmaiou!`);
  const n=act();
  if(n)B.log.push(`Você enviou ${S[n.i].n}!`);
  else{B.log.push('Você ficou sem monstrinhos…');B.over='lose'}}
}
function gain(p,e){
 const xp=Math.floor(e.l*10*(G.battle.wild?1:1.5));
 p.xp+=xp;G.coins=(G.coins||0)+Math.floor(xp/2);G.battle.log.push(`${S[p.i].n} ganhou ${xp} XP e ${Math.floor(xp/2)} 💰.`);
 while(p.xp>=10*p.l){p.xp-=10*p.l;p.l++;G.battle.lvF=1;calc(p);p.hp=Math.min(p.max,p.hp+6);evo(p);learnCheck(p);G.battle.log.push(`⬆️ ${S[p.i].n} subiu para o nível ${p.l}!`)}
}
function rewardMon(n){
 if(G.team.length>=6){G.battle.log.push('Equipe cheia: sem novo monstrinho de recompensa.');return}
 const g=GY[n],have=G.team.map(m=>m.i),cand=BASE.filter(i=>!have.includes(i)),pref=cand.filter(i=>S[i].t===g.ty||S[i].t2===g.ty),arr=pref.length?pref:cand.length?cand:BASE;
 const r=mk(arr[rnd(arr.length)],Math.max(5,g.t[0][1]-6));G.team.push(r);reg(r.i);
 G.battle.log.push(`🎁 Recompensa: ${S[r.i].n} (Nv ${r.l}) entrou na sua equipe!`);
}
function foeDown(){
 const B=G.battle,p=act(),e=B.foe;
 B.log.push(`${S[e.i].n} desmaiou!`);gain(p,e);
 if(B.queue.length){B.foe=B.queue.shift();B.log.push(`${B.tt?'Treinador '+B.tt:B.vt?'O rival':GY[B.gym].l} enviou ${S[B.foe.i].n} (Nv ${B.foe.l})!`)}
 else{B.over='win';
  if(B.vt){const r=2+B.vt;G.vc=(G.vc||0)+r;G.vbest=Math.max(G.vbest||0,B.vt);G.vn=B.vt+1;G.vsel=B.vt+1;B.log.push(`🪙 +${r} Moedas Virtuosas!`)}
  if(!B.wild&&!B.tt&&!B.vt&&!G.badges.includes(B.gym)){G.badges.push(B.gym);B.log.push(`🏅 Você ganhou a ${GY[B.gym].n}!`);rewardMon(B.gym)}}
}
function turn(k){
 const B=G.battle;if(B.over)return;if(B.pvp)return pvpAct({t:'a',k});B.log=[];if(k>=0&&act().pp&&act().pp[k]<=0)k=-1;
 if(B.tt)B.used.push(S[act().i].t);B.log.push(hit(act(),B.foe,k));
 if(B.foe.hp<=0)foeDown();else{eTurn();if(!B.over)regen(B)}
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
 B.log=[`Vai, ${S[m.i].n}!`];eTurn();save();R();
}
function leave(){if(G.battle.pvp){pvpAct({t:'f'});return}const B=G.battle;B.over='quit';G.note='🏳️ Você desistiu da batalha. A desistência foi registrada.';end()}
function cap(){
 const B=G.battle,e=B.foe;
 if(G.team.length>=6){B.log=['Sua equipe já tem 6 monstrinhos!'];return R()}
 if(Math.random()<.2+.6*(1-e.hp/e.max)){G.team.push(e);reg(e.i);B.log=[`🎯 Você capturou ${S[e.i].n}!`];B.over='caught'}
 else{B.log=['A bola falhou!'];eTurn()}
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
function trEV(i,s){const m=G.team[i];if((G.vc||0)<2||m.ev[s]>=252){G.note='Moedas Virtuosas insuficientes ou limite de EV atingido.';R();return}G.vc-=2;m.ev[s]=Math.min(252,m.ev[s]+8);const o=m.max;calc(m);m.hp+=m.max-o;save();R()}
function trIV(i,s){const m=G.team[i];if((G.vc||0)<6||m.iv[s]>=31){G.note='Moedas Virtuosas insuficientes ou IV já no máximo.';R();return}G.vc-=6;m.iv[s]=Math.min(31,m.iv[s]+4);const o=m.max;calc(m);m.hp+=m.max-o;save();R()}
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
