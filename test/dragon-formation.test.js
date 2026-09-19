import test from 'node:test';
import assert from 'node:assert/strict';
import { dragonFormation } from '../src/spectacle.js';
test('dragon summon gains one distinct dragon at each mastery rank',()=>{
 for(let rank=0;rank<=5;rank++){
   const formation=dragonFormation(rank);
   assert.equal(formation.length,rank+1);
   assert.equal(new Set(formation.map(d=>d.offset)).size,rank+1);
   assert.equal(new Set(formation.map(d=>d.delay)).size,rank+1);
   assert.ok(formation.every(d=>Math.abs(d.offset)<=95 && d.delay<=.225));
 }
 assert.equal(dragonFormation(-1).length,1);assert.equal(dragonFormation(99).length,6);
});
