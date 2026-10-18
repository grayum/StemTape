import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,createEvent,clone,serializeState,parseState,importCSV,exportCSV,uid} from '../dist/core.js';
import {presetChange,PRESET_NAME_COLLISION,personalPresetLabel} from '../dist/preset-actions.js';
import {SaveSession} from '../dist/save-status.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';
const initial=()=>{const s=initialState();s.active=s.events[0].id;return s;};
const saved=()=>presetChange(initial(),'new',{name:'Personal'});
const change=(s,op,opts={})=>presetChange(s,op,{id:s.events.find(e=>e.id===s.active).presetId,...opts});
test('save new associates by stable identity; same-name updates preserve other plans and presets',()=>{
 let s=saved();const first=s.presets[0].id,other=clone(s.events[0]);other.id=uid();s.events.push(other);
 s=change(s,'new',{name:'Other'});s.presets[1].name='Personal';s=parseState(serializeState(s));const second=s.events[0].presetId;assert.notEqual(first,second);
 s.events[0].name='Changed plan';const before=clone(s);
 s=change(s,'update');assert.equal(s.presets[1].id,second);assert.equal(s.presets[1].event.name,'Changed plan');
 assert.deepEqual(s.presets[0],before.presets[0]);assert.deepEqual(s.events,before.events);assert.equal(s.presets[1].name,'Personal');
 assert.equal(before.presets[1].previous,undefined);
});
test('no-op keeps meaningful recovery, bounded revision swaps restore both content and name',()=>{
 let s=saved();s.events[0].name='Revision 2';s=change(s,'update');
 const p=clone(s.presets[0]);assert.equal(change(s,'update'),null);assert.deepEqual(s.presets[0],p);
 s=change(s,'recover');assert.equal(s.presets[0].name,'Personal');assert.equal(s.presets[0].event.name,p.previous.event.name);
 assert.equal(s.presets[0].previous.name,'Personal');assert.deepEqual(s.events[0].name,'Revision 2');
 s=change(s,'recover');assert.equal(s.presets[0].event.name,'Revision 2');assert.equal(s.presets[0].previous.previous,undefined);
});
test('legacy records stay byte-identical until use; new plans have fresh identity and association',()=>{
 const s=initial();s.presets.push({name:'Old',event:clone(s.events[0])});const legacy=serializeState(s);
 assert.equal(serializeState(parseState(legacy)),legacy);const next=presetChange(s,'use',{index:0});
 assert.ok(next.presets[0].id);assert.notEqual(next.active,s.active);assert.equal(next.events.at(-1).presetId,next.presets[0].id);assert.equal(s.presets[0].id,undefined);
 assert.deepEqual(next.events[0],s.events[0]);assert.equal(next.events.at(-1).name,s.events[0].name+' (2)');assert.equal(change(next,'update').presets[0].name,'Old');
});
test('built-in templates cannot be updated/deleted/recovered; deletion unlinks without deleting plans',()=>{
 const original=initial();for(const op of ['update','recover','delete'])assert.throws(()=>presetChange(original,op,{id:'nutrition'}),/cannot be changed/);
 const s=saved(),e=clone(s.events[0]);e.id=uid();s.events.push(e);const next=change(s,'delete');assert.equal(next.events.length,2);assert.equal(next.presets.length,0);
 assert.ok(next.events.every(e=>!e.presetId));assert.ok(s.events[0].presetId);
});
test('complete backup preserves identities/recovery; duplicate/missing/unsafe identities reject without local relinking',()=>{
 let s=saved();s.events[0].name='New';s=change(s,'update');assert.deepEqual(parseState(serializeState(s)),parseState(serializeState(s)));
 const backup=parseState(serializeState(s));assert.deepEqual(backup.presets,s.presets);assert.equal(backup.events[0].presetId,s.presets[0].id);
 for(const id of ['', '__proto__', 'constructor']){const bad=clone(s);bad.presets[0].id=id;assert.throws(()=>serializeState(bad));}
 const duplicate=clone(s);duplicate.presets.push(clone(duplicate.presets[0]));assert.throws(()=>serializeState(duplicate),/Duplicate preset/);
 const missing=clone(s);missing.presets=[];assert.throws(()=>serializeState(missing),/Missing associated/);
 const nested=clone(s);nested.presets[0].event.presetId=s.presets[0].id;assert.throws(()=>serializeState(nested),/cannot contain/);
 const csv=importCSV(exportCSV(s.events[0]));assert.equal(csv.presetId,undefined);
});
test('one atomic write contains both revisions; quota/conflict/recovery failures preserve original state',()=>{
 const s=saved();s.events[0].name='New';const before=serializeState(s),candidate=change(s,'update');
 for(const failure of ['quota','conflict','recovery']){
  let raw=before,writes=0;const session=new SaveSession({raw:before,read:()=>failure==='conflict'?'other':raw,write:()=>{writes++;throw Error('quota');}});
  assert.equal(session.save(candidate,{recovery:failure==='recovery'}).ok,false);assert.equal(raw,before);assert.equal(serializeState(s),before);assert.equal(writes,failure==='quota'?1:0);
 }
 let raw=before,writes=0;const session=new SaveSession({raw,read:()=>raw,write:value=>{raw=value;writes++;}});assert.equal(session.save(candidate).ok,true);assert.equal(writes,1);assert.ok(parseState(raw).presets[0].previous);
});
test('UTF-8 budget checked before any candidate exposure; legacy exact limit still loads',()=>{
 const tight=byteBudgetFixture();assert.equal(Buffer.byteLength(serializeState(tight)),2_000_000);
 const before=clone(tight);assert.throws(()=>presetChange(tight,'new',{name:'é'.repeat(40)}),/2,000,000/);assert.deepEqual(tight,before);
 let s=saved();s.events[0]=clone(tight.events[1]);s.events[0].presetId=s.presets[0].id;s.active=s.events[0].id;
 s.presets[0].event=clone(tight.events[1]);assert.throws(()=>change(s,'rename',{name:'Budget revision'}),/2,000,000/);
});
test('new preset collisions are trimmed and case-insensitive, preserve all state and association',()=>{
 const s=saved(),before=clone(s);
 for(const name of ['Personal','personal','PERSONAL',' Personal ','  pErSoNaL  ','Nutrition plan',' nutrition PLAN ','Route notes',' Custom ','TOUR OF FLANDERS']){
  assert.throws(()=>change(s,'new',{name}),e=>e.message===PRESET_NAME_COLLISION&&e.code==='preset-name-collision');assert.deepEqual(s,before);
 }
 const next=change(s,'new',{name:'  My Chosen CASE  '});assert.equal(next.presets.at(-1).name,'My Chosen CASE');
});
test('renames exclude self, reject other/built-in names, and preserve revisions on rejection',()=>{
 let s=saved();s=change(s,'new',{name:'Second'});const before=clone(s);
 for(const name of ['Personal',' personal ','Nutrition plan',' tour OF flanders ']){assert.throws(()=>change(s,'rename',{name}),{message:PRESET_NAME_COLLISION});assert.deepEqual(s,before);}
 assert.equal(change(s,'rename',{name:'Second'}),null);
 s=change(s,'rename',{name:' sEcOnD '});assert.equal(s.presets.at(-1).name,'sEcOnD');assert.equal(s.presets.at(-1).previous.name,'Second');
 s=change(s,'recover');assert.equal(s.presets.at(-1).name,'Second');
});
test('existing duplicate names survive complete backups and independently update/recover by ID',()=>{
 let s=saved();s=change(s,'new',{name:'Other'});s.presets[1].name='Personal';s=parseState(serializeState(s));
 const ids=s.presets.map(p=>p.id),first=clone(s.presets[0]);assert.notEqual(personalPresetLabel(s.presets,s.presets[0]),personalPresetLabel(s.presets,s.presets[1]));
 s.events[0].name='Second identity update';s=change(s,'update',{name:'Personal'});assert.deepEqual(s.presets[0],first);assert.equal(s.presets[1].event.name,'Second identity update');
 s=change(s,'recover');assert.deepEqual(s.presets[0],first);assert.equal(s.presets[1].previous.event.name,'Second identity update');
 s.events[0].presetId=ids[0];s.events[0].name='First identity update';s=change(s,'update',{name:'Personal'});const second=clone(s.presets[1]);s=change(s,'recover');assert.deepEqual(s.presets[1],second);
 const restored=parseState(serializeState(s));assert.deepEqual(restored.presets,s.presets);assert.deepEqual(restored.presets.map(p=>p.id),ids);
});
