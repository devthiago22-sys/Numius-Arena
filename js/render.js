const TONES=['\u{1F3FB}','\u{1F3FC}','\u{1F3FD}','\u{1F3FE}','\u{1F3FF}'],COLS=['#e0553d','#3b82c4','#3aa05a','#e0b92b','#8d4fc4','#e07aa8'];
const hav=h=>(h.g==='f'?'👧':'👦')+TONES[h.skin];
const heroChip=()=>G.hero?`<div class=who><span class=av style="background:${COLS[G.hero.col]}">${hav(G.hero)}</span><div><b>${esc(G.hero.name)}</b><br><small>Treinador</small></div></div>`:'';
function hset(k,v){const n=$('#hn');if(n)G.hd.name=n.value;G.hd[k]=v;R()}
function heroOk(){const n=$('#hn').value.trim();G.hd.name=n;if(n.length<2){G.herr='Escolha um nome com pelo menos 2 letras.';return R()}G.herr='';G.hero={...G.hd,name:n};save();G.screen=G.team.length?'map':'start';R()}
function openCfg(){G.prev=G.screen;G.screen='cfg';R()}
function closeCfg(){G.screen=G.prev||'map';G.prev=null;R()}
function quitGame(){musicOff();save();logout()}
function heal(){G.oh=G.team.map(m=>m.hp/m.max);G.team.forEach(m=>{m.hp=m.max;restPP(m)});G.hfx=1;G.note='✨ Seus monstrinhos foram curados!';jingle();save();R()}
function front(i){G.team.unshift(G.team.splice(i,1)[0]);save();R()}
function pick(i){G.team=[mk(i,5)];G.badges=[];G.coins=50;G.vc=0;G.vn=1;G.vbest=0;G.tac={};G.dex=[];reg(G.team[0].i);G.screen='map';save();R()}
function reset(){hasSave=false;G={team:[],badges:[],coins:0,screen:'start',battle:null};R()}

