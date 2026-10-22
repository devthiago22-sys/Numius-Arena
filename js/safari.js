/* Zona Safari (tela screens/safari.html).
   A tela cuida do mapa, dos encontros e do "Laço de Sintonia" (captura por ritmo, sem bola).
   O jogo só fornece os dados (personagem, espécies, sprites) e grava o Numiu quando o vínculo é formado. */
const SF={n:'safari',ready:false};
function sfMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('sff');
 if(!f){f=document.createElement('iframe');f.id='sff';f.className='lgf';f.title='Zona Safari';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(SF)}
 if(!SF.ready&&!SF.tt){SF.tt=1;SF.t=setTimeout(()=>{if(!SF.ready&&G.screen==='safari'){G.sffb=1;R()}},12000)}
 sfToggle();
}
function sfToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('sff');if(!f)return;const on=G.screen==='safari'&&!G.sffb;f.style.display=on?'block':'none';if(on&&!SF.foc){SF.foc=1;setTimeout(()=>{try{f.focus();f.contentWindow.focus()}catch(e){}},50)}if(!on)SF.foc=0}
function sfData(){
 const h=G.hero||{g:'f',skin:1,col:0,name:'Você'};
 return{numius:1,k:'sfdata',hero:{g:h.g==='m'?'m':'f',skin:h.skin|0,hair:(h.hair!=null?h.hair:h.col)|0,name:String(h.name||'Você')},team:G.team.length,
  species:S.map((s,i)=>({i,n:s.n,t:s.t,t2:s.t2||null,fam:s.fam,s:s.s})),imgs:SF.sent?null:(SF.sent=1,btImgs())}
}
function sfSend(){const f=document.getElementById('sff');if(SF.ready&&f&&f.contentWindow)f.contentWindow.postMessage(sfData(),'*')}
function sfCatch(i,l){
 if(!S[i])return{err:'Numiu desconhecido.'};
 if(G.team.length>=6)return{err:'Sua equipe está cheia (6/6).'};
 const lv=Math.max(1,Math.min(60,l|0)),m=mk(i,lv);m.i=i;calc(m);m.hp=m.max;m.mv=initMoves(m.i,m.l);m.pp=m.mv.map(k=>MOVES[k].pp);
 G.team.push(m);reg(m.i);G.sfc=(G.sfc||0)+1;save();
 return{ok:true,i:m.i,n:S[m.i].n,l:m.l,team:G.team.length};
}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('sff');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 const post=o=>f.contentWindow.postMessage(Object.assign({numius:1},o),'*');
 if(d.k==='ready'){SF.ready=true;SF.sent=0;sfSend();sfToggle()}
 else if(d.k==='nav'){G.screen='map';R()}
 else if(d.k==='catch'){post({k:'sfcaught',...sfCatch(d.i|0,d.l|0)})}
});
