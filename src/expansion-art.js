export function drawCompanionDetails(c,{type,growth,time=0}){
 if(!growth)return;
 c.save();c.strokeStyle=growth===3?'#c0ffff':growth===2?'#ffe4a3':'#b0edd3';c.fillStyle=growth===3?'#82e8ff':'#f0bf73';c.lineWidth=1.5;
 if(type==='loach'){
  for(let i=0;i<5;i++){c.beginPath();c.moveTo(-20+i*7,-4);c.lineTo(-24+i*7,-10-growth*3);c.lineTo(-15+i*7,-5);c.fill();}
  for(const side of [-1,1]){c.beginPath();c.moveTo(9,side*4);c.lineTo(4,side*(12+growth*3));c.lineTo(-2,side*(16+growth*3));c.stroke();}
  if(growth>=2){for(const side of [-1,1]){c.beginPath();c.moveTo(-4,side*3);c.quadraticCurveTo(-20,side*34,-32,side*23);c.quadraticCurveTo(-15,side*12,-4,side*3);c.fillStyle=growth===3?'#93eaff88':'#ffb35199';c.fill();c.stroke();}c.beginPath();c.moveTo(19,-8);c.lineTo(24,-18);c.lineTo(20,-23);c.stroke();}
  if(growth===3){for(let i=0;i<3;i++){c.beginPath();c.moveTo(-30+i*18,-19);c.lineTo(-23+i*18,-28);c.lineTo(-25+i*18,-20);c.lineTo(-15+i*18,-25);c.stroke();}}
 }else{
  c.beginPath();c.moveTo(-9,-13);c.lineTo(-12,-25);c.lineTo(-4,-20);c.lineTo(0,-29);c.lineTo(5,-20);c.lineTo(12,-25);c.lineTo(9,-13);c.closePath();c.fill();c.stroke();
  for(const side of [-1,1]){c.beginPath();c.ellipse(side*12,2,6,10,side*.4,0,Math.PI*2);c.stroke();}
  if(growth>=2)for(let i=0;i<growth+2;i++){const a=i*Math.PI*2/(growth+2)+time*.3;c.beginPath();c.ellipse(Math.cos(a)*24,Math.sin(a)*24,4,9,a,0,Math.PI*2);c.fillStyle=growth===3?'#ffe6ae88':'#cda4ff88';c.fill();}
 }
 c.restore();
}

export function drawExpansionField(c,{id,x,y,radius,sx,sy,rank,time,remaining,reducedMotion=false}){
 if(id==='orbital'){drawOrbitalBombardment(c,{sx,sy,rank,remaining,reducedMotion});return;}
 c.save();c.translate(x*sx,y*sy);const phase=reducedMotion?0:time,r=radius*Math.min(sx,sy);c.globalAlpha=Math.min(1,remaining*2);
 if(id==='sanctuary'){
  const glow=c.createRadialGradient(0,0,1,0,0,r);glow.addColorStop(0,'#f6ffc85c');glow.addColorStop(.7,'#75e4ba40');glow.addColorStop(1,'#62efbf00');c.fillStyle=glow;c.beginPath();c.ellipse(0,0,radius*sx,radius*sy,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#bbffe2';c.lineWidth=2+rank*.3;c.stroke();
  for(let i=0;i<8+rank*2;i++){c.save();c.rotate(i*Math.PI*2/(8+rank*2)+phase*.2);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-r*.5,-r*.5,0,-r*.82);c.quadraticCurveTo(r*.5,-r*.5,0,0);c.fillStyle=i%2?'#c9ffd848':'#ffdaec55';c.fill();c.strokeStyle='#eeffbf99';c.stroke();c.restore();}
  for(let i=0;i<5;i++){const a=i*2.399+phase*.4,rr=r*.65;c.fillStyle='#e8ffbd';c.fillRect(Math.cos(a)*rr-4,Math.sin(a)*rr-1,8,2);c.fillRect(Math.cos(a)*rr-1,Math.sin(a)*rr-4,2,8);}

 }
 c.restore();
}

