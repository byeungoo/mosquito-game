import test from 'node:test';
import assert from 'node:assert/strict';
import {PondGame,WEAPONS} from '../src/core.js';

// Exercise each actual skill path, including delayed fields, allies and seal chains.
for(const weapon of WEAPONS.filter(w=>w.damage || ['chorus','talisman'].includes(w.id))){
 test(`${weapon.id} damages eggs, larvae and pupae through its normal attack path`,()=>{
  for(const age of [0,8,17]){
   const g=new PondGame(()=>.5);g.start();g.level=20;g.elapsed=418;g.enemies=[];g.spawnTimer=999;
   const target=g.spawn(age,0);Object.assign(target,{x:510,y:390,hp:100,maxHp:100,frozen:10});
   const result=weapon.id==='flame'?g.sustainFlame(.1,500,390):g.use(weapon.id,500,390);
   assert.equal(result.ok,true);
   if(weapon.id==='talisman'){
    const seed=g.spawn(8,0);Object.assign(seed,{x:500,y:390,sealed:12});g.damage([seed],1,'net',500,390);
   }
   for(let i=0;i<35;i++)g.update(.1);
   assert.ok(target.hp<100,`${weapon.id} did not damage age ${age}`);
   assert.equal(g.allies.length,['loach','frog'].includes(weapon.id)?1:0);
  }
 });
}
