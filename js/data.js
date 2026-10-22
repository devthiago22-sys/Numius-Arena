const FAM=[
["Hydrake","Água","Dragão",["Hydrake","Hydragon","Hydraegis"],[38,32,52,38,50,44],0,[["Jato Serpentino","Água",65],["Mordida Dracônica","Dragão",60],["Espiral Marinha","Água",80],["Tempestade Draconiana","Dragão",100,"dr"]],[["Antídoto Eterno","antidote"],["Conversão Harmônica","harmony"],["Tsunami Feroz","tsunami"]]],
["Blazleo","Fogo","Pedra",["Blazleo","Cindaleo","Obsidileo"],[32,56,30,40,32,42],0,[["Garra de Brasa", "Fogo", 65], ["Cristal Cortante", "Pedra", 60], ["Juba Flamejante", "Fogo", 80], ["Inferno de Obsidiana", "Fogo", 100, "cr"]],[["Brasa Forte","brasa"],["Vontade do Fogo","vontade"],["Rei Obsidiana","rei"]]],
["Byron","Pedra","Planta",["Byron","Byrocks","Imperyron"],[48,42,24,62,44,18],0,[["Pedrada Musgosa", "Pedra", 65], ["Folha Cortante", "Planta", 60], ["Casco Esmeralda", "Pedra", 80], ["Terremoto Verdejante", "Planta", 100, "dr"]],[["Néctar Ancestral","nectar"],["Carapaça Refletiva","reflect"],["Endurecer do Milênio","millennium"]]]];
const S=[];
FAM.forEach(([n,t,t2,ns,B6,_z,_m,abs],f)=>ns.forEach((nm,k)=>{const i=S.length,u=[0,10,22][k];S.push({n:nm,e:`<i class="im f${i}" style="--k:${[.82,.92,1][k]}"></i>`,t,t2,h:B6[0]+[0,20,42][k],a:B6[1]+[0,14,30][k],sa:B6[2]+u,d:B6[3]+u,sd:B6[4]+u,sp:B6[5]+u,fam:f,s:k+1,ab:abs[k],...(k<2?{x:i+1}:{}),b:`<i class="im b${i}" style="--k:${[.82,.92,1][k]}"></i>`})}));
const BASE=[...S.keys()].filter(i=>S[i].s===1);
const DEX=[];BASE.forEach(b=>{let i=b;DEX.push(i);while(S[i].x!==undefined){i=S[i].x;DEX.push(i)}});
const PREV={};S.forEach((x,i)=>{if(x.x!==undefined)PREV[x.x]=i});
const SE={Fogo:['Planta','Gelo','Trevas'],Água:['Fogo','Pedra'],Planta:['Água','Pedra'],Elétrico:['Água','Voador'],Pedra:['Fogo','Gelo','Voador','Cósmico'],Gelo:['Planta','Voador','Dragão'],Psíquico:[],Voador:['Planta'],Dragão:['Dragão','Luz'],
 Luz:['Trevas','Dragão'],Trevas:['Luz','Psíquico','Cósmico'],Cósmico:['Dragão','Voador']};
const NV={Fogo:['Fogo','Água','Pedra','Dragão','Luz'],Água:['Água','Planta','Dragão'],Planta:['Fogo','Planta','Voador','Dragão','Luz'],Elétrico:['Elétrico','Planta','Pedra','Dragão','Cósmico'],Pedra:['Pedra'],Gelo:['Fogo','Água','Gelo'],Psíquico:['Psíquico','Trevas','Cósmico'],Voador:['Elétrico','Pedra'],Dragão:['Pedra'],
 Luz:['Luz','Fogo','Pedra'],Trevas:['Trevas','Fogo'],Cósmico:['Cósmico','Pedra']};
