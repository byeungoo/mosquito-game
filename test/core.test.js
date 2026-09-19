import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame, stageOf, pondPoint, WEAPONS, EVOLUTIONS, WAVE_SECONDS, spawnRateForLevel } from '../src/core.js';

function setup(level = 1) {
  const g = new PondGame(() => .5); g.start(); g.enemies = []; g.spawnTimer = Infinity;
  g.level = level; g.elapsed = (level - 1) * WAVE_SECONDS; return g;
}
function enemy(g, x, y, age = 10, rank = 0) { const e = g.spawn(age, rank); Object.assign(e, { x, y, angle: 0, turn: 100 }); return e; }
function advance(g, seconds) { for (let i = 0; i < Math.ceil(seconds * 10); i++) g.update(.1); }

test('all but two starting weapons are locked in the actual simulation', () => {
  const g = setup(); assert.deepEqual(WEAPONS.filter(w => g.isUnlocked(w.id)).map(w => w.id), ['net', 'loach']);
  for (const w of WEAPONS.filter(w => w.unlock > 1)) {
    assert.equal(g.use(w.id, 500, 390).reason, 'locked'); assert.equal(g.cooldowns[w.id], 0);
  }
});
test('wave progression unlocks each skill only at its declared threshold', () => {
  for (const w of WEAPONS.filter(w => w.unlock > 1)) {
    const g = setup(w.unlock - 1); g.elapsed = (w.unlock - 1) * WAVE_SECONDS - .1;
    assert.equal(g.isUnlocked(w.id), false); g.update(.1);
    assert.equal(g.isUnlocked(w.id), true); assert.equal(g.level, w.unlock);
    const event = g.drainEvents().find(e => e.type === 'wave'); assert.ok(event.unlocked.includes(w.id));
  }
});
test('life stages hatch into adults with their actual health', () => {
  const g = setup(), e = enemy(g, 500, 390, 0);
  assert.equal(stageOf(e), 'egg'); advance(g, 4.1); assert.equal(stageOf(e), 'larva');
  advance(g, 11); assert.equal(stageOf(e), 'pupa'); advance(g, 5); assert.equal(stageOf(e), 'adult');
  assert.equal(e.hp, 2); assert.equal(g.drainEvents().filter(e => e.type === 'hatch').length, 1);
});
test('net kills larvae once, ordinary adults twice, and respects cooldown', () => {
  const g = setup(); enemy(g, 500, 390); const adult = enemy(g, 501, 390, 20);
  assert.equal(g.use('net', 500, 390).count, 1); assert.equal(adult.hp, 1);
  assert.equal(g.use('net', 500, 390).reason, 'cooldown');
  advance(g, .5); assert.equal(g.use('net', adult.x, adult.y).count, 1); assert.equal(g.kills, 2);
});
test('evolution takes fifteen seconds and preserves damage ratio', () => {
  const g = setup(6), e = enemy(g, 500, 390, 20); e.hp = 1;
  advance(g, 12.1); assert.equal(e.rank, 0); assert.equal(e.hp, 1);
  advance(g, 3); assert.equal(e.rank, 1); assert.equal(e.hp, 2.5); assert.equal(g.threat, 2);
  advance(g, 15.1); assert.equal(e.rank, 2); assert.equal(e.hp, 5.5);
  g.enemies = [e]; advance(g, 15.1); assert.equal(e.rank, 3); assert.equal(e.hp, 10);
});
test('natural queens cannot appear before wave eight or instantly on its threshold', () => {
  const g=setup(7), e=enemy(g,500,390,20,3); e.evolve=14.9;
  advance(g,21); assert.equal(e.rank,3); assert.equal(e.evolve,0);
  advance(g,1.2); assert.equal(g.level,8); assert.equal(e.rank,3); assert.ok(e.evolve<1);
});
test('electricity chains beyond the initial radius but does not one-shot armored enemies', () => {
  const g = setup(2); enemy(g, 510, 390); enemy(g, 605, 390); enemy(g, 700, 390); const armor = enemy(g, 720, 390, 20, 2);
  assert.equal(g.use('electric', 500, 390).count, 3); assert.equal(armor.hp, 8); assert.equal(g.enemies.length, 1);
});
test('electric chains have a hard limit of sixteen targets', () => {
  const g = setup(2); for (let i=0;i<25;i++) enemy(g,500+i,390);
  assert.equal(g.use('electric',500,390).count,16); assert.equal(g.enemies.length,9);
});
test('flame affects adults and larvae, overheats, and cools back into service', () => {
  const g = setup(3); const adult = enemy(g, 500, 390, 20); const larva = enemy(g, 500, 390, 5);
  g.use('flame',500,390); assert.equal(adult.hp,1); assert.equal(larva.hp,0);
  for(let i=0;i<16;i++){advance(g,.2);g.use('flame',500,390);}
  assert.equal(g.overheated,true);advance(g,.2);assert.equal(g.use('flame',500,390).reason,'overheated');
  advance(g,4);assert.equal(g.overheated,false);assert.equal(g.use('flame',500,390).ok,true);
});
test('freezing halts growth and evolution, and amplifies follow-up damage', () => {
  const g=setup(6), e=enemy(g,500,390,20,2);g.use('freeze',500,390);
  advance(g,4);assert.equal(e.age,20);assert.equal(e.evolve,0);assert.equal(e.x,500);
  g.use('electric',500,390);assert.equal(e.hp,6.5);
  advance(g,2);assert.ok(e.age>20);
});
test('queens resist freezing and survive a lone palm hit', () => {
  const g=setup(7),e=enemy(g,500,390,20,4);g.use('freeze',500,390);assert.equal(e.frozen,2.5);
  assert.equal(g.use('palm',500,390).count,0);assert.equal(e.hp,65-18*1.5);
});
test('vortex pulls both aquatic and airborne enemies without killing them', () => {
  const g=setup(4),larva=enemy(g,650,390,10),adult=enemy(g,650,400,20);g.use('vortex',500,390);advance(g,1);
  assert.ok(Math.hypot(larva.x-500,larva.y-390)<100);assert.ok(Math.hypot(adult.x-500,adult.y-390)<140);assert.equal(g.kills,0);
});
test('allies attack nearby prey; ten loaches and ten frogs are allowed', () => {
  const g=setup(5);g.use('loach',500,390);g.use('frog',500,390);enemy(g,510,390,5);const adult=enemy(g,530,390,20,1);advance(g,1);
  assert.equal(g.kills,1);assert.equal(adult.hp,2);
  for(let i=0;i<9;i++){g.cooldowns.loach=0;assert.equal(g.use('loach',500,390).ok,true);}
  assert.equal(g.allies.filter(a=>a.type==='loach').length,10);
  g.cooldowns.loach=0;const blocked=g.use('loach',500,390);assert.equal(blocked.reason,'limit');assert.equal(blocked.limit,10);
  for(let i=0;i<9;i++){g.cooldowns.frog=0;assert.equal(g.use('frog',500,390).ok,true);}
  assert.equal(g.allies.filter(a=>a.type==='frog').length,10);
  g.cooldowns.frog=0;const blockedFrog=g.use('frog',500,390);assert.equal(blockedFrog.reason,'limit');assert.equal(blockedFrog.limit,10);
});
test('dragon crosses the entire field at the targeted height', () => {
  const g=setup(8);enemy(g,100,390,20,3);enemy(g,900,390,20,3);enemy(g,500,180,20,3);
  assert.equal(g.use('dragon',500,390).count,2);assert.equal(g.enemies.length,1);
});
test('blackhole delays its damage until compression finishes', () => {
  const g=setup(9),e=enemy(g,500,390,20,3);e.frozen=5;g.use('blackhole',500,390);
  advance(g,2);assert.equal(g.kills,0);advance(g,1.1);assert.equal(g.kills,1);assert.ok(g.drainEvents().some(e=>e.type==='detonate'));
});
test('five staggered meteors stack damage on a frozen queen', () => {
  const g=setup(10),e=enemy(g,500,390,20,4);e.frozen=5;g.use('meteor',500,390);
  advance(g,.5);assert.equal(g.kills,0);advance(g,1.6);assert.equal(g.bossKills,1);assert.equal(g.score,100);
  assert.equal(g.drainEvents().filter(e=>e.type==='detonate').length,5);
});
test('queen and reaper breed new larvae; later waves bring a queen', () => {
  const g=setup(6);enemy(g,500,390,20,4);enemy(g,500,390,20,3);advance(g,7.1);
  assert.equal(g.enemies.length,2);advance(g,1.5);
  assert.equal(g.enemies.filter(e=>stageOf(e)!=='adult').length,6);
  const h=setup(5);h.elapsed=110-.1;h.update(.1);assert.equal(h.enemies.some(e=>e.rank===4),false);assert.equal(h.drainEvents().some(e=>e.type==='boss'),false);
  const late=setup(7);late.elapsed=154-.1;late.update(.1);assert.ok(late.enemies.some(e=>e.rank===4));assert.ok(late.drainEvents().some(e=>e.type==='boss'));
});
test('early and middle waves have a steady increase in encounter rate', () => {
  const rates=Array.from({length:8},(_,i)=>spawnRateForLevel(i+1));
  for(let i=1;i<rates.length;i++)assert.ok(rates[i]>rates[i-1]&&rates[i]/rates[i-1]<1.35);
  assert.ok(rates[5]>4.4&&rates[5]<4.6);
});
test('weighted threat loses with three queens, even though only three adults exist', () => {
  const g=setup();for(let i=0;i<3;i++)enemy(g,500,390,20,4);
  assert.equal(g.adults,3);assert.equal(g.threat,30);advance(g,5.1);assert.equal(g.status,'lost');
  assert.equal(g.drainEvents().filter(e=>e.type==='end').length,1);advance(g,3);assert.equal(g.drainEvents().length,0);
});
test('lowering threat gradually recovers accumulated danger', () => {
  const g=setup();for(let i=0;i<3;i++)enemy(g,500,390,20,4);advance(g,3);assert.ok(g.danger>2.9);
  g.enemies.pop();advance(g,.5);assert.ok(g.danger>1.9&&g.danger<2.1);advance(g,1.2);assert.equal(g.danger,0);
});
test('survival continues beyond ninety seconds with no victory condition', () => {
  const g=setup();for(let i=0;i<1000;i++){g.enemies=[];g.update(.1);}
  assert.equal(g.status,'playing');assert.ok(g.elapsed>99);assert.equal(g.level,5);assert.equal(g.drainEvents().filter(e=>e.type==='end').length,0);
});
test('pause freezes progress, and restart resets unlocks and fields', () => {
  const g=setup(9);g.use('blackhole',500,390);g.status='paused';const t=g.elapsed;advance(g,5);assert.equal(g.elapsed,t);assert.equal(g.fields[0].remaining,3);
  g.start();assert.equal(g.level,1);assert.equal(g.fields.length,0);assert.equal(g.cooldowns.blackhole,0);assert.equal(g.isUnlocked('blackhole'),false);assert.equal(g.score,0);
});
test('deployments outside water are clamped into the pond', () => {
  const g=setup();g.use('loach',-500,-500);const a=g.allies[0];assert.deepEqual({x:a.x,y:a.y},pondPoint(-500,-500));
});
test('spawn cap bounds work and all evolution types have increasing threat', () => {
  const g=setup();for(let i=0;i<300;i++)g.spawn();assert.equal(g.enemies.length,240);
  for(let i=1;i<EVOLUTIONS.length;i++)assert.ok(EVOLUTIONS[i].hp>EVOLUTIONS[i-1].hp&&EVOLUTIONS[i].threat>EVOLUTIONS[i-1].threat);
});

