export function drawBigBang(c,{t,width,height,rank=0,charging=false,reducedMotion=false}) {
  const x=width*.5,y=height*.5,reach=Math.hypot(width,height)*.65;
  c.save();c.fillStyle=`rgba(5,3,28,${charging?.35+t*.4:Math.max(0,.7-t*.65)})`;c.fillRect(0,0,width,height);
  for(let i=0;i<(reducedMotion?24:60+rank*15);i++){
    const a=i*2.399,r=charging?reach*((i*.173)%1)*(1-t*.75):reach*(.1+t)*(i*.137%1);
    const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
    c.strokeStyle=i%3?'#a5cdff':'#edbaff';c.lineWidth=1+(i%3);
    c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.cos(a)*(charging?-12:16+rank*9),py+Math.sin(a)*(charging?-12:16+rank*9));c.stroke();
  }
  const r=charging?Math.max(8,(1-t)*width*.12):Math.max(2,reach*t*1.6);
  const glow=c.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,'#ffffff');glow.addColorStop(.12,'#ffe6ff');glow.addColorStop(.35,rank>=2?'#cf9dffbb':'#86beffbb');glow.addColorStop(.72,'#843dff50');glow.addColorStop(1,'#36107000');
  c.fillStyle=glow;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  for(let i=0;i<2+rank;i++){
    const rr=charging?r*(1.5+i*.45):Math.max(1,r*(1-i*.12));c.save();c.translate(x,y);c.rotate(i*.7+(reducedMotion?0:t*.8));c.scale(1,.45+i*.16);c.beginPath();c.arc(0,0,rr,0,Math.PI*2);c.strokeStyle=i%2?'#b699ff':'#ffe6bd';c.lineWidth=charging?2:Math.max(1,7*(1-t));c.stroke();c.restore();
  }
  c.restore();
}

export function drawTimeStop(c,{width,height,rank=0}) {
  const x=width*.5,y=height*.55,r=Math.min(width*.43,height*.36);
  c.save();c.fillStyle='#182d5930';c.fillRect(0,0,width,height);c.translate(x,y);c.strokeStyle='#a9e8ff99';c.lineWidth=1.5+rank*.5;
  for(let j=0;j<=rank;j++){c.beginPath();c.arc(0,0,r*(1-j*.07),0,Math.PI*2);c.stroke();}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(Math.cos(a)*r*.87,Math.sin(a)*r*.87);c.lineTo(Math.cos(a)*r*.97,Math.sin(a)*r*.97);c.stroke();}
  c.beginPath();c.moveTo(-r*.35,-r*.45);c.lineTo(0,0);c.lineTo(r*.55,-r*.1);c.stroke();c.restore();
}

export function dragonFormation(rank) {
  const count=1+Math.max(0,Math.min(3,Math.floor(rank)));
  return Array.from({length:count},(_,i)=>({offset:count===1?0:(i/(count-1)-.5)*190,delay:i*.045}));
}

