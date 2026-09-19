import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame,WEAPONS,WAVE_SECONDS } from '../src/core.js';
import { SKILL_UPGRADES,offerUpgrades,UPGRADES } from '../src/upgrades.js';
function setup(level=12){const g=new PondGame(()=>.5);g.start();g.level=level;g.elapsed=(level-1)*WAVE_SECONDS;g.enemies=[];g.spawnTimer=Infinity;return g;}
function award(g,id){g.upgradeOffer=[`skill_${id}`];assert.equal(g.chooseUpgrade(`skill_${id}`),true);}
function target(g,x=500,y=390){const e=g.spawn(20,4);Object.assign(e,{x,y,frozen:0});return e;}
test('every weapon has three real upgrade ranks, a cap and per-run reset',()=>{
 assert.deepEqual(SKILL_UPGRADES.map(p=>p.weapon).sort(),WEAPONS.map(w=>w.id).sort());
 const g=setup();for(const w of WEAPONS){for(let i=0;i<3;i++)award(g,w.id);g.upgradeOffer=[`skill_${w.id}`];assert.equal(g.chooseUpgrade(`skill_${w.id}`),false);assert.equal(g.skillRank(w.id),3);}
 g.start();assert.equal(g.skillRank('flame'),0);assert.equal(g.effectTier('flame'),0);
});
test('offers favor two unlocked skills and allow a selected skill to reach rank three',()=>{
 const owned={skill_electric:1};for(let i=0;i<20;i++){const offer=offerUpgrades(5,owned,()=>i/20);assert.equal(offer.length,3);assert.equal(new Set(offer).size,3);assert.ok(offer.includes('skill_electric'));assert.equal(offer.filter(id=>id.startsWith('skill_')).length,2);assert.ok(offer.every(id=>UPGRADES.find(p=>p.id===id).minWave<=5));}
 owned.skill_electric=3;assert.ok(!offerUpgrades(5,owned,()=>.3).includes('skill_electric'));
 const g=setup(2);g.upgradeOffer=['skill_dragon'];assert.equal(g.chooseUpgrade('skill_dragon'),false);
});
test('flame damage and hit radius grow with mastery without buffing a different weapon',()=>{
 const g=setup();for(let i=0;i<3;i++)award(g,'flame');
 const e=target(g,675);g.sustainFlame(.1,500,390);assert.ok(Math.abs(e.hp-(65-16*.1*1.6))<1e-8);
 assert.equal(g.skillPower('electric'),1);assert.ok(Math.abs(g.weaponRadius('flame')-155*1.18)<1e-8);
});
test('control mastery expands fields and duration, while queens keep freeze resistance',()=>{
 const g=setup();award(g,'vortex');g.use('vortex',500,390);assert.equal(g.fields[0].remaining,6);assert.equal(g.fields[0].radius,205*1.06);
 award(g,'freeze');const queen=target(g),regular=g.spawn(20,2);Object.assign(regular,{x:500,y:390});g.use('freeze',500,390);assert.equal(queen.frozen,2.5);assert.equal(regular.frozen,5.75);
 award(g,'rewind');const larva=g.spawn(14,0);Object.assign(larva,{x:500,y:390});g.use('rewind',500,390);assert.equal(larva.age,3);
});
test('dragon, meteor and talisman use upgraded geometry and damage',()=>{
 const g=setup();award(g,'dragon');const e=target(g,900,515);g.use('dragon',100,390);assert.equal(e.hp,35);
 award(g,'meteor');g.use('meteor',500,390);assert.ok(g.fields.every(f=>f.radius===135*1.06));
 g.fields=[];g.enemies=[];award(g,'talisman');const sealed=g.spawn(5,0);Object.assign(sealed,{x:500,y:390,sealed:12});const other=target(g,630);g.damage([sealed],1,'net',500,390);assert.ok(Math.abs(other.hp-(65-8*1.2))<1e-8);
});
test('wave spectacle grows with stage and existing upgrades, with a bounded maximum',()=>{
 const g=setup(1);assert.equal(g.effectTier('flame'),0);g.level=5;assert.equal(g.effectTier('flame'),1);g.upgrades.fuel=1;assert.equal(g.effectTier('flame'),2);award(g,'flame');assert.equal(g.effectTier('flame'),3);g.level=100;assert.equal(g.effectTier('flame'),5);
});
