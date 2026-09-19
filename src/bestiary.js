// Late encounters are separate from natural mosquito evolution (which ends at rank 4).
export const LATE_BOSSES = [
  {id:'empress',name:'천침 여제',hp:280,color:'#ffbd65',shape:'crown',period:8,pattern:'brood',action:'왕실 산란',counter:'유충을 먼저 정리하고 여제를 집중 공격하세요.',detail:'여섯 날개와 가시 왕관 · 8초마다 유충 6마리를 낳습니다.'},
  {id:'bastion',name:'철벽 장수모기',hp:330,color:'#a9c6dd',shape:'shell',period:10,pattern:'guard',action:'철갑 방진',counter:'전기 방전봉·천뢰난무로 보호막을 깨세요.',detail:'거대한 뿔과 방패 날개 · 주변 모기에게 3초 보호막을 부여합니다.'},
  {id:'mothpriest',name:'월광 나방사제',hp:380,color:'#d6b5ff',shape:'moth',period:9,pattern:'heal',action:'월광 치유',counter:'빙결로 치유를 늦추고 사제부터 처치하세요.',detail:'눈무늬 달빛 날개 · 주변 적을 최대 체력의 8%씩 회복시킵니다.'},
  {id:'razor',name:'섬광 참수자',hp:430,color:'#ff8c9e',shape:'blade',period:7,pattern:'dash',action:'칼날 질주',counter:'질주 직전 얼리거나 전장 전체 공격을 사용하세요.',detail:'길게 교차하는 네 낫팔 · 4초간 폭주하며 전장을 횡단합니다.'},
  {id:'chronarch',name:'시간 포식자',hp:480,color:'#ffe89e',shape:'clock',period:10,pattern:'age',action:'부화 가속',counter:'알과 유충을 제거하면 가속할 대상이 없어집니다.',detail:'회전하는 시계 복부 · 주변 물속 적 최대 8마리의 성장을 4초 앞당깁니다.'},
  {id:'miragequeen',name:'거울 환영왕',hp:540,color:'#90e9ee',shape:'mirror',period:8,pattern:'blink',action:'거울 도약',counter:'도약 후 위치를 확인하거나 궤도 레이저로 추적하세요.',detail:'거울 조각 날개 · 다른 위치로 이동하고 2초간 폭주합니다.'},
  {id:'leviathan',name:'심연 모기해룡',hp:610,color:'#79c9f1',shape:'serpent',period:10,pattern:'gather',action:'심연의 집결',counter:'모여든 적을 소용돌이·빙결·광역기로 함께 잡으세요.',detail:'길게 물결치는 갑각 몸통 · 주변 성충을 모으고 3초간 가속합니다.'},
  {id:'bloodmoon',name:'혈월 흡혈군주',hp:680,color:'#f978af',shape:'vampire',period:9,pattern:'consume',action:'유충 흡수',counter:'주변 유충을 먼저 잡아 회복할 먹이를 없애세요.',detail:'초승달 뿔과 붉은 막날개 · 유충을 최대 5마리 먹고 마리당 체력 10 회복.'},
  {id:'sunphoenix',name:'태양 불사모기',hp:760,color:'#ffc884',shape:'phoenix',period:11,pattern:'regenerate',action:'태양 재생',counter:'빙결과 강한 기술을 모아 회복 사이에 집중 공격하세요.',detail:'여덟 불꽃 깃날개 · 11초마다 자기 체력 6% 회복, 3초 폭주.'},
  {id:'voidemperor',name:'공허의 모기황제',hp:850,color:'#c9a0ff',shape:'void',period:9,pattern:'cycle',action:'공허의 칙령',counter:'산란과 보호막을 번갈아 사용합니다. 광역기와 번개를 교대하세요.',detail:'검은 행성 복부와 궤도 왕관 · 유충 4마리 산란과 3초 보호막을 번갈아 사용.'},
].map((b,i)=>({...b,boss:true,rank:7+i,wave:24+i*4,threat:14+Math.floor(i/3),scale:3.1+i*.06,speed:.65+(i%3)*.08,points:550+i*100}));

