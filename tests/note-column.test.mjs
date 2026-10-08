import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,createEvent,column,clone,validateEvent,serializeState,parseState,exportCSV,importCSV} from '../dist/core.js';
import {moveColumn,canRemoveColumn} from '../dist/columns.js';
import {noteColumn,showNoteColumn} from '../dist/note-column.js';
import {SaveSession} from '../dist/save-status.js';
import {byteBudgetFixture,stateBytes} from './byte-budget-fixture.mjs';

test('Note is absent/off by default and does not infer existing Note or Location labels',()=>{
 for(const preset of ['nutrition','route','custom']){
  const e=createEvent(preset);e.columns[1].label='Note';const existing=e.columns[1].id;
  assert.equal(noteColumn(e),undefined);assert.equal(showNoteColumn(e,false),false);showNoteColumn(e,true);
  assert.notEqual(e.noteColumnId,existing);assert.equal(e.cueColumnId,existing);assert.equal(e.columns[1].id,e.noteColumnId);
  assert.equal(showNoteColumn(e,true),false);assert.equal(e.columns.length,3);
 }
});
test('note toggle, rename, reordering, modes, duplication and presets preserve all content and width choices',()=>{
 const s=initialState(),e=s.events[0],layout=clone(e.layout),widths=e.columns.map(c=>c.width),cue=e.columns[1].id;
 e.rows.time=[{id:'time',symbol:'bottle',cells:{[e.columns[0].id]:60,[cue]:'Drink'}}];showNoteColumn(e,true);
 const note=noteColumn(e);note.label='Location';note.width=31;e.rows.distance[0].cells[note.id]='<bridge> 🍌';e.rows.time[0].cells[note.id]='Park';
 moveColumn(e,note.id,2);showNoteColumn(e,false);const raw=serializeState(s);assert.equal(parseState(raw).events[0].rows.time[0].cells[note.id],'Park');
 showNoteColumn(e,true);e.mode='time';assert.equal(e.columns[2].id,note.id);assert.equal(note.label,'Location');assert.equal(note.width,31);assert.deepEqual(e.layout,layout);
 assert.deepEqual(e.columns.filter(c=>c.id!==note.id).map(c=>c.width),widths);assert.equal(e.rows.distance[0].cells[note.id],'<bridge> 🍌');
 const duplicate=clone(e);duplicate.id='duplicate';s.events.push(duplicate);s.presets.push({name:'Note',event:clone(e)});
 for(const restored of [...parseState(serializeState(s)).events,parseState(serializeState(s)).presets[0].event]){assert.equal(noteColumn(restored).id,note.id);assert.equal(showNoteColumn(restored,true),false);assert.equal(restored.columns.length,3);}
 assert.equal(canRemoveColumn(e,note.id),false);assert.equal(canRemoveColumn(e,cue),false);
});
test('note identity rejects missing, primary, cue, non-text and malicious references without changing originals',()=>{
 const e=initialState().events[0];showNoteColumn(e,true);const raw=JSON.stringify(e);
 for(const id of ['missing','__proto__',e.columns[0].id,e.cueColumnId,null]){const candidate=clone(e);candidate.noteColumnId=id;assert.throws(()=>validateEvent(candidate),/note column reference/);}
 const candidate=clone(e);noteColumn(candidate).type='number';assert.throws(()=>validateEvent(candidate),/note column reference/);
 assert.equal(JSON.stringify(e),raw);
});
test('column limits reject note creation atomically; hidden retained notes may still be restored',()=>{
 const e=initialState().events[0];for(let i=0;i<6;i++){const c=column('Extra');e.columns.push(c);e.rows.distance.forEach(r=>r.cells[c.id]='');}
 const raw=JSON.stringify(e);assert.throws(()=>showNoteColumn(e,true),/Maximum 8/);assert.equal(JSON.stringify(e),raw);
 const e2=initialState().events[0];showNoteColumn(e2,true);e2.columns.forEach(c=>c.visible=c.id===e2.noteColumnId);
 assert.throws(()=>showNoteColumn(e2,false),/visible/);assert.equal(noteColumn(e2).visible,true);
});
test('visible note CSV roles round-trip without duplication; hidden notes are excluded while JSON retains them',()=>{
 const s=initialState(),e=s.events[0];showNoteColumn(e,true);noteColumn(e).label='Location';e.rows.distance[0].cells[e.noteColumnId]='Bridge 🍌';
 const imported=importCSV(exportCSV(e));assert.equal(noteColumn(imported).label,'Location');assert.equal(imported.rows.distance[0].cells[imported.noteColumnId],'Bridge 🍌');assert.equal(showNoteColumn(imported,true),false);
 assert.equal(imported.cueColumnId,imported.columns[2].id);showNoteColumn(e,false);
 const csv=exportCSV(e);assert.equal(csv.includes('Bridge'),false);assert.equal(csv.includes('Location'),false);assert.equal(importCSV(csv).noteColumnId,undefined);
 const restored=parseState(serializeState(s));assert.equal(noteColumn(restored.events[0]).visible,false);assert.equal(restored.events[0].rows.distance[0].cells[e.noteColumnId],'Bridge 🍌');
});
test('position/icon-only and note-only CSV exports remain importable without confusing notes with the icon host',()=>{
 const e=initialState().events[0];e.columns[1].visible=false;const imported=importCSV(exportCSV(e));assert.equal(imported.columns[1].label,'Fuel');assert.equal(imported.rows.distance[0].cells[imported.columns[1].id],'');
 showNoteColumn(e,true);const onlyNote=importCSV(exportCSV(e));assert.notEqual(onlyNote.noteColumnId,onlyNote.cueColumnId);assert.equal(onlyNote.columns.length,3);assert.equal(showNoteColumn(onlyNote,true),false);
});
test('time-mode Note movement keeps elapsed minutes and custom distance columns in the retained mile unit',()=>{
 const e=initialState().events[0],cue=e.columns[1].id,c=column('Water distance','distance',22);e.columns.push(c);e.unit='mi';e.rows.distance.forEach(r=>r.cells[c.id]=1609.344);
 e.rows.time=[{id:'elapsed',symbol:'bottle',cells:{[e.columns[0].id]:90,[cue]:'Drink',[c.id]:3218.688}}];e.mode='time';showNoteColumn(e,true);
 e.rows.time[0].cells[e.noteColumnId]='Park';moveColumn(e,e.noteColumnId,3);const copy=importCSV(exportCSV(e));
 assert.equal(copy.mode,'time');assert.equal(copy.rows.time[0].cells[copy.columns[0].id],90);
 assert.deepEqual(copy.columns.slice(1).map(c=>c.label),['Fuel','Water distance','Note']);assert.equal(copy.rows.time[0].cells[copy.columns[2].id],3218.688);
 assert.equal(copy.rows.time[0].cells[copy.noteColumnId],'Park');assert.equal(e.unit,'mi');assert.equal(e.rows.time[0].cells[c.id],3218.688);
});
test('note metadata and emoji fit the shared exact UTF-8 budget; over-budget and quota writes keep saved state',()=>{
 const probe=byteBudgetFixture(1_900_000);showNoteColumn(probe.events[0],true);probe.events[0].rows.distance[0].cells[probe.events[0].noteColumnId]='🍌';
 const overhead=stateBytes(probe)-1_900_000,s=byteBudgetFixture(2_000_000-overhead);showNoteColumn(s.events[0],true);s.events[0].rows.distance[0].cells[s.events[0].noteColumnId]='🍌';
 assert.equal(stateBytes(s),2_000_000);let raw=serializeState(s),original=raw;
 const session=new SaveSession({raw,read:()=>raw,write:()=>{throw Error('quota');}});assert.equal(session.save(s).ok,false);assert.equal(session.view().success,false);assert.equal(raw,original);
 s.events[0].rows.distance[0].cells[s.events[0].noteColumnId]+='🍌';assert.equal(stateBytes(s),2_000_004);assert.throws(()=>session.save(s),/UTF-8 bytes/);assert.equal(raw,original);
});
