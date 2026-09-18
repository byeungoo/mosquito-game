import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame } from '../src/core.js';

function setup() {
  const g = new PondGame(() => .5); g.start(); g.level = 3; g.enemies = []; g.spawnTimer = Infinity;
  const target = g.spawn(20,4); Object.assign(target,{x:500,y:390});
  return {g,target};
}
test('holding flame deals 16 damage per second at 30, 60 and 120 fps', () => {
  for (const fps of [30,60,120]) {
    const {g,target}=setup();
    for(let i=0;i<fps;i++)g.sustainFlame(1/fps,500,390);
    assert.ok(Math.abs(target.hp-49)<1e-8);
    assert.ok(Math.abs(g.heat-25)<1e-8);
  }
});
test('held flame hits newly entering adults and stops outside range, when locked or paused', () => {
  const {g,target}=setup(); target.x=700;
  const larva=g.spawn(10,0);Object.assign(larva,{x:500,y:390});
  g.sustainFlame(.1,500,390);assert.equal(target.hp,65);
  target.x=500;g.sustainFlame(.1,500,390);assert.equal(target.hp,63.4);assert.equal(larva.hp,1);
  g.status='paused';assert.equal(g.sustainFlame(.1,500,390).reason,'paused');assert.equal(target.hp,63.4);
  g.status='playing';g.level=2;assert.equal(g.sustainFlame(.1,500,390).reason,'locked');assert.equal(target.hp,63.4);
});
test('four seconds of flame overheats, blocks damage, and recovers after releasing', () => {
  const {g,target}=setup(); target.hp=1000;
  for(let i=0;i<40;i++)g.sustainFlame(.1,500,390);
  assert.equal(g.overheated,true);assert.equal(g.heat,100);
  const hp=target.hp;assert.equal(g.sustainFlame(.1,500,390).reason,'overheated');assert.equal(target.hp,hp);
  for(let i=0;i<40;i++)g.update(.1);
  assert.equal(g.overheated,false);assert.equal(target.hp,hp);
});