export const NEW_SPECIES = [
  ['saw','톱날 흡혈모기',2,'#e5bd87','saw','톱니처럼 갈라진 주둥이와 납작한 날개'],
  ['ribbon','리본꼬리 모기',3,'#eda9c8','ribbon','세 갈래 긴 리본 꼬리와 분홍 날개'],
  ['hammer','망치머리 모기',4,'#b9d99f','hammer','가로로 넓은 머리 양끝에 달린 눈'],
  ['jelly','유령 해파리모기',5,'#8ee8e3','jelly','투명한 종 모양 머리와 늘어진 촉수'],
  ['drill','나선 드릴모기',6,'#e5c989','drill','회전하는 나선형 흡혈침과 원뿔 복부'],
  ['orchid','난초 위장모기',7,'#f4b6ed','flower','다섯 꽃잎 날개와 꽃술 모양 다리'],
  ['satellite','위성 정찰모기',8,'#a8ddf5','satellite','태양전지 패널 날개와 접시 안테나'],
  ['prism','무지개 프리즘모기',9,'#bcaaff','prism','삼각 프리즘 몸통과 겹친 색유리 날개'],
  ['crab','집게 게모기',10,'#efac7e','crab','둥근 갑각과 두 개의 거대 집게'],
  ['lanternfish','심해 아귀모기',11,'#9cddc6','angler','불빛 촉수와 몸보다 큰 이빨 입'],
  ['mummy','붕대 미라모기',12,'#e3d2a8','mummy','몸을 감싼 붕대와 외눈, 풀려 나오는 천'],
  ['antler','숲의 사슴모기',14,'#c0df91','antler','나뭇가지 뿔과 나뭇잎 날개'],
  ['comet','혜성 꼬리모기',16,'#9dd5ff','comet','불타는 별 머리와 긴 혜성 꼬리'],
  ['puffer','가시 복어모기',18,'#efd598','puffer','구형 복부를 둘러싼 열여섯 가시'],
  ['harp','하프 공명모기',20,'#d4baf9','harp','현악기처럼 줄이 이어진 삼각 날개'],
  ['nautilus','나선 소라모기',22,'#a6e3d9','spiral','커다란 소용돌이 껍질과 여섯 촉수'],
  ['candle','촛불 망령모기',24,'#ffce96','candle','흘러내리는 밀랍 복부와 푸른 불꽃'],
  ['rune','룬석 골렘모기',26,'#aac3e9','rune','떠다니는 돌 마디와 빛나는 룬'],
  ['umbrella','우산 요괴모기',28,'#ed9eaa','umbrella','찢어진 우산 날개와 길게 늘어진 한 눈'],
  ['galaxy','은하 눈동자모기',30,'#c2a4fb','galaxy','작은 은하 복부와 궤도를 도는 눈동자'],
].map(([id,name,wave,color,shape,detail])=>({id,name,wave,color,shape,detail}));

export const lateBossOf=rank=>LATE_BOSSES.find(b=>b.rank===rank);
export const bossPeriod=rank=>lateBossOf(rank)?.period??(rank===5?7:9);

