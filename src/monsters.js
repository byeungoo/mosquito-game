import { LATE_BOSSES, NEW_SPECIES, drawBestiaryCreature } from './bestiary.js';
// Species change appearance, not combat stats. Evolution still determines strength.
export const SPECIES = [
  ...NEW_SPECIES,
  ...LATE_BOSSES,
  { id: 'needle', name: '송곳흡혈귀', wave: 1, color: '#f6bd87', detail: '긴 흡혈침 · 마디진 복부 · 가느다란 네 날개' },
  { id: 'mantis', name: '낫팔 사냥꾼', wave: 1, color: '#bae58c', detail: '접혔다 펴지는 거대한 낫팔과 갈라진 턱' },
  { id: 'lantern', name: '심해등불 모기', wave: 2, color: '#79e6df', detail: '빛나는 유인등 · 투명한 배 · 해파리 촉수' },
  { id: 'bat', name: '박쥐 백작', wave: 2, color: '#dca1f4', detail: '갈고리 달린 박쥐 날개와 붉은 쌍안' },
  { id: 'scorpion', name: '전갈침 거수', wave: 3, color: '#f7b567', detail: '등 위로 휘어진 독침과 집게발, 단단한 외골격' },
  { id: 'brood', name: '눈알 포식자', wave: 4, color: '#f594b8', detail: '여섯 개의 눈 · 부풀어 오른 주머니 · 원형 이빨' },
  { id: 'wraith', name: '해골 망령', wave: 5, color: '#c1d8fa', detail: '빈 눈구멍과 드러난 갈비뼈, 너덜너덜한 날개' },
  { id: 'hydra', name: '삼두 재앙룡', wave: 6, color: '#ff8d7c', detail: '세 개의 흡혈 머리와 꿈틀거리는 용의 꼬리' },
  {id:'phoenix',name:'불사조 모기',wave:7,color:'#ffb377',detail:'불꽃 모양의 여섯 날개 · 타오르는 꼬리 깃털'},
  {id:'crystal',name:'수정 갑충모기',wave:9,color:'#a0f0ff',detail:'반투명 수정 외골격 · 다이아몬드 날개와 흡혈침'},
  {id:'centipede',name:'백족 모기',wave:11,color:'#dfcf7e',detail:'길게 이어지는 열두 마디 · 물결치는 수십 개의 다리'},
  {id:'eclipse',name:'일식 모기',wave:14,color:'#cf9fff',detail:'검은 태양의 복부 · 궤도를 도는 세 눈 · 초승달 날개'},
  { id: 'tyranno', name: '모기 티라노', wave: 16, boss: true, rank: 5, color: '#ffad61', detail: '보스 · 체력 140 · 거대 턱과 흡혈침. 7초마다 포효해 주변 성충을 3초간 가속합니다.' },
  { id: 'robot', name: '모기 로봇', wave: 20, boss: true, rank: 6, color: '#76e5ff', detail: '보스 · 체력 240 · 9초마다 4초 보호막으로 피해를 절반 흡수. 전기 방전봉·천뢰난무로 파괴하세요.' },
];
export const speciesOf = enemy => SPECIES.find(s => s.id === enemy.species) || SPECIES[0];
export function speciesForSpawn(id, level) {
  const available = SPECIES.filter(s => !s.boss && s.wave <= level);
  return available[(id - 1) % available.length].id;
}

