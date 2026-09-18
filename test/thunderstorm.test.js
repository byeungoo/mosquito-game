import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame } from '../src/core.js';

test('storm unlocks at W11, hits all corners and both life stages, then blocks reuse', () => {
  const game = new PondGame(); game.start(); game.enemies = []; game.level = 10;
  assert.equal(game.use('thunderstorm', 0, 0).reason, 'locked');
  game.level = 11;
  const larva = game.spawn(5,0), adult = game.spawn(20,3), queen = game.spawn(20,4);
  Object.assign(larva,{x:40,y:160}); Object.assign(adult,{x:960,y:640}); Object.assign(queen,{x:950,y:160});
  assert.equal(game.use('thunderstorm',0,0).count,2);
  assert.deepEqual(game.enemies.map(e=>e.id),[queen.id]); assert.equal(queen.hp,41);
  assert.equal(game.cooldowns.thunderstorm,45);
  assert.equal(game.use('thunderstorm',500,390).reason,'cooldown');
  assert.equal(queen.hp,41);
  assert.equal(game.drainEvents().find(e=>e.type==='thunderstorm').strikes.length,3);
});

test('storm receives frozen damage bonus and does not damage allies', () => {
  const game = new PondGame(); game.start(); game.enemies=[]; game.level=11;
  const queen=game.spawn(20,4); queen.frozen=2;
  game.use('loach',500,390);
  game.use('thunderstorm',500,390);
  assert.equal(queen.hp,29); assert.equal(game.allies.length,1);
});
