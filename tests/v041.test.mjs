import test from 'node:test';
import assert from 'node:assert/strict';
import {createEvent,initialState,column,validateEvent,serializeState,parseState,exportCSV,importCSV,cueHeader,cellText} from '../dist/core.js';
import {formatSaveTime} from '../dist/save-status.js';

test('new nutrition templates share Fuel across both modes; other templates keep Note',()=>{
 const e=createEvent();assert.equal(e.columns[1].label,'Fuel');e.mode='time';assert.equal(cueHeader(e,e.columns[1]),'Fuel');
 assert.equal(initialState().events[0].columns[1].label,'Fuel');
 for(const preset of ['route','custom'])assert.equal(createEvent(preset).columns[1].label,'Note');
});
test('stored, imported and personal-preset labels retain user intent, including old defaults',()=>{
 for(const label of ['Eat / drink','Eat/drink','My fuel','Fuel']){
  const s=initialState();s.events[0].columns[1].label=label;s.presets=[{name:'Personal',event:structuredClone(s.events[0])}];
  const restored=parseState(serializeState(s));assert.equal(restored.events[0].columns[1].label,label);assert.equal(restored.presets[0].event.columns[1].label,label);
  assert.equal(importCSV(exportCSV(s.events[0])).columns[1].label,label);
 }
});
test('customized nutrition time plans retain distance columns in their saved unit',()=>{
 const e=createEvent(),c=column('Distance to water','distance',20);e.columns.push(c);e.unit='mi';e.mode='time';
 for(const r of e.rows.distance)r.cells[c.id]=1609.344;
 e.rows.time=[{id:'time-row',symbol:'',cells:{[e.columns[0].id]:90,[e.columns[1].id]:'Water',[c.id]:3218.688}}];
 const restored=validateEvent(e);assert.equal(restored.unit,'mi');assert.equal(cellText(restored,restored.columns[2],3218.688),'2');
 assert.equal(cueHeader(restored,restored.columns[2]),'Distance to water (mi)');
 const imported=importCSV(exportCSV(e));assert.equal(imported.rows.time[0].cells[imported.columns[2].id],3218.688);
});
test('exact save date respects locale clock conventions and explicitly includes timezone',()=>{
 const at=Date.UTC(2026,9,3,21,22,48);
 assert.match(formatSaveTime(at,'en-GB','UTC'),/21:22:48/);
 assert.match(formatSaveTime(at,'en-US','UTC'),/9:22:48\s*PM/);
 assert.match(formatSaveTime(at,'en-GB','Europe/Amsterdam'),/GMT\+02:00/);
 assert.match(formatSaveTime(at,'en-GB','UTC'),/2026/);
 for(const unknown of [null,undefined,NaN,0,-1])assert.equal(formatSaveTime(unknown),'');
});

// Independent extraction examples include both word and character wrapping.
test('SVG label assertion restores only wrap-boundary spaces and rejects altered content',async()=>{
 const {assertWrappedLabel}=await import('./svg-label.mjs'),expected='Water distance (mi)';
 for(const lines of [['Water distance (mi)'],['Water','distance (mi)'],['Wat','er','dis','tan','ce','(mi',')'],['Water ','distance (mi)']])assertWrappedLabel(lines,expected);
 for(const lines of [[],['Waterdistance (mi)'],['Water','distance(mi)'],['Water','distance (km)'],['Water','distan (mi)'],['Water','distance  (mi)'],['distance (mi)','Water']])assert.throws(()=>assertWrappedLabel(lines,expected));
});
