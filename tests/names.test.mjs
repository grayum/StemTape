import test from 'node:test';
import assert from 'node:assert/strict';
import {assertEventName,uniqueEventName,eventDisplayLabel,EVENT_NAME_COLLISION} from '../dist/names.js';
import {initialState,serializeState,parseState,clone,uid,importCSV} from '../dist/core.js';
import {presetChange} from '../dist/preset-actions.js';
import {PlanHistory} from '../dist/history.js';
const initial=()=>{const s=initialState();s.active=s.events[0].id;return s;};
test('separate event/preset namespaces trim and ignore case, exclude self, preserve capitalization',()=>{
 let s=initial();s.events[0].name='Shared Name';s=presetChange(s,'new',{name:' Shared Name '});assert.equal(s.presets[0].name,'Shared Name');
 assert.equal(assertEventName(s.events,' sHaReD nAmE ',s.active),'sHaReD nAmE');
 const e=clone(s.events[0]);e.id=uid();e.name='Other';s.events.push(e);
 for(const name of ['Shared Name',' shared NAME '])assert.throws(()=>assertEventName(s.events,name,e.id),{message:EVENT_NAME_COLLISION});
 const before=clone(s);s.events[0].name='Changed event';const updated=presetChange(s,'update',{id:s.presets[0].id,name:'Ignored attempted preset rename'});
 assert.equal(updated.presets[0].name,'Shared Name');assert.equal(updated.presets[0].event.name,'Changed event');assert.equal(before.presets[0].name,'Shared Name');
 const renamed=presetChange(updated,'rename',{id:s.presets[0].id,name:'Other'});assert.equal(renamed.presets[0].name,'Other');assert.deepEqual(renamed.events,updated.events);assert.deepEqual(renamed.presets[0].event,updated.presets[0].event);
});
test('unique suggestions check every name and bounded suffixes, never rewrite existing plans',()=>{
 const events=[{id:'a',name:' Sunday 120 km '},{id:'b',name:'SUNDAY 120 KM (2)'},{id:'c',name:'Sunday 120 km (4)'}],before=clone(events);
 assert.equal(uniqueEventName(events,'Sunday 120 km'),'Sunday 120 km (3)');assert.deepEqual(events,before);
 assert.equal(uniqueEventName(events,''),'Untitled ride');
 const long='🚲'.repeat(40),suggestion=uniqueEventName([{name:long}],long);assert.ok(suggestion.length<=80);assert.ok(suggestion.endsWith(' (2)'));assert.equal(suggestion.isWellFormed(),true);
});
test('legacy duplicate event names survive complete JSON without merging; labels distinguish stable IDs',()=>{
 const s=initial(),e=clone(s.events[0]);e.id=uid();e.name=' '+e.name.toUpperCase()+' ';s.events.push(e);
 const restored=parseState(serializeState(s));assert.deepEqual(restored.events,s.events);assert.notEqual(eventDisplayLabel(restored.events,restored.events[0]),eventDisplayLabel(restored.events,restored.events[1]));
 assert.throws(()=>assertEventName(restored.events,e.name,e.id),{message:EVENT_NAME_COLLISION});
 const csv=importCSV('km,icon,Cue\n10,bar,Eat');assert.equal(uniqueEventName([{name:csv.name}],csv.name),'Imported plan (2)');
});
test('repeated personal preset use suggests unique names, preserving template and existing identities',()=>{
 let s=initial();s=presetChange(s,'new',{name:'Personal'});const original=clone(s.presets[0]);
 s=presetChange(s,'use',{index:0});s=presetChange(s,'use',{index:0});
 assert.deepEqual(s.events.map(e=>e.name),['Sunday 120 km','Sunday 120 km (2)','Sunday 120 km (3)']);assert.deepEqual(s.presets[0],original);assert.equal(new Set(s.events.map(e=>e.id)).size,3);
});
test('a history name conflict can be inspected without consuming state or history and retried',()=>{
 const events=[{id:'a',name:'New name'},{id:'b',name:'Old name'}],history=new PlanHistory();
 history.record('a',JSON.stringify({id:'a',name:'Old name'}),JSON.stringify(events[0]),'rename plan');const target=history.peek('a','undo');
 assert.throws(()=>assertEventName(events,JSON.parse(target.snapshot).name,'a'),{message:EVENT_NAME_COLLISION});assert.deepEqual(history.peek('a','undo'),target);assert.equal(events[0].name,'New name');
 events[1].name='Freed';assert.equal(assertEventName(events,JSON.parse(target.snapshot).name,'a'),'Old name');history.accept('a','undo');assert.equal(history.view('a').redo,'rename plan');
});