test('electric starts farther away and jumps across a wider gap', () => {
  const g=setup(2);enemy(g,660,390,20);enemy(g,800,390,20);enemy(g,950,390,20);
  assert.equal(g.use('electric',500,390).count,2);assert.equal(g.enemies[0].x,950);
});
test('expanded flame hits a distant adult but excludes targets outside its radius', () => {
  const g=setup(3), near=enemy(g,650,390,20), far=enemy(g,665,390,20);
  g.use('flame',500,390);assert.equal(near.hp,1);assert.equal(far.hp,2);
});
test('frog can attack twice within two seconds', () => {
  const g=setup(5);g.use('frog',500,390);const e=enemy(g,520,390,20,2);e.frozen=10;
  advance(g,1.9);assert.equal(g.drainEvents().filter(e=>e.type==='tongue').length,2);assert.equal(e.hp,2);
});
test('chorus pulses four times, pushes targets, and then expires', () => {
  const g=setup(4),e=enemy(g,510,390,20,4);e.frozen=10;g.use('chorus',500,390);
  advance(g,4.1);assert.equal(g.drainEvents().filter(e=>e.type==='sonic').length,4);assert.equal(e.hp,53);assert.ok(e.x>530);assert.equal(g.fields.length,0);
});
test('rewind reduces evolution and threat, preserves damage, and gives no kill credit', () => {
  const g=setup(5),ordinary=enemy(g,490,390,20),mutant=enemy(g,510,390,20,2),pupa=enemy(g,500,400,18);
  mutant.hp=5.5;g.use('rewind',500,390);
  assert.equal(stageOf(ordinary),'larva');assert.equal(mutant.rank,1);assert.equal(mutant.hp,2.5);assert.equal(stageOf(pupa),'larva');assert.equal(g.threat,2);assert.equal(g.kills,0);assert.equal(g.score,0);
});
test('rewind briefly freezes queens without removing their rank or health', () => {
  const g=setup(8),queen=enemy(g,500,390,20,4);g.use('rewind',500,390);
  assert.equal(queen.rank,4);assert.equal(queen.hp,65);assert.equal(queen.frozen,2.5);
});
test('seals explode from kills and chain across enemies without duplicate score', () => {
  const g=setup(7);enemy(g,500,390,5);enemy(g,610,390,20,1);enemy(g,720,390,20,1);enemy(g,900,390,5);
  g.use('talisman',610,390);assert.equal(g.kills,0);
  g.use('net',500,390);assert.equal(g.kills,3);assert.equal(g.score,11);assert.equal(g.enemies.length,1);
  assert.equal(g.drainEvents().filter(e=>e.type==='sealBurst').length,3);
});
test('expired seals do not explode', () => {
  const g=setup(7),e=enemy(g,500,390,5);g.use('talisman',500,390);e.frozen=20;
  advance(g,12.1);assert.equal(e.sealed,0);g.use('net',500,390);assert.equal(g.drainEvents().filter(e=>e.type==='sealBurst').length,0);
});
test('larvae reflect away from the bank instead of repeatedly rotating', () => {
  for (const [x,y,angle] of [[917,390,0],[500,639,Math.PI/2],[83,390,Math.PI],[500,141,-Math.PI/2]]) {
    const g=setup(),e=enemy(g,x,y,6);e.angle=angle;advance(g,.2);
    const heading=e.angle;advance(g,1.5);
    assert.ok(Math.abs(e.angle-heading)<.001);assert.ok(Math.hypot((e.x-500)/440,(e.y-390)/263)<.95);
  }
});
test('ten loaches separate even when placed at the identical point', () => {
  const g=setup();for(let i=0;i<10;i++){g.cooldowns.loach=0;g.use('loach',500,390);}
  advance(g,1);
  for(let i=0;i<g.allies.length;i++)for(let j=i+1;j<g.allies.length;j++)assert.ok(Math.hypot(g.allies[i].x-g.allies[j].x,g.allies[i].y-g.allies[j].y)>24);
});
test('loaches split available prey and retain different targets across updates', () => {
  const g=setup();for(let i=0;i<3;i++){g.cooldowns.loach=0;g.use('loach',500,390);}
  for(let i=0;i<3;i++)enemy(g,720+i*12,390+i*12,8);
  g.update(.1);const targets=g.allies.map(a=>a.targetId);assert.equal(new Set(targets).size,3);assert.ok(targets.every(Boolean));
  g.update(.1);assert.deepEqual(g.allies.map(a=>a.targetId),targets);
});
