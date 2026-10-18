import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PlanHistory,HISTORY_LIMITS} from '../dist/history.js';
test('snapshots undo/redo independently; equal edits preserve redo',()=>{
 const h=new PlanHistory();h.record('a','0','1','cell');h.record('a','1','2','delete row');h.record('b','x','y','column reorder');
 assert.deepEqual(h.peek('a','undo'),{snapshot:'1',label:'delete row'});h.accept('a','undo');
 assert.equal(h.peek('a','redo').snapshot,'2');h.record('a','1','1','no-op');assert.equal(h.view('a').redo,'delete row');
 assert.equal(h.peek('b','undo').snapshot,'x');h.record('a','1','3','cell');assert.equal(h.peek('a','redo'),null);
});
test('20 combined actions; moving between stacks never increases memory',()=>{
 const h=new PlanHistory();for(let i=0;i<25;i++)h.record('a',String(i),String(i+1),'edit');
 const bytes=h.bytes;let count=0;while(h.peek('a','undo')){h.accept('a','undo');count++;assert.equal(h.bytes,bytes);}
 assert.equal(count,HISTORY_LIMITS.actions);assert.equal(h.peek('a','redo').snapshot,'6');
});
test('shared budget evicts chain ends, oversized change is a boundary',()=>{
 const h=new PlanHistory({bytes:600});h.record('a','0','1','a');h.record('a','1','2','b');h.accept('a','undo');h.accept('a','undo');
 h.record('b','x','y','c');assert.ok(h.bytes<=600);assert.equal(h.peek('a','redo').snapshot,'1');
 h.record('a','1','z'.repeat(1000),'large');assert.equal(h.peek('a','undo'),null);assert.equal(h.peek('a','redo'),null);assert.ok(h.bytes<=600);
});
test('successful boundaries, deleted plans and reload clear history',()=>{
 const h=new PlanHistory();h.record('a','0','1','edit');h.record('b','0','1','edit');h.clear('a');assert.equal(h.view('a').undo,'');
 h.retain(['a']);assert.equal(h.bytes,0);h.record('a','0','1','edit');h.clear();assert.equal(h.bytes,0);assert.equal(new PlanHistory().peek('a','undo'),null);
});
