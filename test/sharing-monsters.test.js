import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame, EVOLUTIONS } from '../src/core.js';
import { SPECIES } from '../src/monsters.js';
import { shareDetails } from '../src/share.js';

test('sharing preserves GitHub Pages subpaths and strips temporary URL state', () => {
  assert.deepEqual(shareDetails('https://example.github.io/mosquito/?debug=1#game'), {
    url: 'https://example.github.io/mosquito/', local: false,
  });
  for (const host of ['localhost', '127.0.0.1', '[::1]']) assert.equal(shareDetails(`http://${host}:4173/`).local, true);
});

test('spawn mixes unlocked species without changing evolution strength', () => {
  for (const level of [1,2,3,4,5,6,10,16,20,40]) {
    const game = new PondGame(); game.start(); game.level = level;
    const spawned = Array.from({length:32}, () => game.spawn(20, 2));
    const expected = SPECIES.filter(s => !s.boss && s.wave <= level).map(s => s.id).sort();
    assert.deepEqual([...new Set(spawned.map(e => e.species))].sort(), expected);
    assert.ok(spawned.every(e => e.hp === EVOLUTIONS[2].hp && e.rank === 2));
  }
});
