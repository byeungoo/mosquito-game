import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame, WAVE_SECONDS, ALLY_ATTACK_INTERVALS } from '../src/core.js';
import { UPGRADES, offerUpgrades } from '../src/upgrades.js';
function setup(level=1) {const g=new PondGame(()=>.5);g.start();g.enemies=[];g.spawnTimer=Infinity;g.level=level;g.elapsed=(level-1)*WAVE_SECONDS;return g;}
function enemy(g,rank=0,age=20,x=500) {const e=g.spawn(age,rank);Object.assign(e,{x,y:390,angle:0,turn:100});return e;}
function award(g,id) {g.upgradeOffer=[id];assert.equal(g.chooseUpgrade(id),true);}

test('W2 offers three unique upgrades and a choice is consumed exactly once',()=>{
 const g=setup();g.elapsed=WAVE_SECONDS-.05;g.update(.05);
 assert.equal(g.upgradeOffer.length,3);assert.equal(new Set(g.upgradeOffer).size,3);
 assert.ok(g.upgradeOffer.every(id=>UPGRADES.find(p=>p.id===id).minWave<=2));
 assert.equal(g.chooseUpgrade('hunter'),false);
 const choice=g.upgradeOffer[0];g.status='paused';assert.equal(g.chooseUpgrade(choice),true);
 assert.equal(g.chooseUpgrade(choice),false);assert.equal(g.upgrades[choice],1);
 assert.equal(g.drainEvents().filter(e=>e.type==='upgradeOffer').length,1);
 g.status='playing';g.elapsed=4*WAVE_SECONDS-.05;g.update(.05);assert.equal(g.upgradeOffer.length,3);
 g.start();assert.deepEqual(g.upgrades,{});assert.deepEqual(g.upgradeOffer,[]);
});
test('maxed upgrades are excluded; deferred choices cannot be overwritten',()=>{
 const owned=Object.fromEntries(UPGRADES.map(p=>[p.id,p.max]));assert.deepEqual(offerUpgrades(20,owned,()=>.99),[]);
 const g=setup(2);g.upgradeOffer=['netcraft'];g.elapsed=4*WAVE_SECONDS-.05;g.update(.05);assert.deepEqual(g.upgradeOffer,['netcraft']);
 g.upgrades.netcraft=2;assert.equal(g.chooseUpgrade('netcraft'),false);
});
test('net upgrade changes damage and actual hit radius, power and hunter stack on correct targets',()=>{
 const g=setup(5);award(g,'netcraft');assert.equal(g.weaponRadius('net'),64);
 const adult=enemy(g,0,20,562);g.use('net',500,390);assert.ok(!g.enemies.includes(adult));
 award(g,'power');award(g,'hunter');const queen=enemy(g,4);
 g.damage([queen],10,'electric',500,390);assert.ok(Math.abs(queen.hp-(65-10*1.12*1.25))<1e-8);
 const regular=enemy(g,1);g.damage([regular],1,'flame',500,390);assert.ok(Math.abs(regular.hp-3.88)<1e-8);
});
test('fuel, cooldown recovery, ally training and ice upgrades affect their mechanics',()=>{
 const g=setup(6);award(g,'fuel');g.sustainFlame(.1,500,390);assert.equal(g.heat,2.125);
 award(g,'tempo');g.cooldowns.electric=5;g.update(.1);assert.ok(Math.abs(g.cooldowns.electric-4.888)<1e-8);
 g.use('frog',500,390);award(g,'pack');g.allies[0].attack=ALLY_ATTACK_INTERVALS.frog;g.update(.1);assert.ok(Math.abs(g.allies[0].attack-1.18)<1e-8);
 award(g,'icecraft');const e=enemy(g,2);g.use('freeze',500,390);assert.equal(e.frozen,6);g.damage([e],2,'electric',500,390);assert.ok(Math.abs(e.hp-7.7)<1e-8);
});
test('a chain rewards only 12, 24 and 36 kills, then expires without pausing exploits',()=>{
 const g=setup(3);g.cooldowns.electric=5;
 for(let i=0;i<48;i++){const e=enemy(g,0,5);g.damage([e],1,'net',500,390);}
 assert.equal(g.streak,48);assert.equal(g.bestStreak,48);assert.equal(g.score,48+45);assert.equal(g.cooldowns.electric,2);
 assert.equal(g.drainEvents().filter(e=>e.type==='streakReward').length,3);
 g.status='paused';g.update(.1);assert.equal(g.streak,48);
 g.status='playing';g.elapsed+=4.1;g.update(.01);assert.equal(g.streak,0);
 const e=enemy(g,0,5);g.damage([e],1,'net',500,390);assert.equal(g.streak,1);assert.equal(g.streakRewards,0);
});
test('ward rescues exactly once per run and then permits a normal defeat',()=>{
 const g=setup(8);award(g,'ward');for(let i=0;i<3;i++)enemy(g,4);
 g.danger=4.99;g.update(.02);assert.equal(g.status,'playing');assert.equal(g.danger,0);assert.equal(g.wardSpent,true);assert.ok(g.enemies.every(e=>e.frozen===3));
 g.danger=4.99;g.update(.02);assert.equal(g.status,'lost');assert.equal(g.drainEvents().filter(e=>e.type==='ward').length,1);
 g.start();assert.equal(g.wardSpent,false);assert.equal(g.upgrades.ward,undefined);
});
test('boss gets one warning six seconds before W8 and the next one before W12',()=>{
 const g=setup(7);g.elapsed=7*WAVE_SECONDS-6.1;g.update(.1);g.update(.1);
 assert.equal(g.drainEvents().filter(e=>e.type==='bossWarning').length,1);
 g.level=11;g.elapsed=11*WAVE_SECONDS-6.1;g.update(.1);
 assert.equal(g.drainEvents().find(e=>e.type==='bossWarning')?.level,12);
});
