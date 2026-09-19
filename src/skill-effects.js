// Bounded, code-drawn motifs: stronger tiers change each skill's silhouette, not just opacity.
export function drawSkillEvolution(c,{id,tier,rank=0,x,y,radius=70,sx=1,sy=1,time=0,alpha=1,reducedMotion=false}) {
  if(!tier&&!rank)return;
  const n=rank?rank*2:Math.min(1,tier),phase=reducedMotion?0:time,detail=reducedMotion?4+rank:4+n;
  const colors={timestop:'#a9e8ff',bigbang:'#cf9dff',net:'#b3ffda',loach:'#8dffd2',frog:'#d3ff89',electric:'#adf2ff',flame:n>=3?'#a9d8ff':'#ffd391',freeze:'#b9f5ff',vortex:'#89eed8',chorus:'#e1ffa8',rewind:'#a1ddff',talisman:'#ffdb8a',palm:'#fff0ad',dragon:'#baffdc',blackhole:'#e2b5ff',meteor:'#ffc397',thunderstorm:'#c4c2ff'};
  c.save();c.translate(x*sx,y*sy);c.scale(sx,sy);c.globalAlpha*=alpha*(rank?.9:.35);
  c.strokeStyle=colors[id]||'#e3f6c2';c.fillStyle=c.strokeStyle;c.lineWidth=rank?3+rank*2:1.5;
  c.lineJoin='round';c.lineCap='round';c.shadowColor=c.strokeStyle;c.shadowBlur=reducedMotion?0:Math.min(18,rank*5);
  const ring=(r,a=0,b=Math.PI*2)=>{c.beginPath();c.arc(0,0,Math.max(1,r),a,b);c.stroke();};
  const line=(points)=>{c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();};
  const r=Math.max(22,radius);
  if(rank){
    const glow=c.createRadialGradient(0,0,r*.12,0,0,r);
    glow.addColorStop(0,colors[id]+'00');glow.addColorStop(.65,colors[id]+'12');glow.addColorStop(.88,colors[id]+'45');glow.addColorStop(1,colors[id]+'00');
    c.fillStyle=glow;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.fillStyle=colors[id];
    if(rank===3){c.save();c.rotate(phase*.2);for(let i=0;i<12;i++){c.rotate(Math.PI/6);line([[r*.85,-4],[r*.98,0],[r*.85,4]]);}c.restore();}
  }
  if(id==='vortex'||id==='blackhole') {
    for(let j=0;j<detail;j++){c.beginPath();for(let i=0;i<24;i++){const a=i*.16+j*Math.PI*2/detail-phase*(id==='vortex'?2:-1),rr=r*(.15+i/28*.72);const px=Math.cos(a)*rr,py=Math.sin(a)*rr*(id==='blackhole'?.55:1);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
    if(n>=3)ring(r*.9,phase,phase+Math.PI*1.5);
    if(rank>=2){c.save();c.globalAlpha*=.7;c.lineWidth=12+rank*3;ring(r*.55);c.lineWidth=3;c.strokeStyle='#ffffff';ring(r*.55);c.restore();}
  } else if(id==='electric'||id==='thunderstorm') {
    for(let i=0;i<detail;i++){const a=i*Math.PI*2/detail+phase*.2;c.save();c.rotate(a);line([[r*.15,0],[r*.42,12],[r*.55,-9],[r*.84,5],[r,0]]);if(n>=3)line([[r*.55,-9],[r*.7,-25],[r*.9,-30]]);c.restore();}
  } else if(id==='flame'||id==='meteor') {
    for(let i=0;i<detail;i++){const a=i*Math.PI*2/detail+phase*.6,rr=r*(.45+(i%3)*.18);c.save();c.rotate(a);c.beginPath();c.moveTo(rr,0);c.quadraticCurveTo(rr-25,-9,rr-42-8*n,Math.sin(phase*5+i)*8);c.quadraticCurveTo(rr-25,9,rr,0);c.fill();c.restore();}
  } else if(id==='freeze') {
    for(let i=0;i<6+n;i++){c.save();c.rotate(i*Math.PI*2/(6+n)+phase*.1);line([[r*.35,0],[r,0]]);for(let j=0;j<2;j++){const p=r*(.55+j*.2);line([[p-12,-12],[p,0],[p-12,12]]);}c.restore();}
    if(n>=3)ring(r*.68);
    if(rank){for(let i=0;i<6+rank*2;i++){c.save();c.rotate(i*Math.PI*2/(6+rank*2));c.beginPath();c.moveTo(r*.45,-8);c.lineTo(r*.83,-16);c.lineTo(r,0);c.lineTo(r*.83,16);c.lineTo(r*.45,8);c.closePath();c.fillStyle='#b3efff88';c.fill();c.stroke();c.restore();}}
  } else if(id==='palm') {
    for(let i=0;i<6+n*2;i++){c.save();c.rotate(i*Math.PI*2/(6+n*2)+phase*.2);c.beginPath();c.moveTo(r*.35,0);c.quadraticCurveTo(r*.85,-r*.23,r,0);c.quadraticCurveTo(r*.85,r*.23,r*.35,0);if(rank){c.fillStyle=rank===3?'#ffda7955':'#ffd97c28';c.fill();}c.stroke();c.restore();}
  } else if(id==='dragon') {
    for(const side of [-1,1]){c.beginPath();for(let i=0;i<45;i++){const px=(i-22)*r/10,py=side*(r*.6+Math.sin(i*.35+phase*5)*n*5);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
  } else if(id==='rewind') {
    for(let j=0;j<Math.min(n,3);j++){c.save();c.rotate(-phase*(j+1)*.4);ring(r*(1-j*.15));for(let i=0;i<12;i++){const a=i*Math.PI/6,rr=r*(1-j*.15);line([[Math.cos(a)*rr*.9,Math.sin(a)*rr*.9],[Math.cos(a)*rr,Math.sin(a)*rr]]);}line([[0,-r*.5],[0,0],[r*.3,r*.18]]);c.restore();}
  } else if(id==='talisman') {
    for(let i=0;i<detail;i++){const a=i*Math.PI*2/detail+phase*.6;c.save();c.translate(Math.cos(a)*r*.75,Math.sin(a)*r*.75);c.rotate(a);const z=1+rank*.8;c.scale(z,z);c.fillStyle='#ffda89';c.fillRect(-5,-10,10,20);c.strokeStyle='#9f354b';c.lineWidth=1.2;line([[0,-7],[0,7],[-3,3],[3,3]]);c.restore();}
  } else if(id==='chorus') {
    for(let i=0;i<Math.min(n+1,4);i++)ring(r*(.4+i*.16),phase*.2,phase*.2+Math.PI*1.7);
    c.font=`bold ${18+n*2}px sans-serif`;for(let i=0;i<detail;i++){const a=i*Math.PI*2/detail+phase*.4;c.fillText(i%2?'♪':'♫',Math.cos(a)*r*.8,Math.sin(a)*r*.8);}
  } else if(id==='loach'||id==='frog') {
    ring(r,phase,phase+Math.PI*1.6);
    for(let i=0;i<n+2;i++){const a=phase+i*Math.PI*2/(n+2);c.beginPath();c.arc(Math.cos(a)*r,Math.sin(a)*r,2+n*.4,0,Math.PI*2);c.fill();}
    if(n>=3)line([[-12,-r],[-16,-r-13],[-5,-r-8],[0,-r-18],[5,-r-8],[16,-r-13],[12,-r]]);
  } else {
    for(let i=0;i<Math.min(n+1,4);i++)ring(r*(.72+i*.09),phase+i,phase+i+Math.PI*1.3);
    if(n>=3){line([[-r*.6,0],[r*.6,0]]);line([[0,-r*.6],[0,r*.6]]);}
  }
  c.restore();
}

// Replaces the ordinary flame silhouette after mastery; nozzle remains at (0, 102).
export function drawEvolvedFlame(c,{rank,time,reducedMotion=false}) {
  const phase=reducedMotion?0:time, palette=rank===1?['#ff7b25','#ffe9a1']:rank===2?['#188fff','#a5ffff']:['#a55aff','#fff0ff'];
  c.save();c.lineJoin='round';c.shadowColor=palette[0];c.shadowBlur=reducedMotion?0:18;
  const jets=rank===1?3:rank===2?5:7;
  for(let i=0;i<jets;i++){
    const side=(i-(jets-1)/2)/((jets-1)/2),endX=side*(rank===3?155:125),endY=-120-Math.cos(side*1.5)*55;
    const sway=Math.sin(phase*12+i*1.7)*9;
    const fill=c.createLinearGradient(0,102,endX,endY);fill.addColorStop(0,'#ffffff');fill.addColorStop(.2,palette[1]);fill.addColorStop(.65,palette[0]);fill.addColorStop(1,palette[0]+'00');
    c.fillStyle=fill;c.beginPath();c.moveTo(-8,102);c.bezierCurveTo(-28+endX*.35,25,endX-35+sway,-35,endX,endY);c.bezierCurveTo(endX+40,-35,endX*.3+25,30,8,102);c.closePath();c.fill();
  }
  if(rank===3){
    // Phoenix wings frame a white-hot core, clearly different from the blue jet tier.
    for(const side of [-1,1])for(let i=0;i<4;i++){c.beginPath();c.moveTo(side*12,20);c.quadraticCurveTo(side*(100+i*12),-20,side*(150-i*14),-115-i*12);c.quadraticCurveTo(side*70,-15-i*10,side*12,20);c.fillStyle=i%2?'#f4caffb0':'#ab83ffb0';c.fill();}
    c.strokeStyle='#ffffff';c.lineWidth=7;c.beginPath();c.moveTo(0,100);c.quadraticCurveTo(Math.sin(phase*6)*12,0,0,-140);c.stroke();
  }
  for(let i=0;i<(reducedMotion?5:10+rank*4);i++){const p=(phase*.7+i*.127)%1,angle=i*2.399;c.fillStyle=i%2?palette[1]:'#ffffff';c.beginPath();c.ellipse(Math.cos(angle)*(30+p*110),80-p*245,2+rank,5+rank*2,angle,0,Math.PI*2);c.fill();}
  c.restore();
}

export function drawEvolvedBolt(c,{from,to,rank,sx,sy,time=0,reducedMotion=false}) {
  const color=rank===1?'#64e4ff':rank===2?'#bd8cff':'#ffcf74',phase=reducedMotion?0:Math.floor(time*12);
  const points=Array.from({length:9},(_,i)=>{const p=i/8;return {x:(from.x+(to.x-from.x)*p+(i&&i<8?Math.sin(i*17+phase)*22:0))*sx,y:(from.y+(to.y-from.y)*p+(i&&i<8?Math.cos(i*11+phase)*18:0))*sy};});
  c.save();c.lineCap='round';c.lineJoin='round';c.shadowColor=color;c.shadowBlur=reducedMotion?0:14;
  const stroke=(width,col)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=col;c.lineWidth=width;c.stroke();};
  stroke(Math.max(3,(9+rank*5)*Math.min(sx,sy)),color);stroke(Math.max(1.5,(2+rank)*Math.min(sx,sy)),'#ffffff');
  for(let i=1;i<=rank*2;i++){const p=points[1+i],sign=i%2?1:-1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+sign*24*sx,p.y-22*sy);c.lineTo(p.x+sign*15*sx,p.y-39*sy);c.lineTo(p.x+sign*42*sx,p.y-56*sy);c.strokeStyle=color;c.lineWidth=Math.max(1.5,rank*sx);c.stroke();}
  c.beginPath();c.arc(to.x*sx,to.y*sy,(8+rank*5)*Math.min(sx,sy),0,Math.PI*2);c.fillStyle='#ffffff';c.fill();c.restore();
}

export function drawPalmEchoes(c,{x,y,radius,rank,sx,sy}) {
  if(!rank)return;
  c.save();c.translate(x*sx,y*sy);c.scale(sx,sy);c.fillStyle=rank===3?'#ffe6a499':'#ffe6a45c';c.strokeStyle='#fff4cb';c.lineWidth=2;
  for(let i=0;i<rank*2;i++){
    const a=Math.PI+i*Math.PI*2/(rank*2);c.save();c.translate(Math.cos(a)*radius*.65,Math.sin(a)*radius*.65);c.rotate(a+Math.PI/2);c.scale(.55+rank*.12,.55+rank*.12);
    c.beginPath();c.roundRect(-28,-12,56,62,18);c.fill();c.stroke();
    for(let j=0;j<4;j++){c.beginPath();c.roundRect(-28+j*14,-54-(j===1?14:j===2?8:0),12,62,6);c.fill();c.stroke();}
    c.beginPath();c.moveTo(-24,23);c.lineTo(-48,-1);c.quadraticCurveTo(-62,-24,-42,-19);c.lineTo(-21,2);c.fill();c.stroke();c.restore();
  }
  c.restore();
}