export function drawDragonSummon(c,{t,y,width,unit,sy,rank=0,reducedMotion=false}) {
  const formation=dragonFormation(rank),phase=reducedMotion?0:t*9,band=(120+rank*8)*sy;
  c.save();c.globalAlpha*=Math.min(1,t*7,(1-t)*5);
  // Rising wave walls and bright foam remain visible behind the entire formation.
  for(let layer=0;layer<2+rank;layer++){
    const base=y-band*.8+layer*band*1.6/(1+rank),amplitude=(12+rank*6)*sy;
    const wave=x=>base+Math.sin(x/width*Math.PI*4-phase-layer)*amplitude;
    const water=c.createLinearGradient(0,base-amplitude,0,base+band*.8);
    water.addColorStop(0,rank===3?'#a8eaff80':'#58dedd70');water.addColorStop(1,'#1478c000');
    c.beginPath();c.moveTo(0,wave(0));for(let i=1;i<=36;i++){const x=i*width/36;c.lineTo(x,wave(x));}c.lineTo(width,base+band);c.lineTo(0,base+band);c.closePath();c.fillStyle=water;c.fill();
    c.beginPath();for(let i=0;i<=36;i++){const x=i*width/36;i?c.lineTo(x,wave(x)):c.moveTo(x,wave(x));}c.strokeStyle='#cbffff';c.lineWidth=Math.max(1.5,(3+rank)*unit);c.stroke();
    for(let i=0;i<5+rank*2;i++){const x=((i/(5+rank*2)+t*.12)%1)*width;c.beginPath();c.arc(x,wave(x)-7*unit,(7+rank*3)*unit,Math.PI*.9,Math.PI*1.9);c.stroke();}
  }
  // Staggered lightning strikes, without rapidly flashing the entire screen.
  for(let i=0;i<2+rank*3;i++){
    const age=t-(.1+(i%6)*.055);if(age<0||age>.32)continue;
    c.save();c.globalAlpha*=Math.sin(age/.32*Math.PI);
    const x=(.08+((i*.618)%1)*.84)*width,endY=y+Math.sin(i*3)*band*.65,startY=Math.max(0,y-band*2.1);
    c.beginPath();c.moveTo(x-25*unit,startY);for(let j=1;j<=8;j++)c.lineTo(x+(j===8?0:Math.sin(i*13+j*7)*(18+rank*5)*unit),startY+(endY-startY)*j/8);
    c.strokeStyle=rank===3?'#e5b9ff':'#76c8ff';c.lineWidth=Math.max(3,(7+rank*3)*unit);c.shadowColor=c.strokeStyle;c.shadowBlur=reducedMotion?0:12;c.stroke();c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,(2+rank)*unit);c.stroke();
    c.beginPath();c.ellipse(x,endY,(15+age*95)*unit,(5+age*28)*unit,0,0,Math.PI*2);c.stroke();c.restore();
  }
  for(const dragon of formation) drawDragonKing(c,{t:Math.max(0,t-dragon.delay),y:y+dragon.offset*sy,width,unit:unit*(1+rank*.08),rank,reducedMotion});
  c.restore();
}

export function drawDragonKing(c, { t, y, width, unit: u, reducedMotion, rank=0 }) {
  c.save();
  const head=-100+t*(width+660*u), wave=i=>y+Math.sin(i*.17-t*10)*32*u;
  const stroke=(points,color,size)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=size;c.stroke();};
  const oval=(x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
  const poly=(points,color)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();};
  c.lineCap='round';c.lineJoin='round';
  const aura=c.createLinearGradient(0,y-110*u,0,y+110*u);aura.addColorStop(0,'#3ddcdd00');aura.addColorStop(.5,'#43ffc835');aura.addColorStop(1,'#3ddcdd00');c.fillStyle=aura;c.fillRect(0,y-110*u,width,220*u);
  for(let j=0;j<5;j++) {
    const points=Array.from({length:45},(_,i)=>[head-i*15*u,y+Math.sin(i*.3+t*12+j)*12*u+(j-2)*32*u]);
    stroke(points,j%2?'#97ffe780':'#65b4dd55',(j%2?1.5:3)*u);
  }
  // Four limbs, hooked claws, and a tapered serpentine body.
  for(const i of [12,36])for(const side of [-1,1]) {
    const x=head-i*7*u, yy=wave(i);
    stroke([[x,yy],[x-14*u,yy+side*38*u],[x+9*u,yy+side*48*u]],'#175e67',12*u);
    stroke([[x,yy],[x-14*u,yy+side*38*u],[x+9*u,yy+side*48*u]],'#58c6aa',6*u);
    for(let k=0;k<3;k++)stroke([[x+7*u,yy+side*46*u],[x+(18+k*5)*u,yy+side*(43+k*7)*u],[x+(24+k*4)*u,yy+side*(39+k*7)*u]],'#ffe6a0',2*u);
  }
  for(let i=72;i>=0;i--) {
    const x=head-i*7*u, yy=wave(i), r=(5+17*(1-i/82))*u;
    oval(x,yy,r*1.2,r,'#164a59');oval(x,yy-2*u,r*.98,r*.83,rank===3?(i%2?'#c4a3ff':'#f1dfff'):rank>0?(i%2?'#d3a74e':'#ffe1a0'):(i%2?'#39a99c':'#69cfab'));
    oval(x,yy+r*.48,r*.65,r*.35,'#ecdc9a');
    if(i%3===0){poly([[x+5*u,yy-r*.65],[x-7*u,yy-r-18*u],[x-13*u,yy-r*.45]],'#e7cc80');stroke([[x-3*u,yy-r*.25],[x+2*u,yy],[x-3*u,yy+r*.2]],'#167c7b',1.4*u);}
  }
  c.save();c.translate(head,wave(0));c.scale(u,u);
  for(const side of [-1,1]) {
    for(let j=0;j<5;j++)poly([[-15,side*8],[-55-j*3,side*(14+j*5)+Math.sin(t*20+j)*5],[-28,side*(3+j*3)]],j%2?'#dcf4ba':'#74d8c2');
    stroke([[-12,side*13],[-26,side*33],[-22,side*53],[-38,side*64]],'#ffdf9b',5);
    stroke([[-25,side*35],[-43,side*40],[-48,side*53]],'#ffdf9b',3);
  }
  poly([[-34,-15],[-12,-27],[20,-22],[36,-9],[59,-4],[62,9],[37,19],[13,23],[-25,16]],rank===3?'#ac83e5':rank>0?'#bf9449':'#208881');
  poly([[-22,-17],[4,-25],[28,-15],[18,-3],[-10,2]],rank===3?'#f5ddff':rank>0?'#ffe3a6':'#78ddbb');
  poly([[15,9],[60,5],[53,21],[22,27],[4,17]],'#0c3344');
  poly([[20,20],[54,18],[47,27],[18,30]],'#d0e8ad');
  for(let i=0;i<4;i++)poly([[23+i*8,8],[28+i*8,8],[25+i*8,16]],'#fff3ce');
  oval(52,0,5,3,'#163c43');
  stroke([[-2,-14],[15,-17],[26,-12]],'#f5d488',5);
  oval(16,-10,7,4,'#ffef91');oval(18,-10,1.8,4,'#572537');
  for(const side of [-1,1]){c.beginPath();c.moveTo(44,side*9);c.bezierCurveTo(79,side*42,12,side*61,-55,side*(49+Math.sin(t*11)*7));c.strokeStyle='#fff0b7';c.lineWidth=2;c.stroke();}
  // Dragon pearl carried ahead of its jaws.
  c.shadowColor='#b0ffeb';c.shadowBlur=reducedMotion?0:20;oval(83,7,13,13,'#8ffff069');oval(83,7,7,7,'#e3ffe8');c.shadowBlur=0;
  c.restore();c.restore();
}

