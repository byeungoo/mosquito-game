import test from 'node:test';
import assert from 'node:assert/strict';
import { koreanDate, dailyChallenge, seededRandom, saveDailyRecord } from '../src/daily.js';
import { PondGame } from '../src/core.js';
test('daily challenge rolls over at Korean midnight, regardless of browser timezone',()=>{
 assert.equal(koreanDate(new Date('2026-09-19T14:59:59Z')),'2026-09-19');
 assert.equal(koreanDate(new Date('2026-09-19T15:00:00Z')),'2026-09-20');
 assert.notEqual(dailyChallenge('2026-09-19').upgrade,dailyChallenge('2026-09-20').upgrade);
});
test('same daily seed gives the same starting pond and upgrade options on retry',()=>{
 const seed=dailyChallenge('2026-09-19').seed;
 const run=()=>{const g=new PondGame();g.random=seededRandom(seed);g.start();g.elapsed=21.95;g.update(.05);return {enemies:g.enemies,offers:g.upgradeOffer};};
 assert.deepEqual(run(),run());
 const a=seededRandom(seed),b=seededRandom('another-day');assert.notEqual(a(),b());
 for(let i=0;i<1000;i++){const n=a();assert.ok(n>=0 && n<1);}
});
test('daily records preserve personal bests, sanitize corrupt storage, and retain only 14 days',()=>{
 let records={'bad':{score:999,level:1},'2026-01-01':null};
 for(let day=1;day<=20;day++)records=saveDailyRecord(records,`2026-09-${String(day).padStart(2,'0')}`,{score:100,level:4});
 assert.equal(Object.keys(records).length,14);assert.equal(records.bad,undefined);assert.equal(records['2026-09-01'],undefined);
 records=saveDailyRecord(records,'2026-09-20',{score:50,level:5});assert.deepEqual(records['2026-09-20'],{score:100,level:5});
 records=saveDailyRecord(records,'2026-09-20',{score:150,level:2});assert.deepEqual(records['2026-09-20'],{score:150,level:5});
});
