import test from 'node:test';
import assert from 'node:assert/strict';
import {PondGame,WAVE_SECONDS,bossRankForWave,EVOLUTIONS} from '../src/core.js';
import {LATE_BOSSES,NEW_SPECIES,bossPeriod} from '../src/bestiary.js';
import {SPECIES} from '../src/monsters.js';
function setup(rank=7){const g=new PondGame(()=>.5);g.start();g.level=60;g.elapsed=59*WAVE_SECONDS;g.enemies=[];g.spawnTimer=999;const b=g.spawn(20,rank);Object.assign(b,{x:500,y:390,bossTimer:bossPeriod(rank)-.01});return {g,b};}
function target(g,age=20,x=520){const e=g.spawn(age,0);Object.assign(e,{x,y:390});return e;}
test('ten bosses and twenty ordinary species have unique identities and geometries',()=>{
 assert.equal(LATE_BOSSES.length,10);assert.equal(NEW_SPECIES.length,20);assert.equal(SPECIES.length,44);
 assert.equal(new Set(SPECIES.map(s=>s.id)).size,44);assert.equal(new Set(NEW_SPECIES.map(s=>s.shape)).size,20);
 for(const b of LATE_BOSSES){assert.equal(bossRankForWave(b.wave),b.rank);assert.equal(EVOLUTIONS[b.rank].id,b.id);assert.ok(b.threat<=17);}
 assert.equal(bossRankForWave(64),7);assert.equal(bossRankForWave(100),16);
});
test('every new boss uses its own timed pattern, with freeze and time-stop support',()=>{
 for(const spec of LATE_BOSSES){const {g,b}=setup(spec.rank);g.update(.02);assert.equal(g.drainEvents().filter(e=>e.type==='bossPattern'&&e.rank===spec.rank).length,1);
 b.bossTimer=spec.period-.01;b.frozen=2;g.update(.1);assert.equal(b.bossTimer,spec.period-.01);
 b.frozen=0;g.timeStopRemaining=2;g.update(.1);assert.equal(b.bossTimer,spec.period-.01);
 g.timeStopRemaining=0;g.status='paused';g.update(.1);assert.equal(b.bossTimer,spec.period-.01);
 }
});
test('empress spawns only six larvae and respects the population cap',()=>{
 const {g,b}=setup(7);g.update(.02);assert.equal(g.enemies.filter(e=>e!==b).length,6);assert.ok(g.enemies.filter(e=>e!==b).every(e=>e.age<20));
 while(g.enemies.length<240)target(g);b.bossTimer=8;g.update(.01);assert.equal(g.enemies.length,240);
});
test('bastion protects nearby allies; electricity breaks each target shield',()=>{
 const {g,b}=setup(8),near=target(g),far=target(g,20,950);g.update(.02);assert.ok(b.shield>0&&near.shield>0);assert.ok(!far.shield);
 const hp=b.hp;g.damage([b],10,'net',500,390);assert.equal(b.hp,hp-5);g.damage([b],3,'electric',500,390);assert.equal(b.shield,0);assert.equal(b.hp,hp-8);
});
test('moth priest heals only nearby allies and never beyond max health',()=>{
 const {g,b}=setup(9),near=target(g),far=target(g,20,950);near.hp=1;far.hp=1;b.hp-=50;g.update(.02);assert.equal(near.hp,1.16);assert.equal(far.hp,1);assert.equal(b.hp,b.maxHp-50);
 near.hp=1.99;b.bossTimer=9;g.update(.01);assert.equal(near.hp,2);
});
test('razor accelerates; chronarch advances larvae without bypassing hatch health',()=>{
 const {g,b}=setup(10);g.update(.02);assert.equal(b.rage,4);
 const {g:h}=setup(11),larva=target(h,17);h.update(.02);assert.equal(larva.hp,2);assert.ok(larva.age>=20);
});
test('mirage stays in bounds and leviathan gathers only nearby adults',()=>{
 const {g,b}=setup(12);b.x=50;g.update(.02);assert.ok(b.x>=180&&b.x<=821&&b.y>=220&&b.y<=561);assert.equal(b.rage,2);
 const {g:h,b:sea}=setup(13),adult=target(h,20,700),larva=target(h,5,700);h.update(.02);assert.ok(adult.x<620);assert.ok(adult.rage>2.9);assert.ok(larva.x>690);assert.equal(sea.rage,0);
});
test('bloodmoon eats at most five larvae without granting player kills, bounded regeneration',()=>{
 const {g,b}=setup(14);b.hp-=100;for(let i=0;i<7;i++)target(g,5);g.update(.02);assert.equal(g.enemies.length,3);assert.equal(b.hp,b.maxHp-50);assert.equal(g.kills,0);assert.equal(g.score,0);
 const {g:h,b:p}=setup(15);p.hp=p.maxHp-10;h.update(.02);assert.equal(p.hp,p.maxHp);assert.equal(p.rage,3);
});
test('void emperor alternates brood and shield; kills award respite and one boss reward',()=>{
 const {g,b}=setup(16);g.update(.02);assert.equal(g.enemies.length,5);assert.equal(b.shield,0);b.bossTimer=9;g.update(.01);assert.ok(b.shield>0);assert.equal(g.enemies.length,5);
 g.danger=4;g.spawnTimer=.1;g.damage([b],10000,'bigbang',500,390);assert.equal(g.danger,2);assert.equal(g.spawnTimer,8);assert.equal(g.bossKills,1);assert.equal(g.bossRewardWaves.size,1);
 g.start();assert.equal(g.bossKills,0);assert.equal(g.enemies.some(e=>e.rank>=7),false);
});
test('new scheduled boss is deferred during time stop and spawns once afterward',()=>{
 const g=new PondGame(()=>.5);g.start();g.enemies=[];g.level=23;g.elapsed=23*WAVE_SECONDS-.01;g.spawnTimer=999;g.timeStopRemaining=.05;g.update(.02);assert.equal(g.enemies.length,0);assert.equal(g.pendingSpawns.filter(e=>e.rank===7).length,1);
 for(let i=0;i<5;i++)g.update(.02);assert.equal(g.enemies.filter(e=>e.rank===7).length,1);assert.equal(g.pendingSpawns.length,0);
});