export function drawThunderstorm(c, { t, width, height, strikes, sx, sy, reducedMotion, tier=0, rank=0 }) {
  c.save();c.fillStyle=`rgba(14,20,49,${Math.sin(t*Math.PI)*.25})`;c.fillRect(0,0,width,height);
  const points=[...strikes.slice(0,32),...Array.from({length:18+rank*8},(_,i)=>({x:40+(i*157)%920,y:190+(i*113)%430}))];
  c.lineJoin='round';c.shadowColor='#95bdff';c.shadowBlur=reducedMotion?0:14;
  points.forEach((point,i)=>{
    const age=t-(i%6)*.06;
    if(age<0 || age>.5)return;
    const x=point.x*sx,y=point.y*sy;
    c.globalAlpha*=1-age/.5;c.beginPath();c.moveTo(x-30*sx,0);
    for(let k=1;k<9;k++)c.lineTo(x+Math.sin(i*7+k*9)*(k===8?0:26)*sx,y*k/8);
    c.strokeStyle=tier>=3?'#a88aff':'#638fff';c.lineWidth=(7+tier+rank*7)*sx;c.stroke();c.strokeStyle='#e7f8ff';c.lineWidth=(2+tier*.3+rank)*sx;c.stroke();
    if(rank){for(let j=0;j<rank;j++){const yy=y*(.3+j*.18);c.beginPath();c.moveTo(x,yy);c.lineTo(x+(j%2?55:-55)*sx,yy+25*sy);c.lineTo(x+(j%2?28:-28)*sx,yy+45*sy);c.lineTo(x+(j%2?85:-85)*sx,yy+65*sy);c.strokeStyle=rank===3?'#ffe3a0':'#c5b3ff';c.lineWidth=(2+rank)*sx;c.stroke();}}
    c.beginPath();c.ellipse(x,y,(12+age*90)*sx,(4+age*28)*sy,0,0,Math.PI*2);c.strokeStyle='#adccff';c.lineWidth=1.5;c.stroke();
    c.globalAlpha=1;
  });c.restore();
}