/* Luz, Trevas e Cósmico: por enquanto só os dragões do Boss semanal usam. */
const T2M={Terra:'Pedra',Metal:'Pedra',Vento:'Voador',Sombrio:'Psíquico'};
S.forEach(x=>{x.tt=[x.t];const m=T2M[x.t2]||x.t2;if(m&&m!==x.t&&NV[m])x.tt.push(m)});
const effv=(a,m)=>(typeof tyOf==='function'?tyOf(m):S[m.i].tt).reduce((p,t)=>p*mult(a,t),1);
const wk=m=>{const w=[],r=[],we=[];TYX.forEach(t=>{const e=effv(t,m);if(e>1){w.push(TE[t]+' '+t+(e>2?' ×4':''));we.push(TE[t]+(e>2?'²':''))}else if(e<1)r.push(TE[t]+' '+t)});return{w,r,we}};
const wkHTML=m=>{const{w,r}=wk(m);return `<div class=wkb><b>Tipo:</b> ${S[m.i].t}${S[m.i].t2?' · '+S[m.i].t2:''}<br><b>Fraco contra:</b> ${w.join(' · ')||'—'}<br><b>Resiste a:</b> ${r.join(' · ')||'—'}<br><b>Evolução:</b> ${S[m.i].x!==undefined?'Nv '+(S[m.i].s===1?16:36)+' → '+S[S[m.i].x].n:'forma final'}<br><b>Habilidade:</b> ${PA(m).n} — ${pdesc(m)}</div>`};
const MV={Fogo:'Chama',Água:'Jato d\'água',Planta:'Folha-lâmina',Elétrico:'Choque',Pedra:'Pedrada',Gelo:'Raio gelado',Psíquico:'Confusão',Voador:'Rajada'};
const TY=['Fogo','Água','Planta','Elétrico','Pedra','Gelo','Psíquico','Voador'],TN=['Iniciante','Esperto','Estrategista','Mestre'],TE={Fogo:'🔥',Água:'💧',Planta:'🍃',Elétrico:'⚡',Pedra:'🪨',Gelo:'❄️',Psíquico:'🔮',Voador:'🪶',Dragão:'🐉',Luz:'✨',Trevas:'🌑',Cósmico:'🌌'};
const TYX=[...TY,'Dragão'];
const MOVES=[{n:'Investida',t:'Normal',p:45},{n:'Pancada',t:'Normal',p:60},...TY.map(t=>({n:MV[t],t,p:60})),...FAM.slice(0,20).flatMap((g,f)=>g[6].map(([n,t,p,x],j)=>({n,t,p,x,f,j})))];
MOVES.push({n:'Golpe Pesado',t:'Normal',p:75});
MOVES.push({n:'Muralha do Milênio',t:'Pedra',p:90,x:'def'});
FAM.slice(20).forEach((g,q)=>g[6].forEach(([n,t,p,x],j)=>MOVES.push({n,t,p,x,f:20+q,j})));
MOVES.forEach(x=>{x.pp=x.p>=100?5:x.p>=80?10:x.p>=65?15:x.p>=55?20:25});
const SPEC=new Set(['Chama','Jato d\'água','Choque','Raio gelado','Confusão','Rajada','Jato Serpentino','Espiral Marinha','Tempestade Draconiana','Juba Flamejante','Inferno de Obsidiana']);
MOVES.forEach(x=>{x.c=SPEC.has(x.n)?'e':'f'});
const WALL=MOVES.findIndex(x=>x.n==='Muralha do Milênio'),HEAVY=MOVES.findIndex(x=>x.n==='Golpe Pesado'),STRUG={n:'Luta Desesperada',t:'Normal',p:40,pp:1,c:'f'};
const MB=f=>f<20?10+f*4:91+(f-20)*4;
const defMv=m=>[0,1,2,3].map(j=>MB(S[m.i].fam)+j);
const mp=(x,m)=>x.p;
const LS=f=>[[1,0],[1,1],[1,MB(f)],[1,MB(f)+1],[10,2+TY.indexOf(FAM[f][1])],[16,MB(f)+2],[26,HEAVY],[36,MB(f)+3],...(f===2?[[36,WALL]]:[])];
function initMoves(i,l){return LS(S[i].fam).filter(a=>a[0]<=l).map(a=>a[1]).slice(-4)}
const restPP=m=>{m.pp=(m.mv||[]).map(k=>MOVES[k].pp)};
const GY=[
{l:'Rocha',c:'Ginásio Granito',bd:'🪨',n:'Insígnia Pedra',ty:'Pedra',t:[[6,8],[3,10]]},
{l:'Marina',c:'Ginásio Maré',bd:'💧',n:'Insígnia Onda',ty:'Água',t:[[0,12],[0,14]]},
{l:'Volt',c:'Ginásio Faísca',bd:'⚡',n:'Insígnia Trovão',ty:'Elétrico',t:[[0,16],[3,18]]},
{l:'Flora',c:'Ginásio Jardim',bd:'🍃',n:'Insígnia Folha',ty:'Planta',t:[[6,20],[6,22]]},
{l:'Frida',c:'Ginásio Geleira',bd:'❄️',n:'Insígnia Cristal',ty:'Gelo',t:[[0,24],[6,26]]},
{l:'Aero',c:'Ginásio Céu',bd:'🪶',n:'Insígnia Pena',ty:'Voador',t:[[3,28],[0,30]]},
{l:'Mística',c:'Ginásio Aura',bd:'🔮',n:'Insígnia Mente',ty:'Psíquico',t:[[6,32],[3,34]]},
{l:'Pyro',c:'Ginásio Vulcão',bd:'🔥',n:'Insígnia Chama',ty:'Fogo',t:[[3,36],[6,38],[3,40]]}];
