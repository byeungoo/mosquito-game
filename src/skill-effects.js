// Bounded, code-drawn motifs: stronger tiers change each skill's silhouette, not just opacity.
export function drawSkillEvolution(c,{id,tier,x,y,radius=70,sx=1,sy=1,time=0,alpha=1,reducedMotion=false}) {
  if(!tier)return;
  const n=Math.min(5,tier),phase=reducedMotion?0:time,detail=reducedMotion?3:4+n;
  const colors={net:'#b3ffda',loach:'#8dffd2',frog:'#d3ff89',electric:'#adf2ff',flame:n>=3?'#a9d8ff':'#ffd391',freeze:'#b9f5ff',vortex:'#89eed8',chorus:'#e1ffa8',rewind:'#a1ddff',talisman:'#ffdb8a',palm:'#fff0ad',dragon:'#baffdc',blackhole:'#e2b5ff',meteor:'#ffc397',thunderstorm:'#c4c2ff'};
  c.save();c.translate(x*sx,y*sy);c.scale(sx,sy);c.globalAlpha*=alpha*.65;
  c.strokeStyle=colors[id]||'#e3f6c2';c.fillStyle=c.strokeStyle;c.lineWidth=1.2+n*.4;
  const ring=(r,a=0,b=Math.PI*2)=>{c.beginPath();c.arc(0,0,Math.max(1,r),a,b);c.stroke();};
  const line=(points)=>{c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();};
  const r=Math.max(22,radius);
  if(id==='vortex'||id==='blackhole') {
    for(let j=0;j<detail;j++){c.beginPath();for(let i=0;i<24;i++){const a=i*.16+j*Math.PI*2/detail-phase*(id==='vortex'?2:-1),rr=r*(.15+i/28*.72);const px=Math.cos(a)*rr,py=Math.sin(a)*rr*(id==='blackhole'?.55:1);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
    if(n>=3)ring(r*.9,phase,phase+Math.PI*1.5);
  } else if(id==='electric'||id==='thunderstorm') {
    for(let i=0;i<detail;i++){const a=i*Math.PI*2/detail+phase*.2;c.save();c.rotate(a);line([[r*.15,0],[r*.42,12],[r*.55,-9],[r*.84,5],[r,0]]);if(n>=3)line([[r*.55,-9],[r*.7,-25],[r*.9,-30]]);c.restore();}
  } else if(id==='flame'||id==='meteor') {
    for(let i=0;i<detail;i++){const a=i*Math.PI*2/detail+phase*.6,rr=r*(.45+(i%3)*.18);c.save();c.rotate(a);c.beginPath();c.moveTo(rr,0);c.quadraticCurveTo(rr-25,-9,rr-42-8*n,Math.sin(phase*5+i)*8);c.quadraticCurveTo(rr-25,9,rr,0);c.fill();c.restore();}
  } else if(id==='freeze') {
    for(let i=0;i<6+n;i++){c.save();c.rotate(i*Math.PI*2/(6+n)+phase*.1);line([[r*.35,0],[r,0]]);for(let j=0;j<2;j++){const p=r*(.55+j*.2);line([[p-12,-12],[p,0],[p-12,12]]);}c.restore();}
    if(n>=3)ring(r*.68);
  } else if(id==='palm') {
    for(let i=0;i<6+n*2;i++){c.save();c.rotate(i*Math.PI*2/(6+n*2)+phase*.2);c.beginPath();c.moveTo(r*.5,0);c.quadraticCurveTo(r*.85,-r*.18,r,0);c.quadraticCurveTo(r*.85,r*.18,r*.5,0);c.stroke();c.restore();}
  } else if(id==='dragon') {
    for(const side of [-1,1]){c.beginPath();for(let i=0;i<45;i++){const px=(i-22)*r/10,py=side*(r*.6+Math.sin(i*.35+phase*5)*n*5);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
  } else if(id==='rewind') {
    for(let j=0;j<Math.min(n,3);j++){c.save();c.rotate(-phase*(j+1)*.4);ring(r*(1-j*.15));for(let i=0;i<12;i++){const a=i*Math.PI/6,rr=r*(1-j*.15);line([[Math.cos(a)*rr*.9,Math.sin(a)*rr*.9],[Math.cos(a)*rr,Math.sin(a)*rr]]);}line([[0,-r*.5],[0,0],[r*.3,r*.18]]);c.restore();}
  } else if(id==='talisman') {
    for(let i=0;i<detail;i++){const a=i*Math.PI*2/detail+phase*.6;c.save();c.translate(Math.cos(a)*r*.85,Math.sin(a)*r*.85);c.rotate(a);c.strokeRect(-5,-10,10,20);line([[0,-7],[0,7],[-3,3],[3,3]]);c.restore();}
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