// Called only while the enemy's own time is running; ice and time stop delay windups.
export function performBossPattern(game,e){
 const spec=lateBossOf(e.rank);if(!spec)return;
 const nearby=game.enemies.filter(n=>n!==e&&Math.hypot(n.x-e.x,n.y-e.y)<280);
 let pattern=spec.pattern;
 if(pattern==='cycle'){e.patternStep=(e.patternStep||0)+1;pattern=e.patternStep%2?'brood':'guard';}
 if(pattern==='brood')for(let i=0;i<(spec.pattern==='cycle'?4:6);i++){
  const child=game.spawn(5,Math.min(2,Math.floor((game.level-1)/12)));
  if(child){const a=i*Math.PI/3;child.x=Math.max(150,Math.min(850,e.x+Math.cos(a)*45));child.y=Math.max(230,Math.min(550,e.y+Math.sin(a)*45));}
 }
 if(pattern==='guard')for(const n of [e,...nearby])n.shield=3;
 if(pattern==='heal')for(const n of nearby)n.hp=Math.min(n.maxHp,n.hp+n.maxHp*.08);
 if(pattern==='dash'){e.rage=4;e.angle=game.random()*Math.PI*2;}
 if(pattern==='age')for(const n of nearby.filter(n=>n.age<20).slice(0,8))n.age=Math.min(19.99,n.age+4);
 if(pattern==='blink'){e.x=180+game.random()*640;e.y=220+game.random()*340;e.rage=2;}
 if(pattern==='gather')for(const n of nearby.filter(n=>n.age>=20)){n.x=(n.x+e.x)/2;n.y=(n.y+e.y)/2;n.rage=3;}
 if(pattern==='consume'){
  const food=nearby.filter(n=>n.age<20).slice(0,5),ids=new Set(food.map(n=>n.id));
  // Eating is not a player kill and must not grant score or companion experience.
  for(const n of food)n.consumed=true;
  game.enemies=game.enemies.filter(n=>!ids.has(n.id));e.hp=Math.min(e.maxHp,e.hp+food.length*10);
 }
 if(pattern==='regenerate'){e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.06);e.rage=3;}
 game.emit('bossPattern',{x:e.x,y:e.y,rank:e.rank,pattern,name:spec.action,color:spec.color});
}

