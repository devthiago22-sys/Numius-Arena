function titleGo(){G.tp=1;if(MUS.on){try{if(ctxA()){const t=MUS.ac.currentTime+.02;[[523,0],[659,.12],[784,.24],[1047,.36],[1319,.5]].forEach(([f,o])=>tone(f,t+o,.5,.1,'triangle'))}}catch(e){}}R()}
const SC={n:'starter'};
const HC={n:'heal',ready:false,t:0};
const dec=o=>SCREENS[o.n];
function iw(id,o,title){let f=document.getElementById(id);if(!f){f=document.createElement('iframe');f.id=id;f.className='lgf';f.title=title;f.style.cssText='visibility:hidden;pointer-events:none;z-index:-1';o.ready=false;document.body.appendChild(f);f.srcdoc=dec(o)}return f}
function ifv(f,on,o){if(!f)return;const s=f.style;if(on){s.display='block';s.visibility='';s.pointerEvents='';s.zIndex=''}else if(o.ready){s.display='none'}else{s.display='block';s.visibility='hidden';s.pointerEvents='none';s.zIndex='-1'}}
function idle(fn){if(typeof requestIdleCallback==='function')requestIdleCallback(fn,{timeout:2500});else setTimeout(fn,300)}
function preS(){if(G.sfb||document.getElementById('sf'))return;setTimeout(()=>idle(()=>{if(!G.sfb&&!document.getElementById('sf')&&(G.screen==='hero'||G.screen==='start'))iw('sf',SC,'Escolha seu parceiro')}),600)}
function preM(){if(G.mfb||document.getElementById('mnf'))return;setTimeout(()=>idle(()=>{if(!G.mfb&&!document.getElementById('mnf')&&['hero','start','map'].includes(G.screen))iw('mnf',MN,'Menu principal')}),600)}
function sVis(){if(typeof document.getElementById!=='function')return;ifv(document.getElementById('sf'),G.screen==='start'&&!G.sfb,SC)}
function sMount(){if(typeof document.createElement!=='function')return;iw('sf',SC,'Escolha seu parceiro');if(!SC.ready&&!SC.tt){SC.tt=1;SC.t=setTimeout(()=>{if(!SC.ready&&G.screen==='start'){G.sfb=1;R()}},12000)}sVis()}
function sImgs(){return [0,3,6].map(f=>{const e=document.createElement('i');e.className='f'+f;e.style.cssText='position:absolute;width:1px;height:1px;opacity:0';document.body.appendChild(e);const v=getComputedStyle(e).backgroundImage;e.remove();const m=/url\(["']?(.*?)["']?\)$/.exec(v);return m?m[1]:''})}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=$('#sf');if(!f||!f.contentWindow||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;if(d.k==='ready'){SC.ready=true;f.contentWindow.postMessage({numius:1,k:'imgs',a:sImgs(),info:[0,3,6].map(i=>({h:S[i].h,a:S[i].a,ab:S[i].ab[0]}))},'*');sVis();preM()}else if(d.k==='pick'&&G.screen==='start'&&[0,1,2].includes(d.i))pick([0,3,6][d.i])});
const HF={n:'hero'};
function hMount(){const f=$('#hf');if(!f||!f.dataset||f.dataset.m)return;f.dataset.m=1;HF.ready=false;f.srcdoc=dec(HF);clearTimeout(HF.t);HF.t=setTimeout(()=>{if(!HF.ready&&G.screen==='hero'){G.hfb=1;R()}},9000)}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=$('#hf');if(!f||!f.contentWindow||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;if(d.k==='ready'){HF.ready=true;preS()}else if(d.k==='hero'){const n=String(d.name||'').trim().slice(0,16);if(n.length<2)return;const cl=(v,m)=>Math.max(0,Math.min(m,v|0));G.hero={g:d.g==='f'?'f':'m',skin:cl(d.skin,4),col:cl(d.col,5),hair:cl(d.hair,3),name:n};save();G.screen=G.team.length?'map':'start';R()}});
const MN={n:'menu',ready:false,t:0};
const LG={n:'login',ready:false,t:0};
