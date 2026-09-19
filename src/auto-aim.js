import {WEAPONS,stageOf,evolutionOf,pondPoint} from './core.js';

const d2=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2;
const globalSkills=new Set(['timestop','thunderstorm','bigbang']);
// Evaluate enemy locations and neighboring centers. No randomness: previews and casts agree.
export function smartTarget(game,id,previous=null){
 const weapon=WEAPONS.find(w=>w.id===id);if(!weapon)return null;
 if(globalSkills.has(id))return id==='timestop'||game.enemies.length?{x:500,y:390}:null;
 const enemies=game.enemies.filter(e=>e.hp>0 && (id!=='loach'||stageOf(e)!=='adult'));
 const allies=game.allies.filter(a=>a.type===id),summon=['loach','frog'].includes(id);
 if(!enemies.length){
  if(!summon)return null;
  const a=allies.length*2.399,r=allies.length?100+allies.length*9:0;
  return pondPoint(500+Math.cos(a)*r,390+Math.sin(a)*r*.6);
 }
 const radius=id==='frog'?280:id==='loach'?110:game.weaponRadius(id),r2=radius*radius;
 const water=['loach','frog','vortex','blackhole'].includes(id);
 const weight=e=>{
  let value=stageOf(e)==='adult'?2+evolutionOf(e).threat*.8:stageOf(e)==='pupa'?2:1;
  if(id==='freeze'&&e.frozen>0)value*=.15;
  if(id==='electric'&&e.rank===6&&e.shield>0)value*=2;
  if(!['freeze','rewind','vortex','loach','frog'].includes(id)&&e.frozen>0)value*=1.15;
  return value;
 };
 let candidates=enemies.map(e=>({x:e.x,y:e.y}));
 // Midpoints catch groups straddling the edge of a skill's radius.
 for(let i=0;i<Math.min(32,enemies.length);i++){
  const near=enemies.filter(e=>d2(enemies[i],e)<=4*r2);
  candidates.push({x:near.reduce((s,e)=>s+e.x,0)/near.length,y:near.reduce((s,e)=>s+e.y,0)/near.length});
 }
 if(previous)candidates.push(previous);
 let best=null,bestScore=-Infinity;
 for(let point of candidates){
  point=water?pondPoint(point.x,point.y):{x:Math.max(0,Math.min(1000,point.x)),y:Math.max(0,Math.min(700,point.y))};
  let hits=enemies.filter(e=>id==='dragon'?Math.abs(e.y-point.y)<=radius:d2(e,point)<=r2);
  if(id==='electric'){
   hits=hits.slice(0,16);const seen=new Set(hits);
   for(let i=0;i<hits.length&&hits.length<16;i++)for(const e of enemies)if(!seen.has(e)&&d2(e,hits[i])<weapon.chainRadius**2){seen.add(e);hits.push(e);if(hits.length===16)break;}
  }
  let score=hits.reduce((sum,e)=>sum+weight(e),0);
  if(id==='meteor'){
   score=0;const blast=(135*game.radiusScale(id))**2;
   for(let i=0;i<5;i++){const a=i/4*Math.PI*2,r=i?85:0,impact={x:point.x+Math.cos(a)*r,y:point.y+Math.sin(a)*r};for(const e of enemies)if(d2(e,impact)<=blast)score+=weight(e);}
  }
  if(summon)score/=1+allies.reduce((sum,a)=>sum+(d2(a,point)<120**2?.6:0),0);
  if(previous&&d2(previous,point)<35**2)score*=1.04;
  if(score>bestScore){bestScore=score;best=point;}
 }
 return best;
}
