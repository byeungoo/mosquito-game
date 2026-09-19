import test from 'node:test';
import assert from 'node:assert/strict';
import {PondGame,WAVE_SECONDS,EVOLUTIONS,maxRankForLevel} from '../src/core.js';
function setup(level=20){const g=new PondGame(()=>.5);g.start();g.level=level;g.elapsed=(level-1)*WAVE_SECONDS;g.enemies=[];g.spawnTimer=999;return g;}
function boss(g,rank){const e=g.spawn(20,rank);Object.assign(e,{x:500,y:390,angle:0,turn:999});return e;}
function advance(g,n){for(let i=0;i<Math.round(n*100);i++)g.update(.01);}

test('scheduled bosses progress from queens to tyrannosaur and robot, with correct warnings',()=>{
 for(const [wave,rank] of [[8,4],[12,4],[16,5],[20,6],[24,7],[28,8],[60,16],[64,7]]){
  const g=setup(wave-1);g.elapsed=(wave-1)*WAVE_SECONDS-5.99;g.update(.01);
  assert.equal(g.drainEvents().find(e=>e.type==='bossWarning').rank,rank);
  g.elapsed=(wave-1)*WAVE_SECONDS-.005;g.update(.01);
  const b=g.enemies.find(e=>e.rank>=4);assert.equal(b.rank,rank);assert.ok(b.hp>=EVOLUTIONS[rank].hp);
  assert.equal(g.drainEvents().find(e=>e.type==='boss').rank,rank);
 }
 assert.equal(maxRankForLevel(100),4);
});
test('time stop defers the robot spawn and resumes it exactly once',()=>{
 const g=setup(19);g.elapsed=19*WAVE_SECONDS-.005;g.use('timestop',500,390);g.update(.01);
 assert.equal(g.enemies.length,0);assert.ok(g.pendingSpawns.some(e=>e.rank===6));
 advance(g,4.1);assert.equal(g.enemies.filter(e=>e.rank===6).length,1);assert.equal(g.pendingSpawns.length,0);
});
test('tyrannosaur roar hastens nearby adults only and freezes with time stop',()=>{
 const g=setup(16),b=boss(g,5),near=boss(g,0),far=boss(g,0),larva=g.spawn(10,0);far.x=900;Object.assign(larva,{x:500,y:390});b.bossTimer=6.99;
 g.update(.01);assert.equal(b.rage,3);assert.ok(near.rage>2.9);assert.ok(!far.rage);assert.ok(!larva.rage);
 assert.equal(g.drainEvents().filter(e=>e.type==='bossRoar').length,1);
 const timer=b.bossTimer,rage=b.rage,x=b.x;g.use('timestop',500,390);advance(g,1);assert.equal(b.bossTimer,timer);assert.equal(b.rage,rage);assert.equal(b.x,x);
});
test('robot shield halves damage, electric attacks shatter it, and it expires',()=>{
 const g=setup(),b=boss(g,6);b.bossTimer=8.99;g.update(.01);assert.equal(b.shield,4);
 g.damage([b],20,'flame',500,390);assert.equal(b.hp,230);
 g.damage([b],3,'electric',500,390);assert.equal(b.hp,227);assert.equal(b.shield,0);assert.equal(g.drainEvents().filter(e=>e.type==='shieldBreak').length,1);
 b.shield=4;g.damage([b],24,'thunderstorm',500,390);assert.equal(b.hp,203);assert.equal(b.shield,0);
 b.shield=.02;g.update(.03);assert.equal(b.shield,0);
});
test('late bosses resist rewind, freeze briefly, and award their own score once',()=>{
 for(const rank of [5,6]){
  const g=setup(),b=boss(g,rank);g.use('rewind',500,390);assert.equal(b.rank,rank);assert.equal(b.frozen,2.5);
  g.use('freeze',500,390);assert.equal(b.frozen,2.5);
  g.damage([b],1000,'bigbang',500,390);assert.equal(g.bossKills,1);assert.equal(g.score,EVOLUTIONS[rank].points);
  assert.equal(g.drainEvents().find(e=>e.type==='bossKilled').rank,rank);g.start();assert.equal(g.bossKills,0);
 }
});
