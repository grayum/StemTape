import test from 'node:test';
import assert from 'node:assert/strict';
import {column,createEvent,initialState,validateEvent,serializeState,parseState,clone,exportCSV,importCSV} from '../dist/core.js';
import {ALIGNMENTS,effectiveAlignment,alignedCell} from '../dist/alignment.js';
import {moveColumn} from '../dist/columns.js';
import {showNoteColumn} from '../dist/note-column.js';
import {presetChange} from '../dist/preset-actions.js';
import {PlanHistory} from '../dist/history.js';
test('Auto defaults preserve numeric/text anchors; legacy explicit choices survive byte-stably',()=>{
 for(const type of ['text','number','distance','symbol']){const c=column('Test',type);assert.equal(c.align,'auto');assert.equal(effectiveAlignment(c),['number','distance'].includes(type)?'right':'left');}
 const e=createEvent();e.columns[0].align='right';e.columns[1].align='left';assert.deepEqual(validateEvent(e),e);
 for(const value of ['auto','left','center','right']){e.columns[0].align=value;assert.equal(validateEvent(e).columns[0].align,value);}
 delete e.columns[0].align;assert.equal(validateEvent(e).columns[0].align,'auto');
 for(const value of ['justify','url(x)','CENTER',null,0]){e.columns[0].align=value;assert.throws(()=>validateEvent(e),/alignment/);}
});
test('every supported data type validates each explicit choice without changing editor values',()=>{
 for(const type of ['text','number','distance','symbol'])for(const [value]of ALIGNMENTS){
  const e=createEvent(),c=column('Extra',type,20);c.align=value;e.columns.push(c);for(const rows of Object.values(e.rows))for(const r of rows)r.cells[c.id]=['number','distance'].includes(type)?123:'Text ☕';
  const before=clone(e.rows);assert.equal(validateEvent(e).columns.at(-1).align,value);assert.deepEqual(e.rows,before);
 }
});
test('complete content group respects left, centre, right and padding',()=>{
 for(const [alignment,expected]of [['left',1],['center',5],['right',9]]){
  const g=alignedCell({left:0,width:20,padding:1,reserve:4,textWidth:6,alignment});assert.equal(g.iconX,expected);assert.equal(g.textX,expected+4+(alignment==='center'?3:alignment==='right'?6:0));
 }
});
test('alignment follows column identity through reorder, Note hiding, type/rename and history',()=>{
 const e=createEvent();showNoteColumn(e,true);const note=e.columns.find(c=>c.id===e.noteColumnId);note.align='center';note.label='Location';const before=JSON.stringify(e);moveColumn(e,note.id,e.columns.length-1);showNoteColumn(e,false);showNoteColumn(e,true);assert.equal(e.columns.find(c=>c.id===note.id).align,'center');
 const extra=column('Number','number');extra.align='left';e.columns.push(extra);extra.type='text';assert.equal(e.columns.at(-1).align,'left');e.columns.pop();const h=new PlanHistory();h.record(e.id,before,JSON.stringify(e),'column reorder');assert.equal(validateEvent(JSON.parse(h.peek(e.id,'undo').snapshot)).columns.find(c=>c.id===note.id).align,'center');
});
test('alignment survives JSON, duplicate plans and preset update/recovery; CSV omits it',()=>{
 let s=initialState();s.active=s.events[0].id;s.events[0].columns[0].align='left';s=presetChange(s,'new',{name:'Aligned'});const id=s.presets[0].id;const copy=clone(s.events[0]);assert.equal(copy.columns[0].align,'left');s.events[0].columns[0].align='center';s=presetChange(s,'update',{id});s=presetChange(s,'recover',{id});s=parseState(serializeState(s));assert.equal(s.presets[0].event.columns[0].align,'left');assert.equal(s.presets[0].previous.event.columns[0].align,'center');assert.equal(importCSV(exportCSV(s.events[0])).columns[0].align,'auto');
});
