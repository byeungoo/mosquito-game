// Species change appearance, not combat stats. Evolution still determines strength.
export const SPECIES = [
  { id: 'needle', name: '송곳흡혈귀', wave: 1, color: '#f6bd87', detail: '긴 흡혈침 · 마디진 복부 · 가느다란 네 날개' },
  { id: 'mantis', name: '낫팔 사냥꾼', wave: 1, color: '#bae58c', detail: '접혔다 펴지는 거대한 낫팔과 갈라진 턱' },
  { id: 'lantern', name: '심해등불 모기', wave: 2, color: '#79e6df', detail: '빛나는 유인등 · 투명한 배 · 해파리 촉수' },
  { id: 'bat', name: '박쥐 백작', wave: 2, color: '#dca1f4', detail: '갈고리 달린 박쥐 날개와 붉은 쌍안' },
  { id: 'scorpion', name: '전갈침 거수', wave: 3, color: '#f7b567', detail: '등 위로 휘어진 독침과 집게발, 단단한 외골격' },
  { id: 'brood', name: '눈알 포식자', wave: 4, color: '#f594b8', detail: '여섯 개의 눈 · 부풀어 오른 주머니 · 원형 이빨' },
  { id: 'wraith', name: '해골 망령', wave: 5, color: '#c1d8fa', detail: '빈 눈구멍과 드러난 갈비뼈, 너덜너덜한 날개' },
  { id: 'hydra', name: '삼두 재앙룡', wave: 6, color: '#ff8d7c', detail: '세 개의 흡혈 머리와 꿈틀거리는 용의 꼬리' },
];
export const speciesOf = enemy => SPECIES.find(s => s.id === enemy.species) || SPECIES[0];
export function speciesForSpawn(id, level) {
  const available = SPECIES.filter(s => s.wave <= level);
  return available[(id - 1) % available.length].id;
}

// Canvas-native art, reused in the pond and the field guide.
export function drawMonster(ctx, enemy, time) {
  const s = speciesOf(enemy), c = s.color, rank = enemy.rank || 0;
  const t = enemy.frozen ? 0 : time, phase = enemy.seed || 0;
  const beat = .65 + Math.abs(Math.sin(t * (s.id === 'bat' ? 18 : 42) + phase)) * .45;
  const oval = (x,y,rx,ry,fill,angle=0) => { ctx.beginPath(); ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2); ctx.fillStyle=fill; ctx.fill(); };
  const line = (points,color=c,width=1.2) => {ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
  const poly = (points,fill) => {ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=.6;ctx.stroke();};
  const eye = (x,y,r=1.4) => {oval(x,y,r,r,'#fff4c7');oval(x+.3,y,r*.4,r*.7,'#39152d');};
  ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
  oval(-3,9,16,4,'#031f3044');
  for(const side of [-1,1]) {
    if(['bat','wraith','hydra'].includes(s.id)) {
      const h=side*beat;
      poly([[2,0],[-2,8*h],[-7,24*h],[-12,16*h],[-19,21*h],[-19,12*h],[-28,13*h],[-17,3*h]],s.id==='wraith'?'#b7dcf04d':c+'70');
      line([[0,0],[-7,24*h],[-13,8*h],[-28,13*h]],c+'aa',.65);
    } else {
      oval(-6,side*10*beat,15,4,c+'66',side*.65);
      oval(-11,side*7*beat,10,2.7,c+'40',side*.3);
      line([[2,0],[-17,side*17*beat]],c+'80',.6);
    }
    for(let i=0;i<3;i++)line([[3-i*4,side*2],[6-i*8,side*(8+i)], [10-i*10,side*(13+i+Math.sin(t*7+phase+i))]],c, .85);
  }
  if(s.id==='scorpion') {
    line([[-9,0],[-19,-3],[-24,-12],[-18,-20],[-7,-19],[-2,-12]],'#403940',6);
    line([[-9,0],[-19,-3],[-24,-12],[-18,-20],[-7,-19],[-2,-12]],c,3);
    poly([[-5,-13],[2,-9],[0,-19]],'#f8e0a0');
  }
  if(s.id==='hydra'||s.id==='lantern')for(let i=0;i<3;i++) {
    ctx.beginPath();ctx.moveTo(-8,i*3-3);ctx.bezierCurveTo(-20,i*7-7,-24,Math.sin(t*4+phase+i)*13,-34,Math.sin(t*5+phase+i)*8);ctx.strokeStyle=c;ctx.lineWidth=s.id==='hydra'?2.4:1;ctx.stroke();
  }
  oval(-6,0,s.id==='brood'?13:10,s.id==='brood'?9:s.id==='scorpion'?7:4.5,'#252c3e');
  if(s.id==='brood') {
    for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(-6+Math.cos(a)*8,Math.sin(a)*5,2.8,2.8,c);eye(-6+Math.cos(a)*8,Math.sin(a)*5,1.5);}
  } else for(let i=0;i<4;i++) {
    oval(-13+i*4,0,2.4,Math.max(1.6,4-i*.35),c);
    if(s.id==='wraith')line([[-13+i*4,-4],[-15+i*4,-7],[-11+i*4,-6]],'#eef1df',1.3);
  }
  if(s.id==='lantern') {
    oval(-6,0,7,3,'#90ffe899');
    line([[6,-3],[10,-12],[17,-14],[21,-9]],c,1);
    oval(21,-8,6,6,c+'25');oval(21,-8,2.7,2.7,'#e3ffd2');
  }
  if(s.id==='mantis'||s.id==='scorpion')for(const side of [-1,1]) {
    const bend=Math.sin(t*6+phase)*2;
    line([[4,side*3],[12,side*(11+bend)],[22,side*12]],c,2.4);
    poly([[22,side*12],[18,side*3],[15,side*7],[18,side*8]],'#e8f0c4');
  }
  const heads=s.id==='hydra'?[-1,0,1]:[0];
  for(const h of heads) {
    const x=7+(h===0?3:0),y=h*(9+Math.sin(t*5+phase)*1.5);
    if(h)line([[0,0],[4,y],[x,y]],c,3.5);
    oval(x,y,5,s.id==='wraith'?4.5:3.5,s.id==='wraith'?'#f1e4c7':c);
    if(s.id==='wraith'){oval(x+1,y-2,2,1.5,'#202740');oval(x+1,y+2,2,1.5,'#202740');}
    else {eye(x+1,y-1.8);eye(x+1,y+1.8);}
    line([[x+4,y],[x+(s.id==='needle'?22:12),y]],'#fff0bd',.9);
    if(['bat','brood'].includes(s.id))for(const side of [-1,1])poly([[x+3,y+side*2],[x+8,y+side*5],[x+6,y]],'#fff1cb');
  }
  if(rank>=2)for(let i=0;i<3;i++)for(const side of [-1,1])poly([[-13+i*5,side*3],[-16+i*5,side*(8+rank)],[-9+i*5,side*4]],c);
  if(rank===4){poly([[2,-5],[1,-14],[7,-10],[11,-18],[14,-9],[18,-13],[16,-3]],'#ffd27e');eye(10,-8,2);}
  ctx.restore();
}
