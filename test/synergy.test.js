import test from 'node:test';
import assert from 'node:assert/strict';
import { PondGame } from '../src/core.js';
function setup(){const g=new PondGame(()=>.5);g.start();g.level=11;g.enemies=[];return g;}
function target(g,x=500){const e=g.spawn(20,4);Object.assign(e,{x,y:390});return e;}
test('active vortex boosts lightning only inside its field, never stacks overlapping fields',()=>{
 const g=setup(),a=target(g),b=target(g,850);g.fields=[{type:'vortex',x:500,y:390,radius:205,remaining:3},{type:'vortex',x:500,y:390,radius:205,remaining:2}];
 g.damage([a,b],3,'electric',500,390);assert.equal(a.hp,61.25);assert.equal(b.hp,62);
 g.damage([a],3,'flame',500,390);assert.equal(a.hp,58.25);
 g.fields.forEach(f=>f.remaining=0);g.damage([a],3,'electric',500,390);assert.equal(a.hp,55.25);
});
test('freeze and conducting combo stack with bounded feedback during continuous hits',()=>{
 const g=setup(),a=target(g);a.frozen=5;g.fields=[{type:'vortex',x:500,y:390,radius:205,remaining:3}];
 g.damage([a],24,'thunderstorm',500,390);assert.equal(a.hp,20);
 for(let i=0;i<20;i++)g.damage([a],.01,'flame',500,390);
 const combos=g.drainEvents().filter(e=>e.type==='combo');assert.equal(combos.length,2);
 g.elapsed=1;g.damage([a],1,'net',500,390);assert.equal(g.drainEvents().filter(e=>e.type==='combo').length,1);
});
