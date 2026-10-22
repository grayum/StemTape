import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,clone,serializeState,parseState,validateEvent,exportCSV,importCSV} from '../dist/core.js';
import {cueDisplay,sheetColumnWidths} from '../dist/cue-display.js';
import {cueColumnId,moveColumn} from '../dist/columns.js';
import {showNoteColumn} from '../dist/note-column.js';
import {PlanHistory} from '../dist/history.js';
import {presetChange} from '../dist/preset-actions.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';
test('legacy cue display/width defaults are byte stable and strict imported values are allowlisted',()=>{
 const s=initialState(),before=serializeState(s),e=s.events[0],c=e.columns[1];assert.equal(cueDisplay(c),'icon-text');assert.equal(e.layout.fitWidth,undefined);assert.equal(serializeState(parseState(before)),before);
 for(const value of ['icon-text','icon-only']){c.cueDisplay=value;assert.equal(validateEvent(e).columns[1].cueDisplay,value);}
 for(const bad of ['none','url(x)',null,1,'Icon only']){c.cueDisplay=bad;assert.throws(()=>validateEvent(e),/cue display/);}
 delete c.cueDisplay;for(const obsolete of ['auto','share','unknown',null]){c.widthMode=obsolete;assert.equal(validateEvent(e).columns[1].widthMode,undefined);}for(const bad of ['true',null,1]){e.layout.fitWidth=bad;assert.throws(()=>validateEvent(e),/content-fit/);}
});
test('plan-wide natural sizing never redistributes spare width; off/maximum use stored shares',()=>{
 const cols=[{width:30},{width:50},{width:20}],before=clone(cols);
 assert.deepEqual(sheetColumnWidths(cols,100,[5,8,12],true),[5,8,12]);
 assert.deepEqual(sheetColumnWidths(cols,100,[5,8,12],false),[30,50,20]);
 assert.deepEqual(sheetColumnWidths(cols,100,[5,108,12],true),[30,50,20]);
 assert.deepEqual(cols,before);
});
test('display toggles/reorders/history retain hidden text, alignment and colour; CSV retains data not setting',()=>{
 const s=initialState(),e=s.events[0],c=e.columns[1],row=e.rows.distance[0];row.iconColour='orange';showNoteColumn(e,true);row.cells[e.noteColumnId]='Note';const before=JSON.stringify(e);c.cueDisplay='icon-only';e.layout.fitWidth=true;c.align='center';moveColumn(e,c.id,1);showNoteColumn(e,false);const h=new PlanHistory();h.record(e.id,before,JSON.stringify(e),'cue display');assert.equal(JSON.parse(h.peek(e.id,'undo').snapshot).columns.find(x=>x.id===c.id).cueDisplay,undefined);h.accept(e.id,'undo');assert.equal(JSON.parse(h.peek(e.id,'redo').snapshot).layout.fitWidth,true);
 const loaded=importCSV(exportCSV(e));assert.equal(loaded.rows.distance[0].cells[loaded.columns[1].id],row.cells[c.id]);assert.equal(loaded.rows.distance[0].iconColour,'orange');assert.equal(loaded.columns[1].cueDisplay,undefined);assert.equal(row.cells[e.noteColumnId],'Note');assert.equal(cueColumnId(e),c.id);
 c.cueDisplay='icon-text';assert.equal(row.cells[c.id],'Banana');assert.equal(c.width,68);
});
test('JSON, plan duplicate and preset update/recovery retain both fields and hidden cue values',()=>{
 let s=initialState();s.active=s.events[0].id;const c=s.events[0].columns[1];c.cueDisplay='icon-only';s.events[0].layout.fitWidth=true;s=presetChange(s,'new',{name:'Compact'});const id=s.presets[0].id;const copy=clone(s.events[0]);assert.equal(copy.columns[1].cueDisplay,'icon-only');s.events[0].columns[1].cueDisplay='icon-text';s.events[0].layout.fitWidth=false;s=presetChange(s,'update',{id});s=presetChange(s,'recover',{id});s=parseState(serializeState(s));assert.equal(s.presets[0].event.columns[1].cueDisplay,'icon-only');assert.equal(s.presets[0].previous.event.columns[1].cueDisplay,'icon-text');s=presetChange(s,'use',{id});assert.equal(s.events.at(-1).layout.fitWidth,true);assert.equal(s.presets[0].previous.event.layout.fitWidth,false);assert.equal(s.events.at(-1).rows.distance[0].cells[c.id],'Banana');
});
test('presentation fields count toward the unchanged UTF-8 budget without touching the original',()=>{
 const s=byteBudgetFixture(),raw=serializeState(s),next=clone(s);next.events[0].columns[1].cueDisplay='icon-only';next.events[0].layout.fitWidth=true;assert.throws(()=>serializeState(next),/2,000,000/);assert.equal(serializeState(s),raw);
});

test('obsolete cue sizing is stripped recursively from plans, presets and recovery without enabling fit',()=>{
 let s=initialState();s.active=s.events[0].id;s=presetChange(s,'new',{name:'Older preview'});
 s.presets[0].previous={name:'Previous',event:clone(s.presets[0].event)};
 for(const e of [s.events[0],s.presets[0].event,s.presets[0].previous.event])e.columns[1].widthMode='auto';
 const parsed=parseState(JSON.stringify(s));
 for(const e of [parsed.events[0],parsed.presets[0].event,parsed.presets[0].previous.event]){assert.equal(e.columns[1].widthMode,undefined);assert.equal(e.layout.fitWidth,undefined);assert.equal(e.columns[1].width,68);}
});
