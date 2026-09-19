import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame,WAVE_SECONDS } from '../src/core.js';
function setup(level=12){const g=new PondGame(()=>.5);g.start();g.level=level;g.elapsed=(level-1)*WAVE_SECONDS;g.enemies=[];g.spawnTimer=100;return g;}
function enemy(g,rank=2,x=500,age=20){const e=g.spawn(age,rank);Object.assign(e,{x,y:390,turn:100,angle:0});return e;}
function advance(g,seconds){for(let i=0;i<Math.round(seconds*100);i++)g.update(.01);}
test('time stop blocks movement, hatching, breeding, spawning and danger while player damage still works',()=>{
 const g=setup(7),queen=enemy(g,4),pupa=enemy(g,0,400,19.99);queen.breed=8.49;g.spawnTimer=0;g.danger=4.9;
 g.use('timestop',500,390);const before=g.enemies.map(e=>({id:e.id,x:e.x,y:e.y,age:e.age,breed:e.breed}));advance(g,1);
 assert.deepEqual(g.enemies.map(e=>({id:e.id,x:e.x,y:e.y,age:e.age,breed:e.breed})),before);assert.equal(g.danger,4.9);assert.equal(g.spawnTimer,0);assert.equal(g.spawn(),null);
 const hp=queen.hp;g.damage([queen],2,'net',500,390);assert.equal(queen.hp,hp-2);assert.equal(pupa.age,19.99);
 g.status='paused';const remaining=g.timeStopRemaining;advance(g,1);assert.equal(g.timeStopRemaining,remaining);
 g.status='playing';advance(g,3.1);assert.ok(g.enemies.length>2);assert.ok(queen.x!==before[0].x);assert.equal(g.timeStopRemaining,0);
});
test('wave reinforcements and queen wait for time stop without being lost or duplicated',()=>{
 const g=setup(7);g.elapsed=7*WAVE_SECONDS-.05;g.use('timestop',500,390);advance(g,.1);
 assert.equal(g.level,8);assert.equal(g.enemies.length,0);assert.ok(g.pendingSpawns.length>0);assert.ok(!g.drainEvents().some(e=>e.type==='boss'));
 advance(g,4);assert.equal(g.pendingSpawns.length,0);assert.equal(g.enemies.filter(e=>e.rank===4).length,1);assert.equal(g.drainEvents().filter(e=>e.type==='boss').length,1);
});
test('time stop mastery adds one second per rank and resets on restart',()=>{
 const g=setup();g.upgrades.skill_timestop=3;g.use('timestop',1,1);assert.equal(g.timeStopRemaining,7);assert.equal(g.use('timestop',1,1).reason,'cooldown');g.start();assert.equal(g.timeStopRemaining,0);assert.deepEqual(g.pendingSpawns,[]);
 const locked=setup(5);assert.equal(locked.use('timestop',1,1).reason,'locked');
});
test('big bang delays its all-map damage, hits all life stages, and leaves allies alive',()=>{
 const g=setup();const a=enemy(g,4,50),b=enemy(g,3,950),c=enemy(g,2,200,5);g.use('loach',500,390);g.use('frog',500,390);
 assert.equal(g.use('bigbang',1,1).ok,true);assert.equal(a.hp,65);assert.equal(b.hp,20);assert.equal(c.hp,2);assert.equal(g.use('bigbang',1,1).reason,'cooldown');
 g.use('timestop',500,390);advance(g,1.1);assert.ok(g.enemies.includes(a));advance(g,.2);assert.equal(g.enemies.length,0);assert.equal(g.allies.length,2);assert.equal(g.drainEvents().filter(e=>e.type==='bigbang').length,1);
});
test('big bang mastery and freeze stack, charging respects pause, and restart cancels it',()=>{
 const g=setup(),e=enemy(g,4);e.hp=e.maxHp=300;e.frozen=5;g.upgrades.skill_bigbang=3;g.use('bigbang',0,0);g.status='paused';advance(g,2);assert.equal(e.hp,300);assert.equal(g.fields[0].remaining,1.2);
 g.status='playing';advance(g,1.3);assert.ok(Math.abs(e.hp-(300-65*1.6*1.5))<1e-8);
 const locked=setup(11);assert.equal(locked.use('bigbang',0,0).reason,'locked');g.start();assert.equal(g.fields.length,0);
});
