const TNPC={Fogo:{e:'🧑‍🍳',n:'Treinador Brasa'},Água:{e:'🏄',n:'Treinador Marés'},Planta:{e:'🧑‍🌾',n:'Treinadora Folhas'},Elétrico:{e:'🧑‍🔧',n:'Treinador Faísca'},Pedra:{e:'🧗',n:'Treinador Seixo'},Gelo:{e:'⛷️',n:'Treinadora Flocos'},Psíquico:{e:'🕵️',n:'Treinador Mente'},Voador:{e:'🧑‍✈️',n:'Treinador Brisa'}};
const GYX=[{e:'👷',bio:'Caverna rochosa'},{e:'🧜‍♀️',bio:'Costa marítima'},{e:'👨‍🎤',bio:'Planície de tempestade'},{e:'🧝‍♀️',bio:'Floresta encantada'},{e:'👸',bio:'Geleira'},{e:'🦸',bio:'Picos nas nuvens'},{e:'🧙‍♀️',bio:'Vale místico'},{e:'🧑‍🚒',bio:'Vulcão'}];
const ARENA={Fogo:['#3a1209','#c2462b','#6b2a17','🌋','🔥'],Água:['#7cc4ee','#2c78b8','#3b6f8f','🌊','🐚'],Planta:['#bfe6a0','#5aa84a','#3e7a34','🌳','🌸'],Elétrico:['#2b2a45','#e0b92b','#6d6a2e','⛈️','⚡'],Pedra:['#b9a58c','#7b6a55','#5a4c3c','⛰️','🪨'],Gelo:['#d6f1ff','#8fd0f0','#5c9fc2','🧊','❄️'],Psíquico:['#3a1d5c','#8d4fc4','#59318a','🔮','✨'],Voador:['#8fd0ff','#e8f6ff','#9bbcd8','☁️','🌤️']};
const EFX={Fogo:['🔥','fly',3],Água:['💧','fly',4],Planta:['🍃','fly',4],Gelo:['❄️','fly',3],Voador:['💨','fly',3],Psíquico:['🔮','fly',1],Pedra:['🪨','fall',3],Elétrico:['⚡','strike',3],Normal:['💥','pop',1]};
const POS={e:[78,100],p:[22,207]};
function fxHTML(x,n){
 const [em,k,c]=EFX[x.t]||EFX.Normal,t0=n*.9,from=POS[x.a],to=POS[x.a==='e'?'p':'e'];
 let o='';
 for(let i=0;i<c;i++){
  const j=i-(c-1)/2;
  if(k==='fly')o+=`<span class=fx style="--x0:${from[0]}%;--y0:${from[1]+j*12}px;--x1:${to[0]}%;--y1:${to[1]+j*14}px;animation:fly .35s ${t0+.05+i*.07}s both">${em}</span>`;
  else if(k==='fall')o+=`<span class=fx style="--x0:${to[0]+j*5}%;--y0:${to[1]-150}px;--x1:${to[0]+j*5}%;--y1:${to[1]}px;animation:fly .3s ${t0+.1+i*.08}s both">${em}</span>`;
  else if(k==='strike')o+=`<span class=fx style="left:${to[0]+j*4}%;top:${to[1]-20}px;font-size:40px;animation:strike .35s ${t0+.3+i*.1}s both">${em}</span>`;
  else o+=`<span class=fx style="left:${to[0]}%;top:${to[1]}px;font-size:46px;animation:pop .4s ${t0+.35}s both">${em}</span>`;
 }
 if(x.t==='Psíquico')o+=`<i class=ring style="left:${to[0]}%;top:${to[1]}px;animation:ring .5s ${t0+.35}s both"></i>`;
 if(x.t==='Elétrico')o+=`<i class=flash style="animation:flash .35s ${t0+.3}s both"></i>`;
 return o;
}
function sfx(w,d){if(!MUS.on)return;try{if(!ctxA())return;const t=MUS.ac.currentTime+d,n=w?[[523,0,.25],[659,.15,.25],[784,.3,.25],[1047,.45,.3],[1047,.8,.9],[1319,.8,.9],[1568,.8,.9]]:[[392,0,.35],[370,.3,.35],[349,.6,.35],[294,.95,1]];n.forEach(([f,o,l])=>tone(f,t+o,l,w?.1:.06,w?'triangle':'sawtooth'))}catch(e){}}
function arena(B,p){
 const ev=G.fxq||[];G.fxq=[];
 const ty=B.tt||(B.vt?'Psíquico':B.tw?'Gelo':B.pvp?'Voador':B.wild?'Planta':GY[B.gym].ty),A=ARENA[ty],eF=B.lf!==B.foe,eM=B.lm!==p,evo=B.evoF,lv=B.lvF;
 B.lf=B.foe;B.lm=p;B.evoF=0;B.lvF=0;
 const T=n=>n*.9,last=ev.length?T(ev.length-1)+.7:0;
 const side=(m,s,en)=>{
  const mine=s==='p',hh=ev.findIndex(x=>x.d===m),at=ev.findIndex(x=>x.a===s),an=[];
  if(en)an.push(`${mine?'inL':'inR'} .6s both`);
  if(at>=0)an.push(`${mine?'lungeP':'lungeE'} .5s ${T(at)}s`);
  if(hh>=0)an.push(`hitA .5s ${T(hh)+.4}s`);
  if(mine&&evo)an.push(`evolveA 1s ${last}s`);
  if(mine&&B.over==='win')an.push(`jumpA .5s ${last+.4}s 3`);
  if(m.hp<=0)an.push(`faintA .7s ${last}s forwards`);
  else an.push(`bob 2.2s ${last+(mine&&evo?1:0)+(mine&&B.over==='win'?2:0)}s ease-in-out infinite`);
  const hv=hh>=0?ev[hh]:null,r=m.hp/m.max,pre=hv?hv.pre:r,bd=hv?T(hh)+.4:0,col=r>.5?'var(--acc)':r>.2?'var(--warn)':'var(--bad)';
  return `<div class="pl ${mine?'pmy':'pf'} ${mine&&lv?'lvup':''}"><b>${S[m.i].n}</b>${AB(m).burn?' <span title="Queimado">🔥</span>':''} <small>Nv ${m.l}</small><div class=bar><i style="width:${100*r}%;background:${col};--from:${100*pre}%;animation:barin .6s ${bd}s both"></i></div><small>${m.hp}/${m.max} PS</small>${mine?'':`<br><small>Fraco: ${wk(m).we.join('')||'—'}</small>`}</div><i class="plat ${mine?'pmy':'pf'}"></i><span class="spr ${mine?'me':'fo'}" style="animation:${an.join(',')}">${mine&&S[m.i].b?S[m.i].b:S[m.i].e}${hv?`<em class="dn ${hv.M>1?'se':hv.M<1?'nv':''}" style="animation-delay:${bd}s">−${hv.dmg}</em>`:''}</span>`;
 };
 let endHTML='';
 if(B.over==='win'||B.over==='lose'){
  const w=B.over==='win',d=last+.3;
  if(!B.sfx){B.sfx=1;sfx(w,d)}
  endHTML=`<div class=endfx>${w?'':`<i class=shade style="animation:shade 1s ${d}s both"></i>`}`;
  const E=w?['🎉','✨','⭐','🎊','🏆']:['💧','💧','☁️'];
  for(let i=0;i<(w?22:12);i++)endHTML+=`<span class=cf style="left:${Math.random()*94}%;animation:cfall ${w?1.8+Math.random()*1.4:2.6+Math.random()*1.4}s ${d+Math.random()*(w?.9:1.6)}s ${w?2:1} both">${E[i%E.length]}</span>`;
  endHTML+=`<div class="ban ${B.over}" style="animation:${w?'banIn .7s':'banLose 1s'} ${d}s both">${w?'🏆 VITÓRIA!':'💔 DERROTA'}</div></div>`;
 }
 return `<div class=arena style="--a:${A[0]};--b:${A[1]};--g:${A[2]};${(()=>{const sk=ev.findIndex(x=>x.M>1),L=[B.over==='lose'?`gray 1.2s ${last+.3}s both`:'',sk>=0?`shk .45s ${T(sk)+.4}s`:''].filter(Boolean);return L.length?'animation:'+L.join(','):''})()}"><span class="deco d1">${A[3]}</span><span class="deco d2">${A[4]}</span><span class="deco d3">${A[3]}</span>${side(B.foe,'e',eF)}${side(p,'p',eM)}${ev.map((x,n)=>fxHTML(x,n)).join('')}${endHTML}</div>`;
}