export function drawOrbitalBombardment(c,{sx,sy,rank,remaining,reducedMotion=false}){
 const elapsed=Math.max(0,5-remaining),satellites=rank>=4?3:2;
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const station=i=>({x:100+(i+.5)*800/satellites,y:160+(reducedMotion?0:Math.sin(elapsed*.8+i)*12)});
 c.save();c.scale(sx,sy);c.globalAlpha=Math.min(1,remaining*2);c.lineCap='round';
 // A quiet orbital track connects the spacecraft without obscuring the HUD.
 c.strokeStyle='#a4dfff33';c.lineWidth=1;c.setLineDash([8,12]);c.beginPath();c.ellipse(500,-40,530,215,0,0,Math.PI);c.stroke();c.setLineDash([]);
 const strikes=reducedMotion?4:7+rank;
 for(let i=0;i<strikes;i++){
  const clock=(reducedMotion?.44:elapsed/.95)+i/strikes,cycle=Math.floor(clock),phase=clock-cycle;
  const seed=i+cycle*19,px=85+hash(seed)*830,py=235+hash(seed+71)*380,ship=station(i%satellites);
  const aim=30+rank*3;c.save();
  // Reticles precede a lance from the satellite, followed by debris and shockwaves.
  c.strokeStyle='#ffb98a';c.lineWidth=1.6;c.globalAlpha*=phase<.3?.75:.25;
  c.beginPath();c.ellipse(px,py,aim,aim*.58,0,0,Math.PI*2);c.stroke();
  for(const side of [-1,1]){c.beginPath();c.moveTo(px+side*(aim-7),py);c.lineTo(px+side*(aim+9),py);c.moveTo(px,py+side*(aim*.58-4));c.lineTo(px,py+side*(aim*.58+7));c.stroke();}
  c.restore();
  if(phase>=.27&&phase<.58){
   const beam=c.createLinearGradient(ship.x,ship.y,px,py);beam.addColorStop(0,'#b9faff55');beam.addColorStop(.6,'#c4d3ffbb');beam.addColorStop(1,'#fff0cb');
   const dx=px-ship.x,dy=py-ship.y,len=Math.max(1,Math.hypot(dx,dy)),spread=6+rank*1.4,nx=-dy/len*spread,ny=dx/len*spread;
   c.fillStyle=beam;c.beginPath();c.moveTo(ship.x-2,ship.y);c.lineTo(px+nx,py+ny);c.lineTo(px-nx,py-ny);c.lineTo(ship.x+2,ship.y);c.closePath();c.fill();
   c.strokeStyle='#efffff';c.lineWidth=2+rank*.35;c.beginPath();c.moveTo(ship.x,ship.y);c.lineTo(px,py);c.stroke();
  }
  if(phase>=.3){
   const blast=(phase-.3)/.7,r=14+blast*(55+rank*6);c.save();c.globalAlpha*=1-blast;
   const fire=c.createRadialGradient(px,py,1,px,py,r);fire.addColorStop(0,'#fffbdfee');fire.addColorStop(.22,'#ffe396cc');fire.addColorStop(.55,'#ff965477');fire.addColorStop(1,'#fa665900');
   c.fillStyle=fire;c.beginPath();c.ellipse(px,py,r,r*.85,0,0,Math.PI*2);c.fill();
   c.strokeStyle=rank>=4?'#d2ffff':'#ffd89b';c.lineWidth=2;c.beginPath();c.ellipse(px,py,r*1.3,r*.6,0,0,Math.PI*2);c.stroke();
   if(!reducedMotion)for(let j=0;j<8;j++){const angle=j*Math.PI/4+seed,travel=blast*70;const dx=Math.cos(angle),dy=Math.sin(angle);c.beginPath();c.moveTo(px+dx*travel,py+dy*travel*.65-blast*22);c.lineTo(px+dx*(travel+8),py+dy*(travel+8)*.65-blast*22);c.stroke();}
   c.restore();
  }
 }
 for(let i=0;i<satellites;i++){
  const ship=station(i);c.save();c.translate(ship.x,ship.y);c.rotate(i%2?-.16:.16);
  // Hinged blue solar arrays, gold equipment bus, antenna dish and a bright emitter.
  c.strokeStyle='#d4edff';c.lineWidth=1.5;c.fillStyle='#203f76';
  for(const side of [-1,1]){c.beginPath();c.moveTo(side*8,0);c.lineTo(side*55,0);c.stroke();c.fillRect(side<0?-62:20,-14,42,28);c.strokeRect(side<0?-62:20,-14,42,28);
   c.strokeStyle='#7ebeff';for(let j=1;j<4;j++){const xx=(side<0?-62:20)+j*10.5;c.beginPath();c.moveTo(xx,-14);c.lineTo(xx,14);c.stroke();}c.beginPath();c.moveTo(side<0?-62:20,0);c.lineTo(side<0?-20:62,0);c.stroke();c.strokeStyle='#d4edff';}
  c.fillStyle='#e2c484';c.fillRect(-11,-12,22,24);c.strokeRect(-11,-12,22,24);c.fillStyle='#708298';c.fillRect(-6,-17,12,7);
  c.beginPath();c.moveTo(0,-17);c.lineTo(8,-30);c.stroke();c.beginPath();c.ellipse(9,-30,12,5,-.3,0,Math.PI*2);c.stroke();
  c.fillStyle='#edffff';c.beginPath();c.ellipse(0,15,6,4,0,0,Math.PI*2);c.fill();c.strokeStyle='#a5f5ff88';c.beginPath();c.ellipse(0,15,11,7,0,0,Math.PI*2);c.stroke();c.restore();
 }
 c.restore();
}

export function drawAllyBreath(c,{from,to,growth,t,sx,sy}){
 const x=from.x*sx,y=from.y*sy,dx=(to.x-from.x)*sx,dy=(to.y-from.y)*sy,length=Math.hypot(dx,dy);
 c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));c.globalAlpha=Math.max(0,1-t);
 if(growth===3){c.strokeStyle='#98edff';c.lineWidth=7;c.beginPath();c.moveTo(0,0);for(let i=1;i<=7;i++)c.lineTo(length*i/7,i===7?0:Math.sin(i*17+t*20)*10);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=2;c.stroke();}
 else{const fill=c.createLinearGradient(0,0,length,0);fill.addColorStop(0,'#fff9d9');fill.addColorStop(.45,'#ffbf59');fill.addColorStop(1,'#ff653800');c.fillStyle=fill;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(length*.6,-25,length+20,-8);c.lineTo(length,3);c.lineTo(length+18,18);c.quadraticCurveTo(length*.6,23,0,0);c.fill();}
 c.restore();
 c.save();c.globalAlpha=Math.max(0,(1-t)*.7);c.strokeStyle=growth===3?'#b4f7ff':'#ffc071';c.lineWidth=2;c.beginPath();c.ellipse(to.x*sx,to.y*sy,65*sx*(.5+t*.5),65*sy*(.5+t*.5),0,0,Math.PI*2);c.stroke();c.restore();
}
