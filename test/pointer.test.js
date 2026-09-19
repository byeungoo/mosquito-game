import test from 'node:test';
import assert from 'node:assert/strict';
import { bindPondPointer } from '../src/pointer.js';
function setup() {
  const handlers={}, captures=new Set(), pointer={down:false,inside:false};let attacks=0,playing=true;
  const canvas={addEventListener:(name,fn)=>handlers[name]=fn,getBoundingClientRect:()=>({left:10,top:20,width:200,height:140}),setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id),focus:()=>{}};
  const input=bindPondPointer(canvas,pointer,{canAttack:()=>playing,attack:()=>attacks++});
  const send=(name,id,x=110,y=90,type='touch')=>handlers[name]({pointerId:id,button:0,clientX:x,clientY:y,pointerType:type,preventDefault(){}});
  return {pointer,input,send,captures,get attacks(){return attacks;},pause:()=>playing=false};
}
test('second finger cannot hijack aim or release the first held attack',()=>{
  const s=setup();s.send('pointerdown',1);s.send('pointerdown',2,210,160);s.send('pointermove',2,210,160);s.send('pointerup',2);
  assert.equal(s.attacks,1);assert.equal(s.pointer.down,true);assert.equal(s.pointer.x,500);assert.equal(s.pointer.y,350);
  s.send('pointermove',1,50,48);assert.equal(s.pointer.x,200);assert.equal(s.pointer.y,140);
  s.send('pointerup',1);assert.equal(s.pointer.down,false);assert.equal(s.captures.size,0);
});
test('pause, weapon changes, and lost capture release ownership for the next attack',()=>{
  const s=setup();s.send('pointerdown',1);s.input.cancel();assert.equal(s.pointer.down,false);assert.equal(s.captures.size,0);
  s.send('pointerdown',2);s.send('lostpointercapture',2);assert.equal(s.pointer.down,false);
  s.send('pointerdown',3);s.send('pointercancel',3);s.pause();s.send('pointerdown',4);assert.equal(s.attacks,3);
});
test('captured aiming stays inside the world even when dragged off the canvas',()=>{
  const s=setup();s.send('pointerdown',1);s.send('pointermove',1,-100,500);assert.equal(s.pointer.x,0);assert.equal(s.pointer.y,700);
});