// Silhouettes use different geometry rather than recoloring the same mosquito.
export function drawBestiaryCreature(c,e,s,time){
 const t=e.frozen?0:time,color=s.color,shape=s.shape,beat=.8+Math.sin(t*12+(e.seed||0))*.15;
 const poly=(p,fill=color)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=color;c.lineWidth=.8;c.stroke();};
 const line=(p,w=1,stroke=color)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=stroke;c.lineWidth=w;c.stroke();};
 const oval=(x,y,rx,ry,fill=color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();};
 const eye=(x,y,r=2)=>{oval(x,y,r,r,'#fff6cb');oval(x+.5,y,r*.4,r*.65,'#271730');};
 c.save();c.lineJoin='round';c.lineCap='round';
 // All species keep wings and a piercing proboscis, including the most mutated forms.
 for(const side of [-1,1]){
  c.save();c.scale(1,side*beat);
  if(['shell','rune','satellite','mirror','prism'].includes(shape))poly([[-2,0],[-10,23],[-29,19],[-18,2]],color+'66');
  else if(['moth','vampire','blade','void'].includes(shape))poly([[4,0],[-5,30],[-12,20],[-25,24],[-17,8]],color+'66');
  else {c.beginPath();c.ellipse(-10,11,17,5,.5,0,Math.PI*2);c.fillStyle=color+'66';c.fill();}
  c.restore();for(let i=0;i<3;i++)line([[2-i*5,side*3],[-2-i*6,side*10],[4-i*8,side*15]],.8);
 }
 oval(-7,0,12,6,'#233344');oval(-8,0,9,4,color);oval(8,0,6,5,color);eye(10,-2);line([[13,0],[28,0]],1.2,'#fff1bf');
 if(shape==='saw')for(let i=0;i<6;i++)poly([[15+i*3,0],[17+i*3,-4],[19+i*3,0]]);
 if(shape==='ribbon'||shape==='serpent')for(let k=0;k<(shape==='serpent'?1:3);k++)for(let i=0;i<10;i++){const x=-15-i*3,y=Math.sin(t*4+i*.5+k)*5+(k-1)*5;oval(x,y,3,shape==='serpent'?5:1.8,color);if(shape==='serpent'&&i%2===0)poly([[x,y-4],[x-3,y-12],[x+3,y-4]]);}
 if(shape==='hammer'){line([[8,-13],[8,13]],6);eye(8,-13,3);eye(8,13,3);}
 if(shape==='jelly'){oval(-4,0,17,13,color+'99');for(let i=0;i<6;i++)line([[-13,(i-2.5)*4],[-24,Math.sin(t*3+i)*8+(i-2.5)*4],[-34,(i-2.5)*5]],1.3);}
 if(shape==='drill'){poly([[13,-6],[36,0],[13,6]],'#f5e7c7');for(let i=0;i<5;i++)line([[15+i*3,-5+i],[18+i*3,4-i]],1,'#6b5760');}
 if(shape==='flower')for(let i=0;i<5;i++){c.save();c.translate(-5,0);c.rotate(i*Math.PI*2/5+t*.2);oval(0,-13,6,13,color+'bb');c.restore();}
 if(shape==='satellite'){for(const side of [-1,1]){poly([[-22,side*9],[-2,side*9],[-2,side*25],[-22,side*25]],'#365b80');for(let i=0;i<4;i++)line([[-19+i*5,side*10],[-19+i*5,side*24]],.6);}line([[10,-4],[17,-16],[25,-12]],1.5);}
 if(shape==='prism'||shape==='mirror'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*.25,x=Math.cos(a)*21,y=Math.sin(a)*21;poly([[x,y-8],[x+5,y],[x,y+8],[x-5,y]],['#e4aaff99','#9bebf699','#ffeea699'][i%3]);}poly([[-19,0],[-7,-11],[5,0],[-7,11]],color+'bb');}
 if(shape==='crab')for(const side of [-1,1]){line([[3,side*4],[15,side*15]],4);poly([[13,side*12],[26,side*12],[20,side*18],[28,side*21],[13,side*22]],color);}
 if(shape==='angler'){oval(7,0,13,11,'#132432');for(let i=0;i<5;i++)for(const side of [-1,1])poly([[i*4-2,side*8],[i*4,side*2],[i*4+2,side*8]],'#f6edcd');line([[3,-6],[8,-22],[21,-22],[24,-16]]);oval(24,-16,4,4,'#d5ffb0');}
 if(shape==='mummy'){for(let i=0;i<6;i++)line([[-18+i*5,-6],[-20+i*5,6]],3,'#d9cdb0');eye(8,-2,3);line([[-16,4],[-26,8],[-23,17],[-34,20]],2);}
 if(shape==='antler')for(const side of [-1,1]){line([[7,side*3],[17,side*13],[22,side*24]],2);line([[17,side*13],[26,side*13],[29,side*18]],1.5);line([[20,side*19],[13,side*24]],1.5);}
 if(shape==='comet'||shape==='phoenix'){for(let i=0;i<(shape==='phoenix'?8:4);i++){const side=i%2?1:-1,k=Math.floor(i/2);poly([[1,side*2],[-19-k*5,side*(12+k*5+Math.sin(t*8)*3)],[-38-k*3,side*5],[-13,side*4]],i%3?'#ffb56499':'#fff0baaa');}oval(4,0,8,7,'#fff2be');}
 if(shape==='puffer'){oval(-6,0,16,14);for(let i=0;i<16;i++){const a=i*Math.PI/8;poly([[-6+Math.cos(a-.1)*13,Math.sin(a-.1)*13],[-6+Math.cos(a)*23,Math.sin(a)*23],[-6+Math.cos(a+.1)*13,Math.sin(a+.1)*13]]);}eye(4,-4);}
 if(shape==='harp')for(const side of [-1,1]){line([[3,0],[-22,side*26],[-24,0],[3,0]],2);for(let i=0;i<6;i++)line([[-20+i*4,0],[-20+i*4,side*(24-i*4)]],.7,'#fff0d2');}
 if(shape==='spiral'){oval(-8,0,16,15,'#30494e');const points=[];for(let i=0;i<70;i++){const a=i*.18,r=i*.19;points.push([-8+Math.cos(a)*r,Math.sin(a)*r]);}line(points,2.3);}
 if(shape==='candle'){poly([[-21,-7],[1,-7],[1,7],[-21,7]],'#e9dbc0');for(let i=0;i<4;i++)line([[-18+i*5,0],[-18+i*5,10+i%2*4]],2,'#e9dbc0');poly([[4,-2],[13,-20-Math.sin(t*6)*3],[18,-5],[12,1]],'#b4efff');}
 if(shape==='rune')for(let i=0;i<4;i++){const x=-22+i*9,y=Math.sin(t*3+i)*3;poly([[x-4,y-5],[x+3,y-7],[x+5,y+4],[x-3,y+6]],'#4d657c');line([[x-2,y-2],[x+2,y],[x-1,y+3]],1.2,'#bcf6ff');}
 if(shape==='umbrella'){poly([[-5,-27],[15,-14],[24,0],[15,14],[-5,27],[0,0]],color+'aa');for(const side of [-1,1])line([[-5,0],[-5,side*27],[15,side*14]],1);eye(7,0,5);line([[-5,0],[-29,0],[-34,8],[-27,11]],2);}
 if(shape==='galaxy'||shape==='void'){oval(-7,0,16,16,'#160c29');for(let k=0;k<3;k++){c.beginPath();c.ellipse(-7,0,23,8,t*.2+k*Math.PI/3,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=1;c.stroke();const a=t*.5+k*Math.PI*2/3;eye(-7+Math.cos(a)*24,Math.sin(a)*24,3);}if(shape==='void')poly([[0,-15],[1,-31],[8,-23],[14,-34],[20,-18]],'#f0d49f');}
 if(shape==='crown'){for(let i=0;i<6;i++){const a=i*Math.PI/3;poly([[-8,0],[-8+Math.cos(a)*32,Math.sin(a)*32],[-8+Math.cos(a+.25)*23,Math.sin(a+.25)*23]],color+'77');}poly([[1,-5],[0,-21],[7,-13],[13,-25],[18,-12],[22,-20],[20,-3]],'#ffe4a0');}
 if(shape==='shell'){oval(-8,0,19,15,'#526778');line([[-24,0],[6,0]],2);for(let i=0;i<4;i++)line([[-20+i*6,-12],[-20+i*6,12]],1);poly([[9,-3],[20,-19],[29,-21],[20,-10],[14,4]],'#d9e6f0');}
 if(shape==='moth'){for(const side of [-1,1]){oval(-10,side*17,11,9,color+'bb');eye(-10,side*17,5);}c.beginPath();c.arc(8,0,19,Math.PI*.7,Math.PI*1.3);c.strokeStyle='#fff0c4';c.lineWidth=2;c.stroke();}
 if(shape==='blade')for(const side of [-1,1])for(let i=0;i<2;i++)poly([[2-i*9,side*3],[19-i*12,side*21],[36-i*14,side*13],[20-i*12,side*30]],'#eccedc');
 if(shape==='clock'){oval(-8,0,17,17,'#3b3744');for(let i=0;i<12;i++){const a=i*Math.PI/6;line([[-8+Math.cos(a)*13,Math.sin(a)*13],[-8+Math.cos(a)*16,Math.sin(a)*16]],1.3);}line([[-8,0],[-8+Math.cos(t)*11,Math.sin(t)*11]],2,'#fff0bd');line([[-8,0],[-8,-10]],1.5);}
 if(shape==='vampire'){for(const side of [-1,1]){poly([[6,side*3],[17,side*17],[27,side*20],[16,side*10]],'#ffd6d6');poly([[12,side*2],[23,side*7],[17,side*1]],'#fff2d7');}oval(-11,0,9,7,'#921c54');}
 if(e.shield>0){c.beginPath();c.ellipse(-4,0,33,30,0,0,Math.PI*2);c.strokeStyle='#b7ecff';c.lineWidth=1.5;c.stroke();}
 c.restore();
}
