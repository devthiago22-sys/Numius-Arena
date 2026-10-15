/* Cenário e treinador em pixel art do menu antigo (reserva) */
if(typeof addEventListener==='function')addEventListener('resize',()=>{if(G.screen==='map')pxDraw()});
let PXO=null;
function shd(h,k){const v=[1,3,5].map(i=>parseInt(h.substr(i,2),16));return'rgb('+v.map(x=>Math.max(0,Math.min(255,Math.round(x*k)))).join(',')+')'}
function pxHero(c,cx,y0,fr){
 const hh=G.hero||{g:'f',skin:1,col:0},sk=['#f6d7bd','#ecc19b','#d19a6c','#a5694a','#6b4430'][hh.skin|0],cl=COLS[hh.col|0]||COLS[0],fem=hh.g==='f';
 const skD=shd(sk,.82),clL=shd(cl,1.2),clD=shd(cl,.72),clDD=shd(cl,.5),hair=fem?'#8a4a22':'#2f2118',hairL=fem?'#bf7640':'#4d3a2a',pants='#3b4a8a',pantsD='#2c3870';
 if(!PXO){PXO=document.createElement('canvas');PXO.width=18;PXO.height=28}
 const o=PXO.getContext('2d');o.clearRect(0,0,18,28);
 const R=(col,x,y,w,h)=>{o.fillStyle=col;o.fillRect(x+1,y+1,w,h)};
 const bob=fr%8<4?0:1,blink=fr%26===0,wave=fr%56>=44&&fr%56<52;
 if(fem){R(hair,2,3,3,11);R(hair,11,3,3,11);R(hairL,3,5,1,7);R(shd(hair,.8),4,12,1,2);R(shd(hair,.8),11,12,1,2)}
 if(fem){R(clD,3,17,10,3);R(clDD,3,19,10,1);R(sk,4,20,3,3);R(sk,9,20,3,3);R(skD,6,20,1,3);R(skD,11,20,1,3);R('#f6f6f6',4,22,3,1);R('#f6f6f6',9,22,3,1)}
 else{R(pants,4,18,3,5);R(pants,9,18,3,5);R(pantsD,6,18,1,5);R(pantsD,11,18,1,5);R(pants,3,17,10,2)}
 R('#e8584a',3,23,4,1);R('#fff',3,24,4,1);R('#e8584a',9,23,4,1);R('#fff',9,24,4,1);R('#c43c30',3,23,1,1);R('#c43c30',9,23,1,1);
 R(cl,3,11,10,7);R(clL,3,11,1,6);R(clD,12,11,1,7);R('#f6f6f6',7,11,2,6);R(clD,3,17,10,1);
 R('#2a2a3a',3,17,10,1);R('#e8c04a',7,17,2,1);R('#e04848',11,17,2,1);R('#fff',11,18,2,1);
 R(clD,1,12,2,4);R(clL,1,12,1,3);R(sk,1,16,2,2);
 if(wave){R(clD,13,8,2,4);R(sk,13,6,2,2);R(skD,14,6,1,2)}else{R(clD,13,12,2,4);R(sk,13,16,2,2);R(skD,14,16,1,2)}
 R(skD,7,10,2,1);
 R(sk,3,2,10,9);o.clearRect(4,3,1,1);o.clearRect(13,3,1,1);o.clearRect(4,11,1,1);o.clearRect(13,11,1,1);
 R(skD,12,3,1,7);R(sk,2,6,1,2);R(sk,13,6,1,2);
 if(fem){R(hair,3,1,10,5);R(hairL,4,2,3,1);R(hairL,9,2,2,1);R(hair,3,5,4,2);R(hair,9,5,4,2);R(shd(hair,.8),12,2,1,4);R(cl,5,0,3,2);R(cl,8,0,3,2);R(clD,7,0,2,2);R(clL,5,0,1,1)}
 else{R(cl,3,0,10,4);R(clL,4,0,4,1);R(clD,11,1,2,3);R(clD,2,4,12,2);R(clDD,3,5,10,1);R('#fff',7,1,2,2);R('#e8c04a',7,2,2,1);R(hair,3,6,1,3);R(hair,12,6,1,3)}
 if(blink){R('#1a1a2a',5,8,2,1);R('#1a1a2a',9,8,2,1)}else{R('#1a1a2a',5,6,2,3);R('#1a1a2a',9,6,2,3);R('#fff',5,6,1,1);R('#fff',9,6,1,1)}
 if(fem){R(hair,5,5,2,1);R(hair,9,5,2,1)}
 R('#ff9a9a',4,9,2,1);R('#ff9a9a',10,9,2,1);R('#b5483f',7,9,2,1);
 const id=o.getImageData(0,0,18,28),d=id.data,out=o.createImageData(18,28),q=out.data,A=(x,y)=>x>=0&&y>=0&&x<18&&y<28&&d[(y*18+x)*4+3]>0;
 for(let y=0;y<28;y++)for(let x=0;x<18;x++){const i=(y*18+x)*4;if(A(x,y)){q[i]=d[i];q[i+1]=d[i+1];q[i+2]=d[i+2];q[i+3]=255}else if(A(x-1,y)||A(x+1,y)||A(x,y-1)||A(x,y+1)){q[i]=26;q[i+1]=20;q[i+2]=48;q[i+3]=255}}
 o.putImageData(out,0,0);
 c.fillStyle='rgba(0,0,0,.28)';c.fillRect(cx-7,y0,14,2);
 c.drawImage(PXO,Math.round(cx-9),Math.round(y0-26-bob));
}
function pxDraw(){
 const cv=$('#pxc');if(!cv||!cv.getContext)return;
 const W=130,H=Math.max(200,Math.ceil(W*innerHeight/innerWidth));cv.width=W;cv.height=H;
 const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 const f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const hr=new Date().getHours(),tm=hr>=6&&hr<17?'d':hr>=17&&hr<20?'s':'n';
 const P={
  d:{sk:['#3fa9de','#56bde8','#74cfea','#94e2e4','#b4f2dc'],cl:'#fff',cl2:'#d6f3ff',cl3:'#a9dcef',m1:'#8fcfdc',m2:'#6fb8c8',sn:'#f4fdff',t1:'#7fd99a',t1d:'#5bbd7c',t2:'#3fbf6a',t2d:'#2a9a52',tr:'#7a4a22',g1:'#7ad04a',g2:'#3a9c3a',g3:'#2a7a2a',dirt:'#b0703c',dk:'#8a5230',lt:'#c98a4e'},
  s:{sk:['#4a2f7a','#a84a8a','#ff7e6c','#ffa878','#ffd28a'],cl:'#ffd6c8',cl2:'#f0a0a8',cl3:'#c8708c',m1:'#9a5a96',m2:'#74407e',sn:'#ffd9d0',t1:'#7ab87a',t1d:'#5a9a64',t2:'#3a8a4a',t2d:'#2a6a3a',tr:'#6a3a1a',g1:'#6ac048',g2:'#34843a',g3:'#245e2a',dirt:'#a8683a',dk:'#85472a',lt:'#c07e46'},
  n:{sk:['#070a24','#0e1740','#1a2a62','#27408a','#33509a'],cl:'#4a5a9a',cl2:'#33407a',cl3:'#26306a',m1:'#223a78',m2:'#1a2c5e',sn:'#8aa0e0',t1:'#2a6a58',t1d:'#1c5446',t2:'#16483a',t2d:'#0e3428',tr:'#2a1c14',g1:'#2a7a3a',g2:'#1a5a2a',g3:'#124220',dirt:'#6a4630',dk:'#52341f',lt:'#7e5638'}}[tm];
 const y0=H-46,fr=Math.floor(performance.now()/160);
 // ceu
 const hex2=q=>[1,3,5].map(k=>parseInt(q.substr(k,2),16));
 for(let y=0;y<y0;y+=2){const t=y/y0*(P.sk.length-1),i=Math.min(P.sk.length-2,Math.floor(t)),fa=t-i,A=hex2(P.sk[i]),B=hex2(P.sk[i+1]);f('rgb('+A.map((v,k)=>Math.round(v+(B[k]-v)*fa)).join(',')+')',0,y,W,2)}
 // astros
 if(tm==='n'){for(let i=0;i<34;i++)if((i*7+fr)%11>1)f(i%5===0?'#ffe9a0':'#fff',(i*47)%W,(i*31)%(y0-60),1,1);
  f('#f5f5dc',W-32,14,10,10);f('#f5f5dc',W-34,16,14,6);f('#f5f5dc',W-30,12,6,14);f(P.sk[1],W-27,15,5,5);f('#d9d9c0',W-30,21,3,2)}
 else{const sc=tm==='d'?'#fff3a0':'#ffd27a',sc2=tm==='d'?'#ffe066':'#ffa94d';
  f(sc2,W-34,14,14,14);f(sc2,W-36,16,18,10);f(sc2,W-32,12,10,18);f(sc,W-32,16,10,10);f(sc,W-34,18,14,6);f(sc,W-30,14,6,14);
  if(tm==='d')[[W-38,10],[W-19,10],[W-38,29],[W-19,29]].forEach(([x,y])=>f(sc2,x,y,2,2))}
 // montanhas
 const mt=(base,amp,ph,col,snow)=>{for(let x=0;x<W;x++){const h=Math.round(base+amp*Math.abs(Math.sin((x+ph)/15))+4*Math.sin((x+ph)/5.5));f(col,x,y0-h,1,h);if(snow&&h>base+amp*.62)f(P.sn,x,y0-h,1,2)}};
 mt(22,16,10,P.m1,1);mt(14,12,40,P.m2,0);
 // nuvens
 const cloud=(x,y,w)=>{f(P.cl3,x+3,y+6,w-2,1);f(P.cl2,x+2,y+3,w,3);f(P.cl,x+4,y,w-6,3);f(P.cl,x,y+2,w,4);f(P.cl2,x+2,y+5,w-3,1);f(P.cl,x+7,y-2,8,3)};
 const dr=fr/2;cloud((10+dr)%(W+40)-30,28,26);cloud((74+dr*.6)%(W+40)-30,56,20);cloud((42+dr*.4)%(W+40)-30,90,26);
 // aves / vagalumes
 if(tm==='n'){for(let i=0;i<9;i++){const bl=(fr+i*3)%8<5;if(bl)f('#d8ff7a',(i*53+fr*.3)%W,y0-14-(i*17)%34+Math.round(Math.sin((fr+i)/3)*2),1,1)}}
 else{[[0,40],[1,64]].forEach(([k,yy])=>{const x=((fr*1.2+k*60)%(W+30))-15,w=(fr+k)%4<2;f('#2a2a3a',x,yy+(w?0:1),3,1);f('#2a2a3a',x-1,yy+(w?1:0),1,1);f('#2a2a3a',x+3,yy+(w?1:0),1,1)})}
 // pinheiros
 const pine=(x,h,l,d,tr)=>{for(let i=0;i<h;i+=3){const w=Math.max(1,Math.round((i+3)*.5));f(d,x-w,y0-h+i,w,3);f(l,x,y0-h+i,w+1,3);f(d,x-w,y0-h+i+2,w*2+1,1)}f(tr,x-1,y0-3,3,3)};
 [[40,30],[96,36],[116,26],[62,24],[76,30]].forEach(([x,h])=>pine(x,h,P.t1,P.t1d,P.tr));
 [[50,22],[86,26],[106,20],[124,30]].forEach(([x,h])=>pine(x,h,P.t2,P.t2d,P.tr));
 // casa cogumelo
 const hx=8;
 f('#e9cf9a',hx+4,y0-15,24,15);f('#f6e5bd',hx+4,y0-15,24,4);f('#b98a52',hx+4,y0-15,24,1);f('#9a6c38',hx+27,y0-15,1,15);
 f('#6a3f1a',hx+18,y0-12,9,12);f('#8a5a2a',hx+19,y0-11,7,11);f('#6a3f1a',hx+22,y0-11,1,11);f('#ffd36a',hx+24,y0-6,1,1);
 f('#5a3416',hx+7,y0-12,9,8);f('#8fdcf0',hx+8,y0-11,7,6);f('#d8f6ff',hx+9,y0-10,2,2);f('#5a3416',hx+11,y0-11,1,6);f('#5a3416',hx+8,y0-8,7,1);
 f('#e04848',hx+8,y0-4,1,2);f('#ff8aa0',hx+10,y0-4,1,1);f('#ffd36a',hx+12,y0-4,1,2);f('#ff8aa0',hx+14,y0-4,1,1);
 for(let i=0;i<9;i++){const w=[10,16,22,26,30,32,34,34,34][i],yy=y0-17-(8-i);f(i%2?'#cf3a3a':'#e04848',hx+16-w/2,yy,w,1);f('#ff7a6a',hx+16-w/2,yy,2,1);f('#8a1f1f',hx+16+w/2-2,yy,2,1)}
 f('#7a1f1f',hx-1,y0-17,34,1);
 [[3,21],[10,22],[18,20],[24,23],[27,19],[7,18],[14,24],[21,17]].forEach(([dx,dy])=>{f('#fff',hx+dx,y0-dy,2,2);f('#ffe0d8',hx+dx,y0-dy+1,2,1)});
 f('#6a6a78',hx-2,y0-35,5,16);f('#8a8a98',hx-2,y0-35,5,2);f('#55555f',hx+2,y0-33,1,14);f('#7a7a88',hx-2,y0-28,5,1);f('#7a7a88',hx-2,y0-24,5,1);
 for(let i=0;i<6;i++){const t=(fr+i*2)%14,xx=hx-2+Math.round(Math.sin((t+i)/2)*2)+t/2.5,yy=y0-38-t*1.8,sz=3+(i%2)+(t>8?1:0);f(t>9?P.cl2:P.cl,xx,yy,sz,sz-1);f(P.cl2,xx,yy+sz-1,sz,1)}
 // cerca
 f('#8a5a2a',42,y0-6,28,1);f('#8a5a2a',42,y0-3,28,1);f('#b9824a',42,y0-7,28,1);f('#b9824a',42,y0-4,28,1);
 for(let x=44;x<70;x+=6){f('#b9824a',x,y0-8,3,8);f('#d6a468',x,y0-8,1,8);f('#8a5a2a',x+2,y0-8,1,8);f('#b9824a',x+1,y0-9,1,1)}
 // placa
 f('#6a3f1a',W-12,y0-12,3,12);f('#8a5a2a',W-12,y0-12,1,12);f('#6a3f1a',W-19,y0-17,14,8);f('#e0a948',W-18,y0-16,12,6);f('#f2c46a',W-18,y0-16,12,1);f('#8a4a16',W-16,y0-14,7,1);f('#8a4a16',W-10,y0-15,1,3);f('#8a4a16',W-9,y0-14,1,1);
 // arbustos e flores
 const bush=(x,w)=>{f(P.g3,x,y0-3,w,3);f(P.g2,x+1,y0-5,w-2,3);f(P.g1,x+2,y0-6,w-5,2);f('#a8ec78',x+3,y0-6,2,1)};
 bush(30,10);bush(72,12);bush(104,9);
 [[24,'#ff6a8a'],[35,'#fff'],[66,'#ffd23a'],[78,'#ff6a8a'],[90,'#fff'],[100,'#ffd23a'],[112,'#ff6a8a'],[122,'#fff']].forEach(([x,col])=>{f('#2a7a2a',x,y0-2,1,2);f(col,x-1,y0-3,3,1);f(col,x,y0-4,1,3);f('#ffd23a',x,y0-3,1,1)});
 // chao
 f(P.g2,0,y0,W,3);f(P.g1,0,y0,W,1);for(let x=0;x<W;x+=2)f(P.g1,x,y0+1,1,1);for(let x=1;x<W;x+=3)f(P.g3,x,y0+3,2,1);
 for(let x=0;x<W;x+=2)f(P.g3,x,y0+3+(x%6<2?1:0),1,1);
 f(P.dirt,0,y0+4,W,14);f(P.lt,0,y0+4,W,1);
 for(let r=0;r<3;r++)for(let x=(r%2)*4;x<W;x+=8){f(P.dk,x,y0+6+r*4,5,2);f(P.lt,x,y0+6+r*4,5,1)}
 for(let x=3;x<W;x+=17)f('#d8c2a0',x,y0+8+(x%3)*2,2,1);
 f('#6a4060',0,y0+18,W,H-y0-18);f('#7e5276',0,y0+18,W,1);for(let r=0;r<(H-y0-18);r+=6)for(let x=(r/6%2)*7;x<W;x+=14)f('#593350',x,y0+21+r,7,1);
 // treinador
 pxHero(c,54,y0,fr);
 cv.parentNode.style.setProperty('--gb',((H-y0)*innerWidth/W)+'px');
 if(!PX.t)PX.t=setInterval(()=>{if(G.screen!=='map'||!$('#pxc')){clearInterval(PX.t);PX.t=0;return}pxDraw()},160);
}