function R(){
 const A=$('#app');let h='';
 if(G.screen==='auth'&&!G.fb){h=`<iframe id=lgf class=lgf title="Entrar na Numius Arena"></iframe>`}
 else if(G.screen==='auth'){
  const up=G.mode==='up',f=G.f||{},ph=G.tp||0;
  const st=Array.from({length:26},(_,i)=>`<i style="left:${(i*37+11)%100}%;top:${(i*23+5)%50}%;animation-delay:${(i%7)*.35}s"></i>`).join('');
  const scene=`<div class="title ${ph?'':'full'}" ${ph?'':`role=button tabindex=0 aria-label="Toque para começar" onclick="titleGo()" onkeydown="if(event.key==='Enter'||event.key===' ')titleGo()"`}><div class=stars>${st}</div><span class=sun></span><span class="cl c1">☁️</span><span class="cl c2">☁️</span><span class="cl c3">☁️</span><i class=mt1></i><i class=mt2></i><span class="fl f1">${S[0].e}</span><span class="fl f2">${S[1].e}</span><i class=hill></i><span class="mas m1">${S[2].e}</span><span class="mas m2">${S[0].e}</span><span class="mas m3">${S[1].e}</span><div class=logo><b>NUMIUS</b><i>ARENA</i><small>Rumo à Liga</small></div>${ph?'':'<div class=press>▶ TOQUE PARA COMEÇAR</div>'}<em class=cr>© Numius Arena</em></div>`;
  let pan='';
  if(ph===1)pan=`<div class=tmenu><button class=tb onclick="G.tp=2;G.mode='in';G.err='';R()">▶ ENTRAR</button><button class=tb onclick="G.tp=2;G.mode='up';G.err='';R()">✚ CRIAR CONTA</button><button class="tb alt" onclick="guest()">JOGAR COMO CONVIDADO</button></div>`;
  if(ph===2)pan=`<div class=tpanel><p class=mut>${up?'Crie sua conta para salvar o progresso.':'Entre para continuar sua aventura.'}</p><div class=row><button ${up?'':'disabled'} onclick="G.mode='in';G.err='';R()">Entrar</button><button ${up?'disabled':''} onclick="G.mode='up';G.err='';R()">Criar conta</button></div><div class=card><label>ID de jogador<input id=fid autocomplete=username maxlength=20 value="${esc(f.id||'')}"></label>${up?`<label>E-mail<input id=fem type=email autocomplete=email value="${esc(f.em||'')}"></label>`:''}<label>Senha<input id=fpw type=password autocomplete=${up?'new-password':'current-password'} onkeydown="if(event.key==='Enter')submitAuth()"></label>${up?`<label>Repita a senha<input id=fp2 type=password autocomplete=new-password></label>`:''}<p class=bad role=alert>${G.err||''}</p><button onclick="submitAuth()">${up?'Criar conta e jogar':'Entrar'}</button></div><p><button onclick="G.tp=1;R()">◀ Voltar</button> <button onclick="guest()">Jogar sem conta (sem salvar)</button></p></div>`;
  h=scene+pan;
 }
 else if(G.screen==='start'&&!G.sfb){h=`<div id=sph></div>`}
 else if(G.screen==='start'){
  h=`<h1>Numius Arena</h1><p class=mut>${G.hero?'Vamos lá, '+esc(G.hero.name)+'! ':''}Escolha seu inicial, vença 8 ginásios e conquiste todas as insígnias.</p>`;
  if(hasSave)h+=`<div class=row><button onclick="load()">Continuar aventura</button></div>`;
  h+=`<h2>Escolha seu parceiro</h2><div class=starters>`+[0,3,6].map((i,k)=>`<div class=slot style="--d:${k*.9}s"><span class=cap aria-hidden=true>🔴</span><div class="card mon rev"><span class=sp>${S[i].e}</span><div><b>${S[i].n}</b> <small>${S[i].t}${S[i].t2?' · '+S[i].t2:''}</small><br><small>${i==0?'Forte contra Fogo e Pedra.':i==3?'Forte contra Planta, Gelo e Voador.':'Forte contra Fogo, Água, Gelo e Voador.'}</small><br><small>Evolui: ${S[i+1].n} (Nv 16) → ${S[i+2].n} (Nv 36)</small></div><button onclick="pick(${i})">Escolher</button></div></div>`).join('')+`</div>`;
 }
 else if(G.screen==='heal'&&!G.hcfb){h=`<div id=hcph></div>`}
 else if(G.screen==='heal'){
  const fx=G.hfx,oh=G.oh||[];G.hfx=0;
  const dead=G.team.filter(m=>m.hp<=0).length,hurt=G.team.filter(m=>m.hp>0&&m.hp<m.max).length,ok=!dead&&!hurt;
  h=`<h1>🏥 Centro de cura</h1><small>${ok?'Todos os monstrinhos estão com a vida cheia.':dead+' desmaiado(s) · '+hurt+' ferido(s)'}</small><div class=row style="margin:10px 0"><button onclick="toggleMus()">${MUS.on?'🔊 Música ligada':'🔇 Música desligada'}</button><button onclick="leaveHeal()">Voltar ao mapa</button></div>`;
  h+=G.team.map((m,i)=>{const r=m.hp/m.max,st=m.hp<=0?['💀 Desmaiado','var(--bad)']:r<1?['🩹 Ferido','var(--warn)']:['💚 Vida cheia','var(--acc)'];return `<div class="card mon ${fx?'hg':''}"><span class=sp>${S[m.i].e}</span><div><b>${S[m.i].n}</b> <small>Nv ${m.l}</small><div class=bar><i style="width:${100*r}%;background:${st[1]};${fx?`--from:${100*(oh[i]??1)}%;animation:barin .9s both`:''}"></i></div><small>${m.hp}/${m.max} PS</small></div><span class=st style="color:${st[1]}">${st[0]}</span></div>`}).join('');
  h+=`<p><button style="width:100%" ${ok?'disabled':''} onclick="heal()">${ok?'A equipe já está curada':'💊 Curar todos'}</button></p>`;
 }
 else if(G.screen==='pvp'&&!G.pfb){h=`<div id=pvph></div>`}
 else if(G.screen==='pvp'){
  const mp=myPeer(),others=PV.peers.filter(p=>!p.sameTab&&p.kind==='viewer'&&p.presence&&p.presence.pv===1);
  const inc=others.filter(p=>p.presence.ch&&p.presence.ch.to===mp&&p.presence.st==='idle'&&!PV.seen[p.presence.ch.bid]);
  h=`<h1>🤝 PvP online</h1><small>Duelos em tempo real contra outros jogadores. Sua equipe entra com a vida cheia e nada é perdido nem ganho.</small><p><button onclick="pvpLeave()">Voltar ao mapa</button></p>`;
  if(PV.ok===null)h+=`<div class=card>Conectando…</div>`;
  else if(!PV.ok)h+=`<div class=card>O PvP em tempo real não está disponível aqui. Abra o jogo pelo claude.ai, com a sua conta logada (não por link público), para duelar.</div>`;
  else{
   inc.forEach(p=>{h+=`<div class="card gym"><div><b>⚔️ ${esc(String(p.presence.nm||'Rival'))} desafiou você!</b></div><div class=row><button onclick="pvpAccept('${p.peer}')">Aceitar</button><button onclick="pvpDecline('${p.presence.ch.bid}')">Recusar</button></div></div>`});
   if(PV.out)h+=`<div class=card>⏳ Aguardando o rival aceitar… <button onclick="pvpCancel()">Cancelar</button></div>`;
   h+=`<h2>Jogadores no PvP (${others.length})</h2>`;
   h+=others.length?others.map(p=>{const q=p.presence;return `<div class="card gym"><div class=mon><span class=av style="background:${COLS[q.col|0]||COLS[0]}">${hav({g:q.g==='m'?'m':'f',skin:Math.min(4,Math.max(0,q.sk|0))})}</span><div><b>${esc(String(q.nm||'Rival'))}</b><br><small>${(q.tm||[]).length} númios · ${q.st==='battle'?'em duelo':'livre'}</small></div></div><button ${q.st==='idle'&&!PV.out?'':'disabled'} onclick="pvpChallenge('${p.peer}')">Desafiar</button></div>`}).join(''):`<div class=card><small>Ninguém mais está no PvP agora. Peça para um amigo abrir o jogo e entrar em "PvP online".</small></div>`;
  }
 }
 else if(G.screen==='learn'){
  const q=(G.learn||[])[0];
  if(!q)h=`<p>Nada para aprender.</p><button onclick="learnNext()">Continuar</button>`;
  else{const x=MOVES[q.k];
   h=`<h1>📘 Novo golpe!</h1><div class=card><div class=mon><span class=sp>${S[q.m.i].e}</span><div><b>${S[q.m.i].n}</b> <small>Nv ${q.m.l}</small><br><small>quer aprender <b>${x.n}</b><br>${x.t} · poder ${x.p} · cc ${x.pp}</small></div></div></div><p class=mut>${S[q.m.i].n} já sabe 4 golpes. Escolha um para esquecer ou não aprenda o novo:</p><div class=row style="flex-direction:column">${q.m.mv.map((k,j)=>`<button style="flex:none" onclick="learnForget(${j})">Esquecer ${MOVES[k].n}<br><small>${MOVES[k].t} · poder ${MOVES[k].p} · cc ${MOVES[k].pp}</small></button>`).join('')}<button style="flex:none" onclick="learnSkip()">Não aprender ${x.n}</button></div>`}
 }
 else if(G.screen==='dexd'){
  const i=G.dd,s=S[i],{w,r}=wk({i}),f=s.fam,st=[i],d=G.dex||[];
  h=`<h1>${s.n}</h1><small>#${String(DEX.indexOf(i)+1).padStart(3,'0')} · Forma única · ${s.t}${s.t2?' · '+s.t2:''}</small><p><button onclick="G.screen='dex';R()">Voltar ao mostruário</button></p><div class=card style="text-align:center"><span class=sp style="font-size:104px;display:block;width:auto">${s.e}</span></div><h2>Linha de evolução</h2><div class=evl>${st.map((x,k)=>`<div class="evs ${d.includes(x)?'':'sh'} ${x===i?'cur':''}"><span class=sp>${S[x].e}</span><small>${d.includes(x)?S[x].n:'???'}</small><small>Forma única</small></div>`).join('<span class=arr>➜</span>')}</div><h2>Habilidade passiva</h2><div class=card><b>✨ ${S[i].ab[0]}</b><br><small>${pdesc({i})}</small></div><h2>Golpes aprendidos por nível</h2>${LS(f).map(([lv,k])=>`<div class=card><b>${TE[MOVES[k].t]||'⚪'} ${MOVES[k].n}</b><br><small>${MOVES[k].t} · poder ${MOVES[k].p} · cc ${MOVES[k].pp}${MOVES[k].x==='dr'?' · drena PS':MOVES[k].x==='cr'?' · sempre crítico':''} · ${lv===1?'Golpe inicial':'Aprende no Nv '+lv}</small></div>`).join('')}<h2>Fraquezas e resistências</h2><div class=card><b>Fraco contra:</b> ${w.join(' · ')||'—'}<br><b>Resiste a:</b> ${r.join(' · ')||'—'}</div>`;
 }
 else if(G.screen==='boss'&&!G.bsfb){h=`<div id=bsph></div>`}
 else if(G.screen==='bag'&&!G.bgfb){h=`<div id=bgph></div>`}
 else if(G.screen==='safari'&&!G.sffb){h=`<div id=sfph></div>`}
 else if(G.screen==='missions'&&!G.msfb){h=`<div id=msph></div>`}
 else if(G.screen==='missions'){h=`<h1>Missões</h1><p>A tela de Missões não carregou.</p><p><button onclick="G.msfb=0;G.screen='map';R()">Voltar ao mapa</button></p>`}
 else if(G.screen==='safari'){h=`<h1>Zona Safari</h1><p>A tela da Safari não carregou.</p><p><button onclick="G.sffb=0;G.screen='map';R()">Voltar ao mapa</button></p>`}
 else if(G.screen==='bag'){h=`<h1>Mochila</h1><p>A tela da Mochila não carregou.</p><p><button onclick="G.bgfb=0;G.screen='map';R()">Voltar ao mapa</button></p>`}
 else if(G.screen==='boss'){h=`<h1>Boss semanal</h1><p>A tela do Boss não carregou.</p><p><button onclick="G.bsfb=0;G.screen='map';R()">Voltar ao mapa</button></p>`}
 else if(G.screen==='dex'&&!G.xfb){h=`<div id=dxph></div>`}
 else if(G.screen==='dex'){
  const d=G.dex||[];
  h=`<h1>Mostruário</h1><small>${d.length}/${DEX.length} registrados · os que você ainda não obteve aparecem como sombra</small><p><button onclick="G.screen='map';R()">Voltar ao mapa</button></p><div class=dex>`+DEX.map((i,k)=>{const s=S[i],o=d.includes(i);return `<div class="card dx ${o?'':'sh'}" ${o?`onclick="G.dd=${i};G.screen='dexd';R()" role=button tabindex=0`:''}><small>#${String(k+1).padStart(3,'0')}${s.s&&!s.ps?' · F'+s.s:''}</small><span class=sp>${s.e}</span><b>${o?s.n:'???'}</b><small>${o?s.t+(s.t2?' · '+s.t2:''):'&nbsp;'}</small></div>`}).join('')+`</div>`;
 }
 else if(G.screen==='train'){
  h=`<h1>🏋️ Treinamento</h1><small>🪙 ${G.vc||0} Moedas Virtuosas · Melhor fase: ${G.vbest||0}</small><p><button onclick="G.screen='map';R()">Voltar ao mapa</button></p><div class=tiles><button class=tile onclick="G.screen='trainiv';R()"><span class=medal2 style="--c:#5b7bd5">🧬</span><b>IV e EV</b><small>Gaste moedas virtuosas</small></button><button class=tile onclick="G.screen='vir';R()"><span class=medal2 style="--c:#8d4fc4">🏆</span><b>Batalha Virtuosa</b><small>Fase ${G.vn||1} · ganhe moedas</small></button></div>`;
 }
 else if(G.screen==='vir'){
  const pl=Math.max(5,(G.team[0]||{l:5}).l),best=G.vbest||0,n=Math.max(1,Math.min(G.vsel||G.vn||1,best+1)),L=pl+2*(n-1),cnt=Math.min(6,3+Math.floor((n-1)/2)),tier=Math.min(3,Math.floor((n-1)/2)),A=ARENA['Psíquico'],mon=S[form(BASE[(n*5)%BASE.length],L)];
  h=`<h1>🏆 Batalha Virtuosa</h1><small>🪙 ${G.vc||0} Moedas Virtuosas · Melhor fase: ${best}</small><p><button onclick="G.screen='train';R()">Voltar</button></p><div class=gcard><div class=biome style="--a:${A[0]};--b:${A[1]};--g:${A[2]}"><span class="deco d1">${A[3]}</span><span class="deco d3">${A[4]}</span><div class="medal got" title="Moedas Virtuosas">🪙</div><i class="plat pl1"></i><i class="plat pl2"></i><div class=npc>🥷</div><div class=nmo>${mon.e}</div><span class=lname>Rival Virtuoso</span></div><div class=ginfo><div><b>Fase ${n}</b><br><small>${cnt} númios · Nv ${L}+ · Tática: ${TN[tier]}</small><br><small>Recompensa: 🪙 ${2+n} moedas</small></div><div class=row><button ${n>1?'':'disabled'} onclick="G.vsel=${n-1};R()" aria-label="Fase anterior">◀</button><button ${n<best+1?'':'disabled'} onclick="G.vsel=${n+1};R()" aria-label="Próxima fase">▶</button></div></div></div><p><button style="width:100%" onclick="vstart(${n})">⚔️ Lutar na Fase ${n}</button></p><small>Cada vitória sobe a fase: mais níveis, mais númios e rivais mais espertos. Derrotas não custam nada.</small>`;
 }
 else if(G.screen==='trainiv'){
  const rate=v=>v>=31?'Perfeito':v>=26?'Ótimo':v>=16?'Bom':v>=8?'Regular':'Fraco';
  h=`<h1>🧬 IV e EV</h1><small>🪙 ${G.vc||0} Moedas Virtuosas · EV: +8 por sessão (2 🪙, máx. 252) · IV: +4 por sessão (6 🪙, máx. 31). Ganhe moedas na Batalha Virtuosa.</small><p><button onclick="G.screen='train';R()">Voltar</button></p>`;
  h+=G.team.map((m,i)=>{const I=k=>m.iv[k]==null?15:m.iv[k],E=k=>m.ev[k]||0,L=[['h','PS',m.max],['a','Atq',m.a],['sa','Atq.M',m.sa],['d','Def',m.d],['sd','Def.M',m.sd],['sp','Vel',m.sp]];return `<div class=card><div class=mon><span class=sp>${S[m.i].e}</span><div><b>${S[m.i].n}</b> <small>Nv ${m.l} · ${S[m.i].t}</small><br><small>${L.map(x=>x[1]+' '+x[2]).join(' · ')}</small><br><small>IV: ${L.map(x=>x[1]+' '+I(x[0])).join(' · ')}</small><br><small>EV: ${L.map(x=>x[1]+' '+E(x[0])).join(' · ')}</small></div></div><div class=row style="margin-top:8px;flex-wrap:wrap">${L.map(x=>`<button onclick="trEV(${i},'${x[0]}')">💪 EV ${x[1]}</button>`).join('')}${L.map(x=>`<button onclick="trIV(${i},'${x[0]}')">🧬 IV ${x[1]}</button>`).join('')}</div></div>`}).join('');
 }
 else if(G.screen==='tac'){h=`<div id=tbph></div>`}
 else if(G.screen==='team'&&!G.efb){h=`<div id=eqph></div>`}
 else if(G.screen==='team'){
  h=`<h1>Equipe</h1><small>O primeiro monstrinho saudável entra primeiro nas batalhas. Golpes do mesmo tipo do monstrinho causam mais dano. Novos golpes são aprendidos em níveis específicos.</small><p><button onclick="G.screen='map';R()">Voltar ao mapa</button></p>`;
  h+=G.team.map((m,i)=>{const mv=m.mv||defMv(m);return card(m)+wkHTML(m)+`<div class=row style="margin:-2px 0 10px"><button ${i?'':'disabled'} onclick="mvUp(${i},-1)">⬆️ Subir</button><button ${i<G.team.length-1?'':'disabled'} onclick="mvUp(${i},1)">⬇️ Descer</button>`+`<div class=mvs style="flex:1 1 100%">${(m.mv||defMv(m)).map((k,s)=>{const x=MOVES[k];return `<span class=mvc>${TE[x.t]||'⚪'} ${x.n}<small>${x.t} · poder ${x.p} · cc ${m.pp?m.pp[s]:x.pp}/${x.pp}</small></span>`}).join('')}</div>${(()=>{const nx=LS(S[m.i].fam).find(a=>a[0]>m.l);return nx?`<small class=mut style="flex:1 1 100%">Próximo golpe: <b>${MOVES[nx[1]].n}</b> no Nv ${nx[0]}</small>`:''})()}`+`</div>`}).join('');
 }
 else if(G.screen==='map'&&!G.mfb){h=`<div id=mnph></div>`}
 else if(G.screen==='map'){
  const nb=G.badges.length,hurt=G.team.filter(m=>m.hp<m.max).length,gi=Math.min(nb,7);
  const it=[
   [GYX[gi].e,'Ginásios',nb+'/8',"G.screen='gyms';R()"],
   ['⚔️','Batalhas táticas','8',"G.screen='tac';R()"],
   [S[(G.team[0]||{i:0}).i].e,'Equipe',G.team.length+'/6',"G.screen='team';R()"],
   ['📖','Mostruário',(G.dex||[]).length+'/'+DEX.length,"G.screen='dex';R()"],
   ['🤝','PvP online','','pvpOpen()'],
   ['🏋️','Treinamento',(G.vc||0)+' 🪙',"G.screen='train';R()"],
   ['🏥','Centro de cura',hurt?hurt+' ferido'+(hurt>1?'s':''):'',"goHeal()"]];
  const sel=G.sel||0;
  const pm=it.map(([ic,t,sub,fn],i)=>`<button class="pm ${i===sel?'sel':''}" style="--d:${i*.05}s" onclick="${fn}" onmouseenter="pmSel(${i})" onfocus="pmSel(${i})"><span class=cur>▶</span><span class=pic>${ic}</span><span class=pt>${t}</span>${sub?`<small>${sub}</small>`:''}</button>`).join('');
  const ch=nb===8?`<p class=pxwin>🏆 CAMPEÃO DA LIGA!</p>`:'';
  h=`<div class=pxs><canvas id=pxc></canvas></div><div class=hubw2><div class=hud><span class=av style="background:${G.hero?COLS[G.hero.col]:'var(--line)'}">${G.hero?hav(G.hero):'👤'}</span><div><b>${G.hero?esc(G.hero.name):ME?esc(ME):'Convidado'}</b><br><small>💰 ${G.coins||0}${ME?'':' · sem salvar'}</small></div></div><div class=hbd>${badgesHTML()}</div><div class=mlogo><b>NUMIUS</b><i>ARENA</i></div>${ch}<div class=pmenu>${pm}</div></div><div class=chars>${G.team.slice(0,3).map(m=>`<span class=ch>${S[m.i].e}</span>`).join('')}</div>`;
 }
 else if(G.screen==='hero'&&!G.hfb){h=`<iframe id=hf class=lgf title="Criar personagem"></iframe>`}
 else if(G.screen==='hero'){
  const d=G.hd||(G.hd={g:'f',skin:1,col:0,name:''});
  const gb=(g,l)=>`<button class="opt ${d.g===g?'on':''}" onclick="hset('g','${g}')">${l}</button>`;
  h=`<h1>Crie seu personagem</h1><p class=mut>Escolha como você vai aparecer na aventura.</p><div class=card style="text-align:center"><div class=avatar style="background:${COLS[d.col]}">${hav(d)}</div><b>${esc(d.name||'Seu nome')}</b></div><label>Nome do personagem<input id=hn maxlength=14 autocomplete=off value="${esc(d.name)}"></label><h2>Você é</h2><div class=row>${gb('f','👧 Menina')}${gb('m','👦 Menino')}</div><h2>Tom de pele</h2><div class=row>${TONES.map((t,i)=>`<button class="opt tone ${d.skin===i?'on':''}" aria-label="Tom de pele ${i+1}" onclick="hset('skin',${i})">👋${t}</button>`).join('')}</div><h2>Cor favorita</h2><div class=row>${COLS.map((c,i)=>`<button class="opt sw ${d.col===i?'on':''}" aria-label="Cor ${i+1}" style="background:${c}" onclick="hset('col',${i})"></button>`).join('')}</div><p class=bad role=alert>${G.herr||''}</p><button style="width:100%" onclick="heroOk()">Confirmar personagem</button>`;
 }
 else if(G.screen==='cfg'){
  h=`<h1>⚙️ Configurações</h1><p><button onclick="closeCfg()">Voltar</button></p><div class=card><label>Volume: <b id=vv>${Math.round(MUS.vol*100)}%</b><input type=range min=0 max=100 value="${Math.round(MUS.vol*100)}" oninput="setVol(this.value)" aria-label="Volume"></label><button onclick="toggleMus()">${MUS.on?'🔊 Sons ligados':'🔇 Sons desligados'}</button></div><div class=card><b>👤 Conta</b><br><small>${ME?'Conectado como '+esc(ME):'Jogando como convidado (sem salvar)'}</small><div class=row style="margin-top:8px"><button onclick="logout()">🔁 Trocar de conta</button><button onclick="quitGame()">🚪 Sair do jogo</button></div></div>`;
 }
 else if(G.screen==='bye'){
  h=`<h1>Até logo! 👋</h1><p class=mut>${ME?'Seu progresso foi salvo na conta '+esc(ME)+'.':'Você estava jogando como convidado, então nada foi salvo.'}</p><p><button onclick="G.screen=G.prev||'map';G.prev=null;R()">Voltar ao jogo</button></p>`;
 }
 else if(G.screen==='gyms'&&!G.gfb){h=`<div id=gyph></div>`}
 else if(G.screen==='gyms'){
  const nb=G.badges.length;
  h=`<h1>🏟️ Ginásios</h1><small>Vença em ordem para ganhar as 8 insígnias.</small>${badgesHTML()}<p><button onclick="G.screen='map';R()">Voltar ao mapa</button></p>`;
  h+=GY.map((g,i)=>{const done=G.badges.includes(i),ok=i<=nb,X=GYX[i],ty=g.ty,A=ARENA[ty],n=Math.min(6,G.team.length);
   return `<div class="gcard ${ok?'':'lock'}"><div class=biome style="--a:${A[0]};--b:${A[1]};--g:${A[2]}"><span class="deco d1">${A[3]}</span><span class="deco d3">${A[4]}</span><div class="medal ${done?'got':''}" title="${g.n}">${g.bd}</div><i class="plat gp"></i><div class=leader>${X.e}</div><span class=lname>Líder ${g.l}</span>${ok?'':'<span class=lockb>🔒</span>'}</div><div class=ginfo><div><b>${g.c}</b><br><small>${X.bio} · Tipo ${ty}</small><br><small>${n} monstrinho${n>1?'s':''} · Nv ${g.t[0][1]}+ · ${g.n}${done?' ✔':''}</small></div><button ${ok?'':'disabled'} onclick="gym(${i})">${done?'Revanche':ok?'Desafiar':'🔒'}</button></div></div>`}).join('');
 }
 else{
  const B=G.battle,p=act()||G.team[0];
  if(!G.btfb){h='<div id=btph></div>'}else{
  h=`<h1>${B.vt?'Batalha Virtuosa — Fase '+B.vt:B.pvp?'PvP: '+B.oname:B.tt?'Batalha tática: '+B.tt:B.wild?'Batalha selvagem':GY[B.gym].c}</h1>${badgesHTML()}${arena(B,p)}<div class="card log">${B.log.map(l=>`<p>${l}</p>`).join('')}</div>`;
  if(B.over){const t=B.pvp?(B.over==='win'?'Você venceu o duelo! 🏆':'Você perdeu o duelo.'):{win:'Vitória! 🎉',lose:'Você perdeu… voltando ao Centro de cura.',fled:'',caught:'',quit:'Desistência registrada. A batalha foi encerrada.'}[B.over];
   h+=`${t?`<p class=win>${t}</p>`:''}<div class=row><button onclick="end()">Continuar</button></div>`}
  else if(B.pick){h+=`<h2>Escolha quem entra</h2><div class=row style="flex-direction:column">${G.team.map((m,i)=>m===p?'':`<button style="flex:none" ${m.hp>0?'':'disabled'} onclick="swapTo(${i})">${S[m.i].e} ${S[m.i].n} · Nv ${m.l} · ${m.hp}/${m.max} PS${m.hp>0?'':' · desmaiado'}</button>`).join('')}<button style="flex:none" onclick="G.battle.pick=false;R()">Cancelar</button></div>`}
  else if(B.wait){h+=`<p class=mut>⏳ Aguardando o oponente escolher a jogada…</p>`}
  else{const mv=moves(p);
   h+=`<div class=row>${mv.map((m,k)=>`<button ${p.pp&&p.pp[k]<=0?'disabled':''} onclick="turn(${k})">${m.n}<br><small>${m.t} · ${m.p} · cc ${p.pp?p.pp[k]:m.pp}/${m.pp}</small></button>`).join('')}${p.pp&&mv.every((m,k)=>p.pp[k]<=0)?`<button onclick="turn(-1)">Luta Desesperada<br><small>Normal · 40 · recuo</small></button>`:''}</div><div class=row style="margin-top:8px"><button onclick="swap()">🔄 Trocar</button><button onclick="leave()">🏳️ Desistir</button>${B.wild?'<button onclick="cap()">🎯 Capturar</button><button onclick="flee()">🏃 Fugir</button>':''}</div>`}}
 }
 if(G.note&&G.screen!=='battle'){h=`<p class=win role=status>${G.note}</p>`+h;G.note=''}
 if(G.screen!=='map')G.cf=0;
 if(!['auth','battle','bye','cfg','hero','tac'].includes(G.screen)||(G.screen==='team'&&!G.efb)||(G.screen==='gyms'&&!G.gfb)||(G.screen==='dex'&&!G.xfb)||(G.screen==='boss'&&!G.bsfb)||(G.screen==='bag'&&!G.bgfb)||(G.screen==='safari'&&!G.sffb)||(G.screen==='missions'&&!G.msfb)||(G.screen==='pvp'&&!G.pfb)||(G.screen==='start'&&!G.sfb))h+=`<button class=gear onclick="openCfg()" aria-label="Configurações">⚙️</button>`;
 A.innerHTML=h;if(G.screen==='map')pxDraw();if(G.screen==='auth'&&!G.fb)lgMount();if(G.screen==='hero'&&!G.hfb)hMount();if(G.screen==='start'&&!G.sfb)sMount();else sVis();mnToggle();if(G.screen==='tac'){tbMount();tbSend()}else tbToggle();if(G.screen==='team'&&!G.efb){eqMount();eqSend()}else eqToggle();if(G.screen==='gyms'&&!G.gfb){gyMount();gySend()}else gyToggle();if(G.screen==='dex'&&!G.xfb){dxMount();dxSend()}else dxToggle();if(G.screen==='pvp'&&!G.pfb){pvMount();pvSend()}else pvToggle();if(G.screen==='boss'&&!G.bsfb){bsMount();bsSend()}else bsToggle();if(G.screen==='bag'&&!G.bgfb){bgMount();bgSend()}else bgToggle();if(G.screen==='safari'&&!G.sffb){sfMount();sfSend()}else sfToggle();if(G.screen==='missions'&&!G.msfb){msMount();msSend()}else msToggle();lgBarSync();if(G.screen==='battle'&&!G.btfb&&G.battle){btMount();btSend()}else btToggle();if(G.screen==='map'&&!G.mfb)mnMount();hcToggle();
}
