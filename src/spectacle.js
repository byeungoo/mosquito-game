export function drawDragonKing(c, { t, y, width, unit: u, reducedMotion }) {
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
    oval(x,yy,r*1.2,r,'#164a59');oval(x,yy-2*u,r*.98,r*.83,i%2?'#39a99c':'#69cfab');
    oval(x,yy+r*.48,r*.65,r*.35,'#ecdc9a');
    if(i%3===0){poly([[x+5*u,yy-r*.65],[x-7*u,yy-r-18*u],[x-13*u,yy-r*.45]],'#e7cc80');stroke([[x-3*u,yy-r*.25],[x+2*u,yy],[x-3*u,yy+r*.2]],'#167c7b',1.4*u);}
  }
  c.save();c.translate(head,wave(0));c.scale(u,u);
  for(const side of [-1,1]) {
    for(let j=0;j<5;j++)poly([[-15,side*8],[-55-j*3,side*(14+j*5)+Math.sin(t*20+j)*5],[-28,side*(3+j*3)]],j%2?'#dcf4ba':'#74d8c2');
    stroke([[-12,side*13],[-26,side*33],[-22,side*53],[-38,side*64]],'#ffdf9b',5);
    stroke([[-25,side*35],[-43,side*40],[-48,side*53]],'#ffdf9b',3);
  }
  poly([[-34,-15],[-12,-27],[20,-22],[36,-9],[59,-4],[62,9],[37,19],[13,23],[-25,16]],'#208881');
  poly([[-22,-17],[4,-25],[28,-15],[18,-3],[-10,2]],'#78ddbb');
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

export function drawThunderstorm(c, { t, width, height, strikes, sx, sy, reducedMotion, tier=0 }) {
  c.save();c.fillStyle=`rgba(14,20,49,${Math.sin(t*Math.PI)*.25})`;c.fillRect(0,0,width,height);
  const points=[...strikes.slice(0,32),...Array.from({length:18},(_,i)=>({x:40+(i*157)%920,y:190+(i*113)%430}))];
  c.lineJoin='round';c.shadowColor='#95bdff';c.shadowBlur=reducedMotion?0:14;
  points.forEach((point,i)=>{
    const age=t-(i%6)*.06;
    if(age<0 || age>.5)return;
    const x=point.x*sx,y=point.y*sy;
    c.globalAlpha*=1-age/.5;c.beginPath();c.moveTo(x-30*sx,0);
    for(let k=1;k<9;k++)c.lineTo(x+Math.sin(i*7+k*9)*(k===8?0:26)*sx,y*k/8);
    c.strokeStyle=tier>=3?'#a88aff':'#638fff';c.lineWidth=(7+tier)*sx;c.stroke();c.strokeStyle='#e7f8ff';c.lineWidth=(2+tier*.3)*sx;c.stroke();
    c.beginPath();c.ellipse(x,y,(12+age*90)*sx,(4+age*28)*sy,0,0,Math.PI*2);c.strokeStyle='#adccff';c.lineWidth=1.5;c.stroke();
    c.globalAlpha=1;
  });c.restore();
}
