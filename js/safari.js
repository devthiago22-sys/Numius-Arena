/* Zona Safari (tela screens/safari.html).
   A tela mostra o mapa com as 4 zonas e o laboratório no meio do lago; o jogo faz os sorteios,
   guarda as Moedas Safari, o estoque do laboratório e os cruzamentos — tudo dentro de `G.sf`,
   para o progresso entrar no `save()`. A tela nunca sorteia nada sozinha. */
const SF={n:'safari',ready:false};
/* zona -> família de Numius (fam -1 = qualquer; o Deserto é a zona mista) */
const SFZ={GELO:0,FOGO:1,PLANTA:2,DESERTO:-1};
const SFSPIN=5,SFCOST=50,SFLAB=60,SFDRAW=5;
function sfToday(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
/* estado salvo: d = dia dos giros, sp = giros restantes, mo = moedas, lab = estoque, u = próximo id */
function sfState(){
 if(!G.sf)G.sf={d:'',sp:SFSPIN,mo:120,lab:[],u:1};
 const t=sfToday();if(G.sf.d!==t){G.sf.d=t;G.sf.sp=SFSPIN}
 if(!Array.isArray(G.sf.lab))G.sf.lab=[];
 return G.sf;
}
function sfMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('sff');
 if(!f){f=document.createElement('iframe');f.id='sff';f.className='lgf';f.title='Zona Safari';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(SF)}
 if(!SF.ready&&!SF.tt){SF.tt=1;SF.t=setTimeout(()=>{if(!SF.ready&&G.screen==='safari'){G.sffb=1;R()}},12000)}
 sfToggle();
}
function sfToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('sff');if(!f)return;const on=G.screen==='safari'&&!G.sffb;f.style.display=on?'block':'none';if(on&&!SF.foc){SF.foc=1;setTimeout(()=>{try{f.focus();f.contentWindow.focus()}catch(e){}},50)}if(!on)SF.foc=0}
/* sorteia um Numiu da zona: estágio 1/2/3 em 72/23/5%, nível conforme o estágio */
function sfRoll(z){
 const fz=SFZ[z],fam=fz<0?Math.floor(Math.random()*3):fz;
 const x=Math.random()*100,st=x<72?1:x<95?2:3;
 const pool=[];S.forEach((s,i)=>{if(s.fam===fam&&s.s===st)pool.push(i)});
 if(!pool.length)S.forEach((s,i)=>{if(s.fam===fam&&s.s===1)pool.push(i)});
 const i=pool[Math.floor(Math.random()*pool.length)];
 const l=st===1?5+Math.floor(Math.random()*14):st===2?18+Math.floor(Math.random()*16):36+Math.floor(Math.random()*18);
 return{i,l,sx:Math.random()<.5?'M':'F',z};
}
function sfSpin(z){
 if(SFZ[z]===undefined)return{err:'Zona desconhecida.'};
 const st=sfState();
 if(st.sp<=0)return{err:'Sem giros! Volta amanhã.'};
 st.sp--;const got=[];let coins=0,full=0;
 for(let k=0;k<SFDRAW;k++){const m=sfRoll(z);m.u=st.u++;coins+=m.l;reg(m.i);
  if(st.lab.length<SFLAB)st.lab.push(m);else full++;got.push(m)}
 st.mo+=coins;save();
 return{ok:1,z,got,coins,full,sf:sfPub()};
}
/* cruzamento: mesma espécie, sexos diferentes, custa SFCOST moedas.
   O filhote nasce no próprio laboratório, com nível (a+b)/2 + 0 a 5. */
function sfBreed(ua,ub){
 const st=sfState(),a=st.lab.find(m=>m.u===ua),b=st.lab.find(m=>m.u===ub);
 if(!a||!b||a===b)return{err:'Escolha dois Numius do estoque.'};
 if(a.i!==b.i)return{err:'Só a mesma espécie cruza.'};
 if(a.sx===b.sx)return{err:'Precisa de um ♂ e uma ♀.'};
 if(st.mo<SFCOST)return{err:'Faltam Moedas Safari.'};
 if(st.lab.length>=SFLAB)return{err:'O laboratório está lotado.'};
 st.mo-=SFCOST;
 const l=Math.max(1,Math.min(60,Math.floor((a.l+b.l)/2)+Math.floor(Math.random()*6)));
 const baby={u:st.u++,i:a.i,l,sx:Math.random()<.5?'M':'F',z:a.z,nb:1};
 st.lab.push(baby);reg(baby.i);save();
 return{ok:1,baby,sf:sfPub()};
}
/* tira um Numiu do laboratório e põe na equipe */
function sfTake(u){
 const st=sfState(),k=st.lab.findIndex(m=>m.u===u);
 if(k<0)return{err:'Numiu não está no laboratório.'};
 if(G.team.length>=6)return{err:'Sua equipe está cheia (6/6).'};
 const o=st.lab[k],m=mk(o.i,Math.max(1,Math.min(60,o.l|0)));
 G.team.push(m);reg(m.i);st.lab.splice(k,1);G.sfc=(G.sfc||0)+1;save();
 return{ok:1,n:S[m.i].n,l:m.l,team:G.team.length,sf:sfPub()};
}
function sfRelease(u){
 const st=sfState(),k=st.lab.findIndex(m=>m.u===u);
 if(k<0)return{err:'Numiu não está no laboratório.'};
 st.lab.splice(k,1);save();return{ok:1,sf:sfPub()};
}
const sfPub=()=>{const st=sfState();return{mo:st.mo,sp:st.sp,max:SFSPIN,cost:SFCOST,cap:SFLAB,lab:st.lab}};
function sfData(){
 const h=G.hero||{g:'f',skin:1,col:0,name:'Você'};
 return{numius:1,k:'sfdata',hero:{g:h.g==='m'?'m':'f',skin:h.skin|0,hair:(h.hair!=null?h.hair:h.col)|0,name:String(h.name||'Você')},
  team:G.team.length,species:S.map((s,i)=>({i,n:s.n,t:s.t,t2:s.t2||null,fam:s.fam,s:s.s})),
  sf:sfPub(),imgs:SF.sent?null:(SF.sent=1,btImgs())};
}
function sfSend(){const f=document.getElementById('sff');if(SF.ready&&f&&f.contentWindow)f.contentWindow.postMessage(sfData(),'*')}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('sff');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 const post=o=>f.contentWindow.postMessage(Object.assign({numius:1},o),'*');
 if(d.k==='ready'){SF.ready=true;SF.sent=0;sfSend();sfToggle()}
 else if(d.k==='nav'){G.screen='map';R()}
 else if(d.k==='spin'){post({k:'sfspin',...sfSpin(String(d.z||''))})}
 else if(d.k==='breed'){post({k:'sfbreed',...sfBreed(d.a|0,d.b|0)})}
 else if(d.k==='take'){post({k:'sftake',...sfTake(d.u|0)})}
 else if(d.k==='release'){post({k:'sfrelease',...sfRelease(d.u|0)})}
});
