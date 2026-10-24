/* Missões (tela screens/missions.html).
   Três listas: diárias (zeram à meia-noite), semanais (zeram junto com o Boss) e as do jogo
   (permanentes, só se cumprem uma vez). A recompensa é sempre Moeda Safari, a mesma que paga
   as invocações da Zona Safari — as diárias juntas rendem `MSDAY`, o suficiente para
   5 invocações em cada uma das 4 regiões.

   PARA TROCAR AS MISSÕES: mexa só na tabela `MIS` abaixo. Cada missão é
     {id, n: nome, d: descrição, g: meta, r: moedas, ev: 'evento'}  -> conta chamadas de msAdd('evento')
     {id, n, d, g, r, f: ()=>número}                                -> lê o estado do jogo na hora
   `id` precisa ser único e começar com d_, w_ ou g_ (diária, semanal, do jogo). Mudar o `id`
   de uma missão zera o progresso dela para quem já estava jogando — é o jeito de "reiniciar" uma. */
const MSSUM=20;                 /* custo de uma invocação, em Moedas Safari */
const MSDAY=MSSUM*5*4;          /* 5 invocações em cada uma das 4 regiões = 400 por dia */
const MIS={
 d:[
  {id:'d_win', n:'Treino do dia',      d:'Vença 3 batalhas',                    g:3, r:100, ev:'win'},
  {id:'d_tac', n:'Mesa posta',         d:'Vença 1 batalha tática',              g:1, r:100, ev:'tac'},
  {id:'d_sum', n:'Chamado da zona',    d:'Invoque 2 vezes na Zona Safari',      g:2, r:100, ev:'sum'},
  {id:'d_heal',n:'Pit stop',           d:'Passe no Centro de Cura',             g:1, r:100, ev:'heal'}
 ],
 w:[
  {id:'w_gym',  n:'Rota dos ginásios', d:'Vença 2 líderes de ginásio',          g:2, r:500, ev:'gym'},
  {id:'w_boss', n:'Encarar o dragão',  d:'Entre no Boss semanal',               g:1, r:400, ev:'boss'},
  {id:'w_breed',n:'Casa cheia',        d:'Cruze 3 vezes no laboratório',        g:3, r:300, ev:'breed'}
 ],
 g:[
  {id:'g_badges',n:'Campeão da liga',  d:'Conquiste as 8 insígnias',            g:8, r:1000, f:()=>(G.badges||[]).length},
  {id:'g_dex',   n:'Mostruário cheio', d:'Registre as 9 formas no mostruário',  g:9, r:800,  f:()=>(G.dex||[]).length},
  {id:'g_lv',    n:'Veterano',         d:'Leve um Numiu ao nível 50',           g:50,r:600,  f:()=>Math.max(0,...(G.team||[]).map(m=>m.l|0))},
  {id:'g_leg',   n:'Voz antiga',       d:'Liberte um lendário na Mochila',      g:1, r:500,  f:()=>Object.keys(G.leg||{}).length},
  {id:'g_team',  n:'Equipe completa',  d:'Tenha 6 Numius na equipe',            g:6, r:300,  f:()=>(G.team||[]).length}
 ]
};
const MSALL=()=>MIS.d.concat(MIS.w,MIS.g);
const msToday=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
/* estado salvo: d = dia das diárias, w = semana das semanais, p = progresso, c = já resgatadas */
function msState(){
 if(!G.ms)G.ms={d:'',w:0,p:{},c:{}};
 const m=G.ms,t=msToday(),w=bsWeek();
 if(m.d!==t){m.d=t;MIS.d.forEach(x=>{delete m.p[x.id];delete m.c[x.id]})}
 if(m.w!==w){m.w=w;MIS.w.forEach(x=>{delete m.p[x.id];delete m.c[x.id]})}
 return m;
}
/* conta um evento do jogo em todas as missões que esperam por ele */
function msAdd(ev,n){
 const st=msState();let mexeu=false;
 MSALL().forEach(x=>{if(x.ev!==ev||st.c[x.id])return;
  const v=Math.min(x.g,(st.p[x.id]||0)+(n||1));if(v!==st.p[x.id]){st.p[x.id]=v;mexeu=true}});
 if(mexeu)save();
}
const msVal=x=>{const st=msState();return x.f?Math.min(x.g,x.f()|0):(st.p[x.id]||0)};
const msDone=x=>msVal(x)>=x.g;
const msCan=x=>msDone(x)&&!msState().c[x.id];
const msCount=()=>MSALL().filter(msCan).length;
function msClaim(id){
 const x=MSALL().find(m=>m.id===id);
 if(!x)return{err:'Missão desconhecida.'};
 if(!msCan(x))return{err:msDone(x)?'Já resgatada.':'Missão ainda não concluída.'};
 msState().c[id]=1;sfState().mo+=x.r;save();
 return{ok:1,id,r:x.r,ms:msPub()};
}
const msRow=x=>({id:x.id,n:x.n,d:x.d,g:x.g,r:x.r,v:msVal(x),ok:msDone(x),got:!!msState().c[x.id]});
const msPub=()=>({mo:sfState().mo,day:MSDAY,sum:MSSUM,wl:bsNow().left,
 d:MIS.d.map(msRow),w:MIS.w.map(msRow),g:MIS.g.map(msRow)});
/* ---------- ponte com a tela ---------- */
const MS={n:'missions',ready:false};
function msMount(){
 if(typeof document.createElement!=='function')return;
 let f=document.getElementById('msf');
 if(!f){f=document.createElement('iframe');f.id='msf';f.className='lgf';f.title='Missões';f.style.zIndex=50;document.body.appendChild(f);f.srcdoc=dec(MS)}
 if(!MS.ready&&!MS.tt){MS.tt=1;MS.t=setTimeout(()=>{if(!MS.ready&&G.screen==='missions'){G.msfb=1;R()}},12000)}
 msToggle();
}
function msToggle(){if(typeof document.getElementById!=='function')return;const f=document.getElementById('msf');if(f)f.style.display=(G.screen==='missions'&&!G.msfb)?'block':'none'}
const msData=()=>({numius:1,k:'msdata',ms:msPub()});
function msSend(){const f=document.getElementById('msf');if(MS.ready&&f&&f.contentWindow)f.contentWindow.postMessage(msData(),'*')}
if(typeof addEventListener==='function')addEventListener('message',e=>{const f=document.getElementById('msf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};if(!d.numius)return;
 const post=o=>f.contentWindow.postMessage(Object.assign({numius:1},o),'*');
 if(d.k==='ready'){MS.ready=true;msSend();msToggle()}
 else if(d.k==='nav'){G.screen='map';R()}
 else if(d.k==='claim'){post({k:'msclaim',...msClaim(String(d.id||''))})}
});
