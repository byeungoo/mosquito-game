import test from 'node:test';
import assert from 'node:assert/strict';
import { newAchievements } from '../src/achievements.js';
test('medals unlock only at their threshold and earned medals never trigger twice',()=>{
 const g={kills:99,bestStreak:23,bossKills:0,level:4,allies:[]};assert.deepEqual(newAchievements(g,'endless',[]),[]);
 g.kills=100;g.bestStreak=24;g.level=5;
 assert.deepEqual(newAchievements(g,'endless',[]).map(a=>a.id),['hunter','chain']);
 assert.deepEqual(newAchievements(g,'daily',['hunter','chain']).map(a=>a.id),['daily']);
 g.bossKills=1;g.level=10;g.allies=Array(10).fill({});
 assert.deepEqual(newAchievements(g,'endless',['hunter','chain']).map(a=>a.id),['queen','wave','squad']);
});
