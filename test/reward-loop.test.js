import test from 'node:test';
import assert from 'node:assert/strict';
import {PondGame,WAVE_SECONDS} from '../src/core.js';
import {UPGRADES} from '../src/upgrades.js';
function setup(level=8){const g=new PondGame(()=>.5);g.start();g.level=level;g.elapsed=(level-1)*WAVE_SECONDS;g.enemies=[];g.spawnTimer=999;return g;}
function kill(g,rank=0){const e=g.spawn(rank>=4?20:8,rank);g.damage([e],1000,'net',500,390);}

test('deferred wave rewards queue and can be consumed without overwriting the current choices',()=>{
 const g=setup(2);g.queueUpgrade();const offer=[...g.upgradeOffer];g.level=4;g.elapsed=4*WAVE_SECONDS-.01;g.update(.01);
 assert.deepEqual(g.upgradeOffer,offer);assert.equal(g.upgradeQueue.length,1);
 g.status='paused';assert.equal(g.chooseUpgrade(offer[0]),true);assert.equal(g.upgradeWave,5);assert.equal(g.upgradeQueue.length,0);assert.equal(g.upgradeOffer.length,3);
 assert.equal(g.chooseUpgrade(g.upgradeOffer[0]),true);assert.deepEqual(g.upgradeOffer,[]);
});
test('boss loot grants one extra upgrade and reroll per wave, including simultaneous bosses',()=>{
 const g=setup();g.queueUpgrade();g.rerolls=0;kill(g,4);kill(g,5);
 assert.equal(g.bossKills,2);assert.equal(g.upgradeQueue.length,1);assert.equal(g.rerolls,1);
 assert.equal(g.drainEvents().filter(e=>e.type==='bossLoot').length,1);
 g.chooseUpgrade(g.upgradeOffer[0]);assert.equal(g.upgradeSource,'boss');g.level=9;kill(g,4);assert.equal(g.rerolls,2);assert.equal(g.upgradeQueue.length,1);
 g.start();assert.equal(g.rerolls,2);assert.equal(g.bossRewardWaves.size,0);assert.deepEqual(g.upgradeQueue,[]);
});
test('reroll replaces every card, consumes one charge and never repeats a maxed upgrade',()=>{
 const g=setup();g.upgrades.netcraft=2;g.queueUpgrade();const before=[...g.upgradeOffer];g.status='paused';
 assert.equal(g.rerollUpgrade(),true);assert.equal(g.rerolls,1);assert.ok(g.upgradeOffer.every(id=>!before.includes(id)&&id!=='netcraft'));
 g.rerolls=0;const offer=[...g.upgradeOffer];assert.equal(g.rerollUpgrade(),false);assert.deepEqual(g.upgradeOffer,offer);
});
test('reroll with too few alternatives keeps the charge and exhausted upgrade pools do not block',()=>{
 const g=setup(30);g.upgrades=Object.fromEntries(UPGRADES.map(p=>[p.id,p.max]));g.upgrades.skill_net=4;g.queueUpgrade();
 assert.equal(g.upgradeOffer.length,1);assert.equal(g.rerollUpgrade(),false);assert.equal(g.rerolls,2);
 g.queueUpgrade('boss');g.chooseUpgrade('skill_net');assert.deepEqual(g.upgradeOffer,[]);assert.deepEqual(g.upgradeQueue,[]);
});
test('24-chain fever buffs damage and cooldown recovery once per chain and expires',()=>{
 const g=setup();for(let i=0;i<23;i++)kill(g);assert.equal(g.feverRemaining,0);kill(g);assert.equal(g.feverRemaining,6);
 const e=g.spawn(20,4);g.damage([e],10,'flame',500,390);assert.equal(e.hp,53);assert.equal(g.cooldownRate,1.3);
 g.feverRemaining=4;kill(g);assert.equal(g.feverRemaining,4);assert.equal(g.drainEvents().filter(e=>e.type==='fever').length,1);
 g.status='paused';g.update(.1);assert.equal(g.feverRemaining,4);g.status='playing';g.enemies=[];
 for(let i=0;i<41;i++)g.update(.1);assert.equal(g.feverRemaining,0);assert.equal(g.cooldownRate,1);
 for(let i=0;i<24;i++)kill(g);assert.equal(g.feverRemaining,6);g.start();assert.equal(g.feverRemaining,0);
});

test('combat report counts actual damage and attributed kills without overkill inflation',()=>{
 const g=setup(),e=g.spawn(20,2);g.damage([e],3,'electric',500,390);g.damage([e],100,'palm',500,390);
 assert.deepEqual(g.combatStats.electric,{damage:3,kills:0});assert.deepEqual(g.combatStats.palm,{damage:8,kills:1});
 g.start();assert.deepEqual(g.combatStats,{});
});
test('boss windup warns once before each ability and pauses with freezing',()=>{
 for(const rank of [5,6]){const g=setup(20),e=g.spawn(20,rank),period=rank===5?7:9;e.bossTimer=period-1.21;
  g.update(.02);assert.equal(g.drainEvents().filter(e=>e.type==='bossWindup').length,1);
  e.frozen=2;const timer=e.bossTimer;g.update(.1);assert.equal(e.bossTimer,timer);
  e.frozen=0;g.update(.1);assert.equal(g.drainEvents().filter(e=>e.type==='bossWindup').length,0);
 }
});
