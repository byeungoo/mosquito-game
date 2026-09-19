import test from 'node:test';
import assert from 'node:assert/strict';
import {PondGame,allyGrowth,WAVE_SECONDS,spawnRateForLevel} from '../src/core.js';
import {offerUpgrades} from '../src/upgrades.js';
function setup(level=18){const g=new PondGame(()=>.5);g.start();g.level=level;g.elapsed=(level-1)*WAVE_SECONDS;g.enemies=[];g.spawnTimer=Infinity;return g;}
function enemy(g,age=5,hp=1,x=500){const e=g.spawn(age,0);Object.assign(e,{x,y:390,hp,maxHp:hp,frozen:100});return e;}
function ally(g,type,eaten=0){g.cooldowns[type]=0;g.use(type,500,390);const a=g.allies.at(-1);Object.assign(a,{eaten,attack:0});return a;}
test('feeding evolves each individual at 90, 300 and 750 kills, and resets each run',()=>{
 const g=setup(),a=ally(g,'loach',89),b=ally(g,'loach');b.attack=100;
 enemy(g);g.update(.01);assert.equal(a.eaten,90);assert.equal(b.eaten,0);assert.equal(allyGrowth(a),1);
 assert.equal(g.drainEvents().filter(e=>e.type==='allyEvolve').length,1);
 for(const [eaten,stage] of [[30,0],[89,0],[90,1],[299,1],[300,2],[749,2],[750,3],[1000,3]])assert.equal(allyGrowth({eaten}),stage);
 g.start();assert.equal(g.allies.length,0);
});
test('fire-breathing loaches attack aquatic and flying targets, with a real cooldown',()=>{
 const g=setup(),a=ally(g,'loach',300);a.attack=100;
 enemy(g,5,20,540);enemy(g,20,20,540);g.update(.01);
 assert.ok(g.enemies.every(e=>e.hp<20));assert.equal(g.drainEvents().filter(e=>e.type==='allyBreath').length,1);
 const hp=g.enemies.map(e=>e.hp);g.update(.1);assert.deepEqual(g.enemies.map(e=>e.hp),hp);
 g.status='paused';const breath=a.breath;g.update(.1);assert.equal(a.breath,breath);
});
test('frog evolution changes single, triple and five-target hunting',()=>{
 for(const [food,count] of [[0,1],[300,3],[750,5]]){const g=setup();ally(g,'frog',food);for(let i=0;i<6;i++)enemy(g);g.update(.01);assert.equal(g.kills,count);assert.equal(g.drainEvents().filter(e=>e.type==='tongue').length,count);}
});
test('transcendent ranks unlock at W12 and W18 even for injected choices',()=>{
 const g=setup(11);g.upgrades.skill_net=3;g.upgradeOffer=['skill_net'];assert.equal(g.chooseUpgrade('skill_net'),false);
 assert.ok(!offerUpgrades(11,g.upgrades,()=>.5).includes('skill_net'));
 g.level=12;assert.equal(g.chooseUpgrade('skill_net'),true);g.upgradeOffer=['skill_net'];g.level=17;assert.equal(g.chooseUpgrade('skill_net'),false);
 g.level=18;assert.equal(g.chooseUpgrade('skill_net'),true);assert.equal(g.skillRank('net'),5);
});
test('late pressure increases gradually and the pond fortifies without a victory timer',()=>{
 let previous=spawnRateForLevel(6);for(let wave=7;wave<=100;wave++){const rate=spawnRateForLevel(wave);assert.ok(rate>previous&&rate-previous<.5&&rate<14);previous=rate;}
 const g=setup(11);assert.equal(g.threatLimit,30);g.level=12;assert.equal(g.threatLimit,33);g.level=28;assert.equal(g.threatLimit,45);g.level=100;g.elapsed=99*WAVE_SECONDS;g.update(.1);assert.equal(g.status,'playing');assert.equal(g.threatLimit,45);
});
test('new fields damage both life stages, expire and stop while paused',()=>{
 for(const id of ['sanctuary','orbital']){const g=setup();const aquatic=enemy(g,5,1000),flying=enemy(g,20,1000);g.use(id,500,390);g.update(.1);assert.ok(aquatic.hp<1000&&flying.hp<1000);const hp=flying.hp;
 g.status='paused';g.update(.1);assert.equal(flying.hp,hp);g.status='playing';for(let i=0;i<51;i++)g.update(.1);assert.equal(g.fields.length,0);assert.ok(flying.hp<hp);g.start();assert.equal(g.fields.length,0);}
});
test('sanctuary offsets danger and overlapping fields do not multiply recovery',()=>{
 for(const count of [1,2]){const g=setup();for(let i=0;i<40;i++)enemy(g,20,1000,900);g.danger=4;for(let i=0;i<count;i++){g.cooldowns.sanctuary=0;g.use('sanctuary',300,390);}g.update(.1);assert.ok(Math.abs(g.danger-4.06)<1e-8);}
});
test('orbital hits every corner and new arrivals regardless of cast position',()=>{
 const g=setup();const targets=[];
 for(const [x,y,age] of [[40,160,20],[960,160,20],[40,640,5],[960,640,5]]){const e=enemy(g,age,1000,x);e.y=y;targets.push(e);}
 g.use('orbital',0,0);g.update(.01);assert.ok(targets.every(e=>e.hp===995.5));
 const newcomer=enemy(g,20,1000,950);for(let i=0;i<3;i++)g.update(.1);assert.ok(newcomer.hp<1000);
 for(let i=0;i<51;i++)g.update(.1);const hp=newcomer.hp;g.update(.1);assert.equal(newcomer.hp,hp);
});
