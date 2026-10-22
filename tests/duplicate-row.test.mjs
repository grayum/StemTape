import test from 'node:test';
import assert from 'node:assert/strict';
import {createEvent,initialState,column,clone,serializeState,validateEvent,sortCuesByPosition,exportCSV,importCSV,LIMITS} from '../dist/core.js';
import {showNoteColumn} from '../dist/note-column.js';
import {duplicateRow} from '../dist/row-actions.js';
import {PlanHistory} from '../dist/history.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';
test('duplicate retains colour, blanks and hidden cells with a fresh ID immediately after source without sorting',()=>{
 const e=createEvent();showNoteColumn(e,true);showNoteColumn(e,false);const hidden=column('Retained');hidden.visible=false;e.columns.push(hidden);for(const rows of Object.values(e.rows))for(const r of rows)r.cells[hidden.id]='Retained value';const rows=e.rows.distance,source=rows[2];source.symbol='bottle';source.iconColour='orange';source.cells[e.noteColumnId]='Hidden note';source.cells[e.columns.find(c=>c.id!==e.noteColumnId&&c.type==='text').id]='';const before=clone(rows);const row=duplicateRow(e,source.id);assert.notEqual(row.id,source.id);assert.deepEqual({...row,id:source.id},source);assert.deepEqual(rows.map(r=>r.id),[...before.slice(0,3).map(r=>r.id),row.id,...before.slice(3).map(r=>r.id)]);row.cells[e.noteColumnId]='Independent';assert.equal(source.cells[e.noteColumnId],'Hidden note');assert.doesNotThrow(()=>validateEvent(e));
});
test('duplicate Undo/Redo restores exact identity, stable equal-position sorting and CSV colour',()=>{
 const e=createEvent(),h=new PlanHistory(),source=e.rows.distance[1];source.iconColour='blue';const before=JSON.stringify(e);const row=duplicateRow(e,source.id);h.record(e.id,before,JSON.stringify(e),'duplicate row');assert.equal(JSON.parse(h.peek(e.id,'undo').snapshot).rows.distance.length,6);h.accept(e.id,'undo');assert.equal(JSON.parse(h.peek(e.id,'redo').snapshot).rows.distance[2].id,row.id);
 sortCuesByPosition(e.rows.distance,e.columns[0].id);assert.deepEqual(e.rows.distance.slice(1,3).map(r=>r.id),[source.id,row.id]);row.cells[e.columns[0].id]=0;sortCuesByPosition(e.rows.distance,e.columns[0].id);assert.equal(e.rows.distance[0].id,row.id);assert.equal(e.rows.distance[0].iconColour,'blue');const loaded=importCSV(exportCSV(e));assert.equal(loaded.rows.distance[0].iconColour,'blue');assert.equal(loaded.rows.distance.length,7);
});
test('missing row, row limit and UTF-8 budget leave originals intact',()=>{
 const e=createEvent();assert.throws(()=>duplicateRow(e,'missing'),/no longer/);while(e.rows.distance.length<LIMITS.rows)duplicateRow(e,e.rows.distance[0].id);const before=JSON.stringify(e);assert.throws(()=>duplicateRow(e,e.rows.distance[0].id),/200/);assert.equal(JSON.stringify(e),before);
 const s=byteBudgetFixture(),raw=serializeState(s),candidate=clone(s);duplicateRow(candidate.events[0],candidate.events[0].rows.distance[0].id);assert.throws(()=>serializeState(candidate),/2,000,000/);assert.equal(serializeState(s),raw);
});
test('time rows duplicate without changing position or the other mode',()=>{
 const e=createEvent();e.mode='time';e.rows.time=[clone(e.rows.distance[0])];e.rows.time[0].cells[e.columns[0].id]=65;const before=JSON.stringify(e.rows.distance);const r=duplicateRow(e,e.rows.time[0].id);assert.equal(r.cells[e.columns[0].id],65);assert.equal(JSON.stringify(e.rows.distance),before);assert.doesNotThrow(()=>validateEvent(e));
});
