/* Dados do jogo: famílias de númios, espécies, tipos, golpes, aprendizado por nível e ginásios */
const FAM=[
["Hydrake","Água","Dragão",["Hydrake"],80,78,[["Jato Serpentino", "Água", 65], ["Mordida Dracônica", "Normal", 55], ["Espiral Marinha", "Água", 80], ["Tempestade Draconiana", "Água", 100, "dr"]],["Maré Constante", "regen"]],
["Blazleo","Fogo","Pedra",["Blazleo"],74,86,[["Garra de Brasa", "Fogo", 65], ["Cristal Cortante", "Pedra", 60], ["Juba Flamejante", "Fogo", 80], ["Inferno de Obsidiana", "Fogo", 100, "cr"]],["Fúria da Juba", "fury"]],
["Byron","Pedra","Planta",["Byron"],90,72,[["Pedrada Musgosa", "Pedra", 65], ["Folha Cortante", "Planta", 60], ["Casco Esmeralda", "Pedra", 80], ["Terremoto Verdejante", "Planta", 100, "dr"]],["Casco de Rocha", "tough"]]];
const S=[];
FAM.forEach(([n,t,t2,ns,h,a],f)=>{const m3=ns.length>2;(m3?[0,1,2]:[0]).forEach(k=>S.push({n:ns[k],e:`<i class="im f${f}" style="--k:${m3?[.74,.88,1][k]:1}"></i>`,t,t2,h:m3?h+[0,20,42][k]:h,a:m3?a+[0,14,30][k]:a,fam:f,s:k+1,...(m3&&k<2?{x:f*3+k+1}:{}),...(m3?{}:{ps:1,b:`<i class="im b${f}" style="--k:1"></i>`})}))});
const BASE=[...S.keys()].filter(i=>S[i].s===1);
const DEX=[];BASE.forEach(b=>{let i=b;DEX.push(i);while(S[i].x!==undefined){i=S[i].x;DEX.push(i)}});
const PREV={};S.forEach((x,i)=>{if(x.x!==undefined)PREV[x.x]=i});
const SE={Fogo:['Planta','Gelo'],Água:['Fogo','Pedra'],Planta:['Água','Pedra'],Elétrico:['Água','Voador'],Pedra:['Fogo','Gelo','Voador'],Gelo:['Planta','Voador'],Psíquico:[],Voador:['Planta']};
const NV={Fogo:['Fogo','Água','Pedra'],Água:['Água','Planta'],Planta:['Fogo','Planta','Voador'],Elétrico:['Elétrico','Planta','Pedra'],Pedra:['Pedra'],Gelo:['Fogo','Água','Gelo'],Psíquico:['Psíquico'],Voador:['Elétrico','Pedra']};
const T2M={Terra:'Pedra',Metal:'Pedra',Vento:'Voador',Sombrio:'Psíquico'};
S.forEach(x=>{x.tt=[x.t];const m=T2M[x.t2]||x.t2;if(m&&m!==x.t&&NV[m])x.tt.push(m)});
const effv=(a,m)=>S[m.i].tt.reduce((p,t)=>p*mult(a,t),1);
const wk=m=>{const w=[],r=[],we=[];TY.forEach(t=>{const e=effv(t,m);if(e>1){w.push(TE[t]+' '+t+(e>2?' ×4':''));we.push(TE[t]+(e>2?'²':''))}else if(e<1)r.push(TE[t]+' '+t)});return{w,r,we}};
const wkHTML=m=>{const{w,r}=wk(m);return `<div class=wkb><b>Tipo:</b> ${S[m.i].t}${S[m.i].t2?' · '+S[m.i].t2:''}<br><b>Fraco contra:</b> ${w.join(' · ')||'—'}<br><b>Resiste a:</b> ${r.join(' · ')||'—'}<br><b>Evolução:</b> ${S[m.i].x!==undefined?'Nv '+(S[m.i].s===1?16:36)+' → '+S[S[m.i].x].n:'forma final'}<br><b>Habilidade:</b> ${PA(m).n} — ${pdesc(m)}</div>`};
const MV={Fogo:'Chama',Água:'Jato d\'água',Planta:'Folha-lâmina',Elétrico:'Choque',Pedra:'Pedrada',Gelo:'Raio gelado',Psíquico:'Confusão',Voador:'Rajada'};
const TY=['Fogo','Água','Planta','Elétrico','Pedra','Gelo','Psíquico','Voador'],TN=['Iniciante','Esperto','Estrategista','Mestre'],TE={Fogo:'🔥',Água:'💧',Planta:'🍃',Elétrico:'⚡',Pedra:'🪨',Gelo:'❄️',Psíquico:'🔮',Voador:'🪶'};
const MOVES=[{n:'Investida',t:'Normal',p:45},{n:'Pancada',t:'Normal',p:60},...TY.map(t=>({n:MV[t],t,p:60})),...FAM.slice(0,20).flatMap((g,f)=>g[6].map(([n,t,p,x],j)=>({n,t,p,x,f,j})))];
MOVES.push({n:'Golpe Pesado',t:'Normal',p:75});
FAM.slice(20).forEach((g,q)=>g[6].forEach(([n,t,p,x],j)=>MOVES.push({n,t,p,x,f:20+q,j})));
MOVES.forEach(x=>{x.pp=x.p>=100?5:x.p>=80?10:x.p>=65?15:x.p>=55?20:25});
const HEAVY=MOVES.findIndex(x=>x.n==='Golpe Pesado'),STRUG={n:'Luta Desesperada',t:'Normal',p:40,pp:1};
const MB=f=>f<20?10+f*4:91+(f-20)*4;
const defMv=m=>[0,1,2,3].map(j=>MB(S[m.i].fam)+j);
const mp=(x,m)=>x.p;
const LS=f=>[[1,0],[1,1],[1,MB(f)],[1,MB(f)+1],[10,2+TY.indexOf(FAM[f][1])],[16,MB(f)+2],[26,HEAVY],[36,MB(f)+3]];
function initMoves(i,l){return LS(S[i].fam).filter(a=>a[0]<=l).map(a=>a[1]).slice(-4)}
const restPP=m=>{m.pp=(m.mv||[]).map(k=>MOVES[k].pp)};
const GY=[
{l:'Rocha',c:'Ginásio Granito',bd:'🪨',n:'Insígnia Pedra',ty:'Pedra',t:[[2,8],[1,10]]},
{l:'Marina',c:'Ginásio Maré',bd:'💧',n:'Insígnia Onda',ty:'Água',t:[[0,12],[0,14]]},
{l:'Volt',c:'Ginásio Faísca',bd:'⚡',n:'Insígnia Trovão',ty:'Elétrico',t:[[0,16],[1,18]]},
{l:'Flora',c:'Ginásio Jardim',bd:'🍃',n:'Insígnia Folha',ty:'Planta',t:[[2,20],[2,22]]},
{l:'Frida',c:'Ginásio Geleira',bd:'❄️',n:'Insígnia Cristal',ty:'Gelo',t:[[0,24],[2,26]]},
{l:'Aero',c:'Ginásio Céu',bd:'🪶',n:'Insígnia Pena',ty:'Voador',t:[[1,28],[0,30]]},
{l:'Mística',c:'Ginásio Aura',bd:'🔮',n:'Insígnia Mente',ty:'Psíquico',t:[[2,32],[1,34]]},
{l:'Pyro',c:'Ginásio Vulcão',bd:'🔥',n:'Insígnia Chama',ty:'Fogo',t:[[1,36],[2,38],[1,40]]}];
