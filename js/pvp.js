/* PvP em tempo real: sala, desafios, resolução determinística dos turnos */
const PV={ok:null,room:null,peers:[],out:null,seen:{},init:0};
function rngS(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function hstr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const myPeer=()=>{const p=PV.peers.find(p=>p.sameTab);return p&&p.peer};
const peerOf=id=>PV.peers.find(p=>p.peer===id&&!p.sameTab);
function pvpPres(patch){if(PV.room)PV.room.presence(patch).catch(()=>{})}
const pvpCompact=()=>G.team.slice(0,6).map(m=>({i:m.i,l:m.l,v:[m.iv.h,m.iv.a],e:[m.ev.h,m.ev.a],mv:m.mv||0}));
function pvpBuild(c){const m={i:c.i|0,l:Math.max(1,Math.min(100,c.l|0)),xp:0,iv:{h:c.v[0]|0,a:c.v[1]|0},ev:{h:c.e[0]|0,a:c.e[1]|0}};m.mv=(Array.isArray(c.mv)&&c.mv.length>=1&&c.mv.length<=4&&c.mv.every(x=>Number.isInteger(x)&&x>=0&&x<MOVES.length))?c.mv.slice():initMoves(m.i,m.l);m.pp=m.mv.map(k=>MOVES[k].pp);calc(m);m.hp=m.max;return m}
async function pvpOpen(){
 G.screen='pvp';R();
 if(!PV.init){PV.init=1;
  try{PV.room=(typeof claude!=='undefined'&&claude.use)?await claude.use('room'):null}catch(e){PV.room=null}
  PV.ok=!!PV.room;
  if(PV.room)PV.room.onPeers(ch=>{PV.peers=ch.peers;pvpOnPeers()},()=>{PV.ok=false;if(G.screen==='pvp')R()});
 }
 pvpAnnounce();R();
}
const pv0=()=>G.pvp||(G.pvp={lp:0,w:0,l:0});
function pvpAnnounce(){const h=G.hero||{g:'f',skin:1,col:0,name:'Treinador'},q=pv0();pvpPres({pv:1,nm:String(h.name).slice(0,14),g:h.g,sk:h.skin,col:h.col,tm:pvpCompact(),st:PV.search?'search':'idle',lp:q.lp|0,wn:q.w|0,bd:G.badges.length,lv:Math.max(1,...G.team.map(m=>m.l)),rm:PV.rm||null,ch:null,acc:null,vs:null,bid:null,hist:null})}
function pvpLeave(){PV.search=false;PV.rm=null;pvpPres({pv:null,rm:null,lp:null,wn:null,bd:null,lv:null,nm:null,g:null,sk:null,col:null,tm:null,st:null,ch:null,acc:null,vs:null,bid:null,hist:null});PV.out=null;G.screen='map';R()}
function pvpChallenge(peer){const bid=myPeer()+':'+Date.now();PV.out={to:peer,bid};pvpPres({ch:{to:peer,bid}});R();setTimeout(()=>{if(PV.out&&PV.out.bid===bid){PV.out=null;pvpPres({ch:null});if(G.screen==='pvp')R()}},25000)}
function pvpCancel(){PV.out=null;pvpPres({ch:null});R()}
function pvpDecline(bid){PV.seen[bid]=1;R()}
function pvpAccept(peer){const p=peerOf(peer);if(!p||!p.presence.ch)return;const bid=p.presence.ch.bid;pvpPres({acc:bid,st:'battle',vs:peer,bid,hist:{}});pvpStart(bid,p,'b')}
function pvpOnPeers(){
 if(G.screen==='pvp'&&!G.battle){
  if(PV.out){const p=peerOf(PV.out.to);if(p&&p.presence.acc===PV.out.bid){const o=PV.out;PV.out=null;pvpPres({st:'battle',vs:o.to,bid:o.bid,ch:null,hist:{}});pvpStart(o.bid,p,'a');return}}
  if(PV.search&&!PV.out){const mp=myPeer(),oth=pvOthers(),inc=oth.find(p=>p.presence.ch&&p.presence.ch.to===mp&&p.presence.st==='search'&&!PV.seen[p.presence.ch.bid]);if(inc){pvpAccept(inc.peer);return}const cand=oth.filter(p=>p.presence.st==='search'&&!(p.presence.ch&&p.presence.ch.to)&&mp&&String(mp)<String(p.peer)).sort((a,b)=>String(a.peer)<String(b.peer)?-1:1)[0];if(cand){pvpChallenge(cand.peer);return}}
  R();return}
 if(G.battle&&G.battle.pvp)pvpTick();
}
function pvpStart(bid,p,role){
 const tm=(p.presence.tm||[]).filter(c=>c&&S[c.i]&&Array.isArray(c.v)&&Array.isArray(c.e)).slice(0,6).map(pvpBuild);
 if(!tm.length)return;
 G.rt=G.team;G.team=G.rt.map(m=>{const c={...m,iv:{...m.iv},ev:{...m.ev},mv:m.mv?m.mv.slice():undefined};calc(c);c.hp=c.max;c.mv=c.mv||initMoves(c.i,c.l);c.pp=c.mv.map(k=>MOVES[k].pp);return c});
 const oname=esc(String(p.presence.nm||'Rival').slice(0,14));
 G.battle={pvp:1,bid,role,opp:p.peer,oname,oq:tm,foe:tm[0],queue:[],wild:false,over:null,turn:1,hist:{},log:[`Duelo contra ${oname}! Escolha a sua jogada.`]};
 G.battle.olp=p.presence.lp|0;PV.search=false;
 G.screen='battle';R();
}
function pvpAct(a){const B=G.battle;if(!B||!B.pvp||B.over||B.wait)return;B.wait=true;B.pick=false;B.hist['t'+B.turn]=a;const ks=Object.keys(B.hist);if(ks.length>6)delete B.hist[ks[0]];pvpPres({hist:B.hist});R();pvpTick()}
const pvpSane=(a,n)=>a&&((a.t==='a'&&Number.isInteger(a.k)&&a.k>=-1&&a.k<4)||(a.t==='s'&&Number.isInteger(a.i)&&a.i>=0&&a.i<n)||a.t==='f')?a:{t:'a',k:0};
function pvpTick(){
 const B=G.battle;if(!B||!B.pvp||B.over)return;
 const op=peerOf(B.opp);
 if(!op){if(!B.gone){B.gone=Date.now();setTimeout(pvpTick,8500)}else if(Date.now()-B.gone>8000){B.over='win';B.log=['O oponente saiu do duelo.'];R()}return}
 B.gone=0;
 const oa=op.presence.hist&&op.presence.hist['t'+B.turn],ma=B.hist['t'+B.turn];
 if(!oa||!ma)return;
 const oo=pvpSane(oa,B.oq.length),mm=pvpSane(ma,G.team.length);
 pvpResolve(B,B.role==='a'?mm:oo,B.role==='a'?oo:mm);
 if(!B.over){B.turn++;B.wait=false}
 R();
}
function pvpResolve(B,actA,actB){
 RR=rngS(hstr(B.bid+':'+B.turn));B.log=[];
 const acts={a:actA,b:actB},oth=r=>r==='a'?'b':'a',T=r=>r===B.role?G.team:B.oq,ac=r=>T(r).find(m=>m.hp>0),nm=r=>r===B.role?'Você':B.oname;
 for(const r of ['a','b'])if(acts[r].t==='f'){B.over=r===B.role?'lose':'win';B.log.push(nm(r)+' desistiu do duelo.');B.foe=B.oq.find(m=>m.hp>0)||B.oq[0];RR=Math.random;return}
 for(const r of ['a','b'])if(acts[r].t==='s'){const t=T(r),m=t[acts[r].i];if(m&&m.hp>0&&m!==ac(r)){t.unshift(t.splice(acts[r].i,1)[0]);B.log.push(`${nm(r)} trocou para ${S[m.i].n}!`)}}
 const A0={a:ac('a'),b:ac('b')};
 const order=['a','b'].filter(r=>acts[r].t==='a'&&A0[r]).sort((x,y)=>(A0[y].a+A0[y].l)-(A0[x].a+A0[x].l)||(x==='a'?-1:1));
 for(const r of order){const at=A0[r];if(at.hp<=0)continue;const df=ac(oth(r));if(!df)continue;B.foe=ac(oth(B.role));{let kk=acts[r].k;if(kk>=0&&(!at.mv[kk]||at.pp[kk]<=0))kk=-1;B.log.push(hit(at,df,kk))};if(df.hp<=0)B.log.push(`${S[df.i].n} de ${nm(oth(r))} desmaiou!`)}
 B.foe=ac(oth(B.role))||B.oq[0];
 if(G.team.some(m=>m.hp>0)&&B.oq.some(m=>m.hp>0))regen(B);
 if(!G.team.some(m=>m.hp>0))B.over='lose';else if(!B.oq.some(m=>m.hp>0))B.over='win';
 B.foe=B.oq.find(m=>m.hp>0)||B.oq[0];
 RR=Math.random;
}
function pvpEnd(){{const B=G.battle;if(B&&B.pvp&&!B.scored&&(B.over==='win'||B.over==='lose')){B.scored=1;const q=pv0(),d=(B.olp|0)-q.lp,win=B.over==='win',old=q.lp;let dl=win?25+Math.max(-10,Math.min(15,Math.round(d/20))):-(15+Math.max(-5,Math.min(5,Math.round(-d/40))));q.lp=Math.max(0,Math.min(3500,q.lp+dl));dl=q.lp-old;if(win)q.w++;else q.l++;PV.msg=(win?'🏆 Vitória! ':'Derrota. ')+(dl>=0?'+':'')+dl+' LP';save()}}
 G.team=G.rt||G.team;G.rt=null;G.battle=null;G.screen='pvp';pvpAnnounce();R()}