// Canvas-native art, reused in the pond and the field guide.
export function drawMonster(ctx, enemy, time) {
  const extra=speciesOf(enemy);if(extra.shape){drawBestiaryCreature(ctx,enemy,extra,time);return;}
  if(enemy.rank>=5 || ['tyranno','robot'].includes(enemy.species)){drawBossMonster(ctx,enemy,time);return;}
  if(['phoenix','crystal','centipede','eclipse'].includes(enemy.species)){drawExoticMonster(ctx,enemy,time);return;}
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

function drawExoticMonster(c,e,time){
 const id=e.species,color=speciesOf(e).color,t=e.frozen?0:time;
 const oval=(x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();};
 const poly=(points,fill)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=color;c.lineWidth=.7;c.stroke();};
 c.save();c.lineCap='round';c.strokeStyle=color;c.lineWidth=1;
 if(id==='centipede'){
  for(let i=11;i>=0;i--){const x=9-i*4,y=Math.sin(t*7+i*.5)*4;for(const side of [-1,1]){c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+side*8);c.lineTo(x-6,y+side*(12+Math.sin(t*8+i)));c.stroke();}oval(x,y,4.2,4.5,i%2?'#716346':color);}
  for(const side of [-1,1])poly([[2,0],[-8,side*22],[-20,side*14],[-12,side*3]],'#eaf6b04a');
 }else if(id==='crystal'){
  for(const side of [-1,1])for(let i=0;i<3;i++){const wing=side*(14+i*4+Math.sin(t*10+i)*2);poly([[-3,0],[-12-i*5,wing],[-24-i*3,wing*.7],[-18,side*3]],i%2?'#b9faff66':'#7fc8f399');}
  poly([[-23,0],[-12,-10],[3,-7],[9,0],[0,8],[-13,10]],'#65a9bc');poly([[-21,-1],[-11,-8],[-2,0],[-12,8]],'#e9ffff');
  for(let i=0;i<3;i++)poly([[-16+i*7,-5],[-13+i*7,-17],[-8+i*7,-5]],'#c6faffbb');
 }else if(id==='phoenix'){
  for(const side of [-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(2,side*2);c.quadraticCurveTo(-5-i*8,side*(27+Math.sin(t*12+i)*4),-26-i*3,side*(19-i*4));c.quadraticCurveTo(-13,side*7,2,side*2);c.fillStyle=['#ff9f5677','#ffe19c99','#f76b6477'][i];c.fill();}
  for(let i=0;i<3;i++)poly([[-8,-3],[-37-Math.sin(t*8+i)*5,(i-1)*7],[-13,4]],i%2?'#ffe19f':'#ff925d');oval(-5,0,11,5,'#9f4246');oval(-6,0,7,3,'#ffc887');
 }else{
  for(const side of [-1,1]){c.beginPath();c.moveTo(3,0);c.quadraticCurveTo(-7,side*35,-29,side*16);c.quadraticCurveTo(-9,side*20,-9,side*6);c.closePath();c.fillStyle='#c9a6ff77';c.fill();}
  oval(-8,0,14,14,'#100e2b');c.beginPath();c.ellipse(-8,0,15,15,0,0,Math.PI*2);c.strokeStyle='#e5b7ff';c.lineWidth=2;c.stroke();
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3+t*.7;oval(-8+Math.cos(a)*10,Math.sin(a)*10,2.5,2.5,'#ffe5bb');oval(-8+Math.cos(a)*10,Math.sin(a)*10,1,1.8,'#4c2359');}
 }
 oval(10,0,6,4,color);oval(12,-2,2,1.6,'#fff8ce');oval(12,2,2,1.6,'#fff8ce');
 c.strokeStyle='#fff1c7';c.lineWidth=1.2;c.beginPath();c.moveTo(15,0);c.lineTo(31,0);c.stroke();
 for(const side of [-1,1]){c.beginPath();c.moveTo(10,side*3);c.lineTo(17,side*10);c.lineTo(22,side*9);c.stroke();}
 if(e.rank===4)poly([[1,-7],[0,-16],[6,-12],[10,-20],[14,-12],[18,-16],[16,-5]],'#ffd77b');c.restore();
}

