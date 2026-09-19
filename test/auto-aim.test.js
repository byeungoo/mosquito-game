import test from 'node:test';
import assert from 'node:assert/strict';
import {PondGame,pondPoint} from '../src/core.js';
import {smartTarget} from '../src/auto-aim.js';
function setup(){const g=new PondGame(()=>.5);g.start();g.level=20;g.elapsed=418;g.enemies=[];g.spawnTimer=999;return g;}
function enemy(g,x,y,rank=0,age=8){const e=g.spawn(age,rank);Object.assign(e,{x,y});return e;}
test('auto net and flame target a larva cluster and use the actual damage radius',()=>{
 for(const id of ['net','flame']){const g=setup();enemy(g,900,580);for(const x of [300,320,340])enemy(g,x,350);const aim=smartTarget(g,id);assert.ok(aim.x<400);g.use(id,aim.x,aim.y);assert.equal(g.kills,3);assert.equal(g.enemies[0].x,900);}
});
test('dragon aims at the most valuable horizontal band across the full map',()=>{
 const g=setup();enemy(g,400,180);for(const x of [100,350,600,900])enemy(g,x,560);const aim=smartTarget(g,'dragon');g.use('dragon',aim.x,aim.y);assert.equal(g.kills,4);assert.equal(g.enemies[0].y,180);
});
test('electric auto aim prioritizes a shielded robot and breaks its shield',()=>{
 const g=setup();for(const x of [150,180,210])enemy(g,x,280);const robot=enemy(g,850,570,6,20);robot.shield=4;const aim=smartTarget(g,'electric');g.use('electric',aim.x,aim.y);assert.equal(robot.shield,0);assert.equal(robot.hp,237);
});
test('freeze avoids wasting its cast on an already frozen isolated target',()=>{
 const g=setup();const queen=enemy(g,850,570,4,20);queen.frozen=5;const fresh=enemy(g,180,280,2,20);const aim=smartTarget(g,'freeze');g.use('freeze',aim.x,aim.y);assert.equal(fresh.frozen,5);assert.equal(queen.frozen,5);
});
test('summons stay in water, spread when idle, and loaches ignore airborne targets',()=>{
 const g=setup();enemy(g,950,170,4,20);const larva=enemy(g,300,400);const aim=smartTarget(g,'loach');assert.ok(Math.abs(aim.x-larva.x)<1);assert.deepEqual(aim,pondPoint(aim.x,aim.y));
 g.enemies=[];const first=smartTarget(g,'frog');g.use('frog',first.x,first.y);const second=smartTarget(g,'frog');assert.notDeepEqual(first,second);assert.deepEqual(second,pondPoint(second.x,second.y));
});
test('global skills use the whole map, while empty attack casts can be skipped',()=>{
 const g=setup();for(const id of ['net','flame','electric','dragon','bigbang'])assert.equal(smartTarget(g,id),null);
 assert.deepEqual(smartTarget(g,'timestop'),{x:500,y:390});enemy(g,20,200);assert.deepEqual(smartTarget(g,'bigbang'),{x:500,y:390});
 assert.equal(smartTarget(g,'unknown'),null);
});
test('meteor auto aim overlaps its real blasts on a high health boss',()=>{
 const g=setup();const boss=enemy(g,650,450,5,20);boss.frozen=10;const aim=smartTarget(g,'meteor');g.use('meteor',aim.x,aim.y);for(let i=0;i<25;i++)g.update(.1);assert.ok(boss.hp<=0);
});
