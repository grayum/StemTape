import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,column,clone,validateEvent,parseState,serializeState,exportCSV,importCSV,restoreObject} from '../dist/core.js';
import {moveColumn,cueColumnId,removeColumn} from '../dist/columns.js';
import {SaveSession} from '../dist/save-status.js';
import {byteBudgetFixture,stateBytes} from './byte-budget-fixture.mjs';

function extra(e){const c=column('Water [mi]','distance',27);e.columns.push(c);for(const mode of ['distance','time'])for(const r of e.rows[mode])r.cells[c.id]=3218.688;return c;}
test('column movement keeps both mode values, widths, cue icons and manual row order attached to IDs',()=>{
 const e=initialState().events[0],cue=e.columns[1],added=extra(e);cue.width=73;added.align='center';
 e.rows.time=[{id:'elapsed',symbol:'gel',cells:{[e.columns[0].id]:90,[cue.id]:'Drink',[added.id]:1609.344}}];
 e.rows.distance.reverse();const rows=clone(e.rows),cols=Object.fromEntries(e.columns.map(c=>[c.id,clone(c)])),layout=clone(e.layout);
 assert.equal(moveColumn(e,added.id,1),true);assert.equal(cueColumnId(e),cue.id);
 assert.deepEqual(e.rows,rows);assert.deepEqual(e.layout,layout);
 for(const c of e.columns)assert.deepEqual(c,cols[c.id]);
 assert.deepEqual(e.columns.map(c=>c.id),[Object.keys(cols)[0],added.id,cue.id]);
});
test('primary stays first; stale IDs, fixed destinations and boundary moves do not mutate state',()=>{
 const e=initialState().events[0];extra(e);const before=JSON.stringify(e);
 for(const [id,to]of [[e.columns[0].id,1],[e.columns[1].id,0],[e.columns[2].id,3],['missing',1],[e.columns[1].id,1],[e.columns[2].id,1.5]])assert.equal(moveColumn(e,id,to),false);
 assert.equal(JSON.stringify(e),before);
});
test('optional cue identity is validated; legacy JSON does not gain metadata or reorder on load',()=>{
 const s=initialState(),raw=serializeState(s);assert.equal(serializeState(parseState(raw)),raw);
 for(const id of ['missing','__proto__',s.events[0].columns[0].id,null]){const e=clone(s.events[0]);e.cueColumnId=id;assert.throws(()=>validateEvent(e),/cue column reference/);}
 const full=serializeState(byteBudgetFixture());assert.equal(Buffer.byteLength(full),2_000_000);assert.equal(serializeState(parseState(full)),full);
});
test('JSON backups, duplicates and presets preserve stable column order and icon host',()=>{
 const s=initialState(),e=s.events[0],c=extra(e);moveColumn(e,c.id,1);
 const duplicate=clone(e);duplicate.id='duplicate';s.events.push(duplicate);s.presets.push({name:'Reordered',event:clone(e)});
 const restored=parseState(serializeState(s));
 for(const plan of [...restored.events,restored.presets[0].event]){assert.deepEqual(plan.columns,e.columns);assert.deepEqual(plan.rows,e.rows);assert.equal(plan.cueColumnId,e.cueColumnId);}
});
test('reordered CSV retains complete labels, miles, cue identity and aligned values',()=>{
 const e=initialState().events[0],cue=e.columns[1],c=extra(e);e.unit='mi';moveColumn(e,c.id,1);
 const restored=importCSV(exportCSV(e));assert.deepEqual(restored.columns.slice(1).map(c=>c.label),[c.label,cue.label]);
 assert.equal(restored.columns[1].type,'distance');assert.equal(restored.cueColumnId,restored.columns[2].id);
 e.rows.distance.forEach((r,i)=>{assert.equal(restored.rows.distance[i].cells[restored.columns[1].id],r.cells[c.id]);assert.equal(restored.rows.distance[i].cells[restored.columns[2].id],r.cells[cue.id]);assert.equal(restored.rows.distance[i].symbol,r.symbol);});
});
test('CSV accepts older metadata and literal reserved labels; invalid role metadata is rejected',()=>{
 const e=initialState().events[0];e.columns[1].label='stemtape:column:["note"]';const restored=importCSV(exportCSV(e));assert.equal(restored.columns[1].label,e.columns[1].label);assert.equal(restored.noteColumnId,undefined);
 assert.equal(importCSV('distance_km,icon,Fuel\n10,bar,Eat').rows.distance[0].symbol,'bar');
 const header=tuple=>'"'+('stemtape:column:'+JSON.stringify(tuple)).replaceAll('"','""')+'"';
 assert.equal(importCSV(`distance_km,icon,${header(['distance','Water','km'])}\n1,,2`).columns[1].type,'distance');
 for(const tuple of [['text','X',null,'unknown'],['distance','X','km','note'],['text','X',null,'cue','extra']])assert.throws(()=>importCSV(`km,icon,${header(tuple)}\n1,,2`),/metadata/);
 assert.throws(()=>importCSV(`km,icon,${header(['text','X',null,'cue'])},${header(['text','Y',null,'cue'])}\n1,,a,b`),/Duplicate/);
});
test('reorder metadata obeys the UTF-8 budget and rejected change can roll back without saving',()=>{
 const probe=byteBudgetFixture(1_900_000);const c=extra(probe.events[0]);moveColumn(probe.events[0],c.id,1);
 const overhead=stateBytes(probe)-1_900_000,s=byteBudgetFixture(2_000_000-overhead),added=extra(s.events[0]);
 moveColumn(s.events[0],added.id,1);assert.equal(stateBytes(s),2_000_000);const raw=serializeState(s);assert.equal(Buffer.byteLength(raw),2_000_000);
 let saved=raw;const session=new SaveSession({raw,read:()=>saved,write:v=>saved=v});assert.equal(session.save(s).ok,true);assert.equal(session.timePersisted,false);
 const full=byteBudgetFixture();const before=clone(full),rawBefore=serializeState(full);extra(full.events[0]);moveColumn(full.events[0],full.events[0].columns.at(-1).id,1);
 assert.throws(()=>serializeState(full),/UTF-8 bytes/);restoreObject(full,before);assert.equal(serializeState(full),rawBefore);
});
test('explicit removal retains a valid cue identity and both mode cell maps',()=>{
 const e=initialState().events[0],oldCue=e.columns[1].id,c=extra(e);moveColumn(e,c.id,1);assert.equal(removeColumn(e,oldCue),true);
 assert.equal(e.cueColumnId,c.id);assert.equal(validateEvent(e).columns[1].id,c.id);
 for(const r of e.rows.distance)assert.equal(Object.hasOwn(r.cells,oldCue),false);
});