function drawBossMonster(c,e,time){
  const robot=e.rank===6 || e.species==='robot', t=e.frozen?0:time;
  const wing=.8+Math.sin(t*(robot?18:24)+(e.seed||0))*.18;
  const color=robot?'#76e5ff':'#ffad61';
  const poly=(p,fill,stroke=color,w=.7)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=w;c.stroke();};
  const line=(p,color,w)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.stroke();};
  const oval=(x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();};
  c.save();c.lineJoin='round';c.lineCap='round';
  oval(-4,12,28,6,'#07152255');
  if(robot){
    // Angular mechanical wings, thrusters and six articulated landing claws.
    for(const side of [-1,1]){
      c.save();c.scale(1,side*wing);
      poly([[-6,-3],[-31,-26],[-12,-22],[7,-5]],'#30495f');
      poly([[-5,-7],[-25,-22],[-13,-19],[1,-7]],'#8deaff99');
      line([[-21,-20],[-16,-14],[-7,-9]],'#e2fbff',.8);c.restore();
      for(let i=0;i<3;i++){const x=-13+i*10;line([[x,side*5],[x-5,side*15],[x+4,side*(22+i%2*3)]],'#203447',3.2);line([[x,side*5],[x-5,side*15],[x+4,side*(22+i%2*3)]],'#afc9dd',1.5);oval(x-5,side*15,1.7,1.7,'#5ff1ff');}
      poly([[-21,side*5],[-33-Math.sin(t*12)*3,side*8],[-22,side*11]],'#67dbff88');
    }
    poly([[-25,-6],[-18,-12],[5,-11],[15,-6],[15,7],[4,12],[-19,10]],'#637c93');
    for(let i=0;i<3;i++)poly([[-22+i*8,-6],[-17+i*8,-9],[-12+i*8,-5],[-12+i*8,7],[-20+i*8,8]],i%2?'#34445e':'#94b0c4');
    oval(-4,0,9,9,'#1a2647');oval(-4,0,6.5,6.5,e.shield>0?'#d8ffff':'#64dfff');oval(-4,0,3.5,3.5,'#ffffff');
    poly([[11,-9],[24,-7],[28,0],[23,10],[10,8]],'#b1c8d5');
    poly([[15,-5],[24,-4],[23,0],[15,2]],'#ff5076');
    line([[26,3],[44,3]],'#35475e',4);line([[27,2],[46,2]],'#d4f6ff',1.2);
    for(const side of [-1,1]){line([[14,side*7],[13,side*16],[20,side*19]],'#97c2d9',1.6);oval(20,side*19,2,2,'#ff5d94');}
    if(e.shield>0){c.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3;const x=Math.cos(a)*37,y=Math.sin(a)*29;i?c.lineTo(x,y):c.moveTo(x,y);}c.fillStyle='#70dbff20';c.fill();c.strokeStyle='#a7f5ff';c.lineWidth=1.4;c.stroke();}
  }else{
    // Tyrannosaur silhouette: long tail, muscular legs, short forearms, huge toothed jaws.
    for(const side of [-1,1]){c.save();c.scale(1,side*wing);poly([[-5,0],[-25,-26],[-6,-21],[11,-4]],'#ecb77645');line([[-5,-3],[-21,-23],[-7,-14]],'#ffe3a5',.6);c.restore();}
    c.beginPath();c.moveTo(-8,-7);c.bezierCurveTo(-30,-5,-33,13,-48,3+Math.sin(t*4)*4);c.bezierCurveTo(-36,23,-19,10,-5,10);c.closePath();c.fillStyle='#bd633f';c.fill();c.strokeStyle='#ffbd73';c.lineWidth=.8;c.stroke();
    for(const side of [-1,1]){oval(-8,side*8,8,5,'#ab573c');line([[-8,side*8],[-12,side*18],[-2,side*21]],'#d5854e',5);for(let i=0;i<3;i++)line([[-3+i*2,side*20],[3+i*2,side*(22+i)]],'#fff0c6',1);}
    oval(-6,0,17,10,'#de9553');oval(-4,3,13,5,'#edbd77');
    for(let i=0;i<5;i++)poly([[-23+i*6,-4],[-22+i*6,-14-i%2*3],[-17+i*6,-7]],'#72404a');
    poly([[3,-8],[13,-15],[29,-13],[35,-7],[35,3],[17,5],[8,10]],'#d78548');
    poly([[14,1],[34,0],[31,13],[13,13],[7,7]],'#49293a');
    const gape=2+Math.sin(t*5)*1.2;
    poly([[13,12],[31,11],[28,15+gape],[11,15+gape],[5,8]],'#c56c43');
    for(let i=0;i<5;i++){const x=14+i*4;poly([[x,2],[x+3,2],[x+1,7]],'#fff3c9');poly([[x,12],[x+3,12],[x+2,8]],'#ffe8b8');}
    line([[32,-5],[47,-9]],'#ffe7ad',1.5);line([[12,-14],[17,-20],[22,-18]],'#a85440',1.2);
    oval(23,-8,4,2.8,'#ffe583');oval(24,-8,1,2.5,'#722439');line([[18,-12],[28,-11]],'#72383c',1.6);
    for(const side of [-1,1])line([[5,side*6],[10,side*10],[15,side*9]],'#f2ba70',2);
    if(e.rage>0){c.beginPath();c.ellipse(0,0,36,26,0,0,Math.PI*2);c.strokeStyle='#ff7659aa';c.lineWidth=1.4;c.stroke();}
  }
  c.restore();
}
