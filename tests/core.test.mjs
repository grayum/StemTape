import test from 'node:test';
import assert from 'node:assert/strict';
import {createEvent,initialState,validateEvent,validateState,parseTime,formatTime,displayDistance,toMetres,parseCSV,exportCSV,importCSV,safeCSVCell,clone} from '../dist/core.js';
test('fresh state is metric and validates',()=>{const s=validateState(initialState());assert.equal(s.events[0].unit,'km');assert.equal(s.events[0].dimensionUnit,'mm');assert.equal(s.events[0].rows.time.length,0);});
test('units convert values and retain canonical distance',()=>{assert.equal(toMetres(1,'mi'),1609.344);assert.equal(displayDistance(1609.344,'mi'),1);const e=createEvent(),before=e.rows.distance[0].cells[e.columns[0].id];e.unit='mi';assert.equal(e.rows.distance[0].cells[e.columns[0].id],before);});
test('elapsed time validates hours and minutes',()=>{assert.equal(parseTime('1:30'),90);assert.equal(formatTime(90),'1:30');for(const bad of ['1:60','-1:30','12','1:3','1.5:00','1000:00'])assert.throws(()=>parseTime(bad));});
test('mode switch keeps independent plans',()=>{const e=createEvent();e.mode='time';const restored=validateEvent(e);assert.equal(restored.rows.distance.length,6);assert.equal(restored.rows.time.length,0);});
test('quoted CSV handles commas, newlines, quotes and BOM',()=>{assert.deepEqual(parseCSV('\uFEFFa,b\r\n"one, two","three\n""four"""'),[['a','b'],['one, two','three\n"four"']]);});
test('malformed CSV is rejected',()=>{for(const s of ['a,b\n"bad','a,b\n"ok"evil,b','a,b\nbad"quote,b'])assert.throws(()=>parseCSV(s));});
test('CSV metric cues roundtrip as a new event',()=>{const e=createEvent(),copy=importCSV(exportCSV(e));assert.notEqual(copy.id,e.id);assert.equal(copy.rows.distance.length,6);assert.equal(copy.rows.distance[0].cells[copy.columns[0].id],20000);assert.equal(copy.rows.distance[0].symbol,'banana');});
test('time CSV imports elapsed minutes',()=>{const e=importCSV('time,icon,Cue\n1:30,gel,Take gel');assert.equal(e.mode,'time');assert.equal(e.rows.time[0].cells[e.columns[0].id],90);});
test('CSV rejects unsafe structures and oversized input',()=>{for(const csv of ['foo,Cue\n1,Hi','km,Cue\n-1,Hi','km,Cue\nNaN,Hi','km,icon,Cue\n1,unknown,Hi','km,Cue\n1,Hi,extra'])assert.throws(()=>importCSV(csv));assert.throws(()=>parseCSV('a'.repeat(2_000_001)));});
test('spreadsheet formulas are escaped while text is retained in JSON',()=>{for(const v of ['=HYPERLINK("x")','+1','-1','@SUM(A1)','  =1','\t=2'])assert.ok(safeCSVCell(v).startsWith('"\''));const e=createEvent();e.rows.distance[0].cells[e.columns[1].id]='=1';assert.equal(validateEvent(JSON.parse(JSON.stringify(e))).rows.distance[0].cells[e.columns[1].id],'=1');});
test('JSON rejects unknown versions, NaN, invalid dimensions and duplicate IDs',()=>{const s=initialState();s.version=2;assert.throws(()=>validateState(s));for(const value of [NaN,Infinity,-1,300]){const e=createEvent();e.layout.width=value;assert.throws(()=>validateEvent(e));}const e=createEvent();e.rows.distance[1].id=e.rows.distance[0].id;assert.throws(()=>validateEvent(e));});
test('JSON prevents prototype keys and removes arbitrary fields',()=>{const e=createEvent();e.columns[1].id='__proto__';assert.throws(()=>validateEvent(e));const s=initialState();s.secret='not retained';assert.equal(validateState(s).secret,undefined);});
test('JSON rejects wrong types, missing values and invisible-only layouts',()=>{const e=createEvent();e.columns.forEach(c=>c.visible=false);assert.throws(()=>validateEvent(e));const e2=createEvent();delete e2.rows.distance[0].cells[e2.columns[1].id];assert.throws(()=>validateEvent(e2));});
test('untrusted HTML remains literal data',()=>{const e=importCSV('km,Cue\n10,<img src=x onerror=alert(1)>');assert.equal(e.rows.distance[0].cells[e.columns[1].id],'<img src=x onerror=alert(1)>');});
test('complete JSON preserves presets, themes and both modes',()=>{const s=initialState();s.theme='dark';s.presets.push({name:'My preset',event:clone(s.events[0])});const out=validateState(JSON.parse(JSON.stringify(s)));assert.equal(out.presets[0].name,'My preset');assert.equal(out.theme,'dark');});

test('five additional cue symbols survive CSV and JSON',()=>{
 for(const symbol of ['cobbles','ricecake','can','neutral','litter']){
  const e=importCSV(`distance_km,icon,Cue\n10,${symbol},Reminder`);
  assert.equal(e.rows.distance[0].symbol,symbol);
  assert.equal(validateEvent(JSON.parse(JSON.stringify(e))).rows.distance[0].symbol,symbol);
  assert.equal(importCSV(exportCSV(e)).rows.distance[0].symbol,symbol);
 }
});
test('moveCue preserves row identity, cell data and other mode',async()=>{
 const {moveCue}=await import('../dist/core.js');const e=createEvent(),rows=e.rows.distance,first=rows[0],before=JSON.stringify(first);
 assert.equal(moveCue(rows,first.id,rows.length-1),true);assert.equal(rows.at(-1),first);assert.equal(JSON.stringify(first),before);assert.equal(e.rows.time.length,0);
 assert.equal(moveCue(rows,first.id,0),true);assert.equal(rows[0],first);
});
test('moveCue rejects stale IDs and invalid positions without mutation',async()=>{
 const {moveCue}=await import('../dist/core.js');const rows=createEvent().rows.distance,before=JSON.stringify(rows);
 for(const [id,pos] of [['unknown',0],[rows[0].id,-1],[rows[0].id,rows.length],[rows[0].id,1.5],[rows[0].id,0]])assert.equal(moveCue(rows,id,pos),false);
 assert.equal(JSON.stringify(rows),before);
});
test('every selectable cue symbol has bundled vector geometry',async()=>{
 const {SYMBOLS}=await import('../dist/core.js'),{ICONS}=await import('../dist/icons.js');
 for(const s of SYMBOLS.filter(Boolean)){assert.ok(ICONS[s]?.length,s);for(const [tag,attrs]of ICONS[s]){assert.ok(['path','rect','circle','ellipse','line','polyline','polygon'].includes(tag));for(const key of Object.keys(attrs))assert.ok(!/^on|href|style/i.test(key));}}
});
test('position sort is stable and manual ordering survives persistence',async()=>{
 const {sortCuesByPosition,moveCue}=await import('../dist/core.js');const e=createEvent(),rows=e.rows.distance,key=e.columns[0].id;
 rows[0].cells[key]=rows[2].cells[key];const equal=[rows[0].id,rows[2].id];sortCuesByPosition(rows,key);
 assert.deepEqual(rows.filter(r=>r.cells[key]===60000).map(r=>r.id),equal);
 moveCue(rows,rows.at(-1).id,0);const ids=rows.map(r=>r.id);
 assert.deepEqual(validateEvent(JSON.parse(JSON.stringify(e))).rows.distance.map(r=>r.id),ids);
 rows[0].cells[key]=1;sortCuesByPosition(rows,key);assert.equal(rows[0].cells[key],1);
});
test('elapsed positions sort numerically without changing distance list',async()=>{
 const {sortCuesByPosition}=await import('../dist/core.js');const e=importCSV('time,icon,Cue\n2:00,gel,Later\n0:45,bar,Earlier\n1:00,bottle,Middle'),key=e.columns[0].id;
 const distance=JSON.stringify(e.rows.distance);sortCuesByPosition(e.rows.time,key);
 assert.deepEqual(e.rows.time.map(r=>r.cells[key]),[45,60,120]);assert.equal(JSON.stringify(e.rows.distance),distance);
});

import {LIMITS,uid,column,serializeState,parseState,utf8Bytes,assertByteLimit,totalDistanceMaximum,validatedTotal,restoreObject} from '../dist/core.js';
function budgetState(){
 const s=initialState();s.active=s.events[0].id;
 const e=s.events[0];e.columns.push(...Array.from({length:6},()=>column('Extra')));
 for(const mode of ['distance','time'])e.rows[mode]=Array.from({length:200},(_,i)=>({id:uid(),symbol:'',cells:Object.fromEntries(e.columns.map((c,j)=>[c.id,j===0?i:'']))}));
 s.events.push({...clone(e),id:uid()});s.presets.push({name:'Multibyte 🍌',event:clone(e)});
 return s;
}
function fillBudget(s,target){
 let left=target-utf8Bytes(serializeState(s));
 for(const e of [...s.events,...s.presets.map(p=>p.event)])for(const mode of ['distance','time'])for(const row of e.rows[mode])for(const c of e.columns.slice(1)){
  const n=Math.min(left,320);row.cells[c.id]='é'.repeat(Math.floor(n/2))+'x'.repeat(n%2);left-=n;
 }
 assert.equal(left,0,'fixture has sufficient text capacity');return s;
}
test('one UTF-8 budget includes both modes, events, presets and multibyte text at exact boundary',()=>{
 const s=fillBudget(budgetState(),LIMITS.bytes),backup=serializeState(s);
 assert.equal(utf8Bytes(backup),LIMITS.bytes);assert.ok(backup.length<LIMITS.bytes);
 assert.deepEqual(parseState(backup),validateState(s));assert.equal(serializeState(parseState(backup)),backup);
 // Test one byte over using an otherwise valid scalar, without exceeding cell limits.
 const over=JSON.parse(backup);over.presets[0].name+='x';assert.throws(()=>serializeState(over),/UTF-8/);
 assert.throws(()=>parseState(backup+' '),/UTF-8/);
 assert.equal(assertByteLimit('é'.repeat(LIMITS.bytes/2)).length,LIMITS.bytes/2);
});
test('oversized existing state is not mutated by validation; compact exports are restorable',()=>{
 const s=fillBudget(budgetState(),LIMITS.bytes-1);const before=JSON.stringify(s);s.presets[0].name+='🍌';
 const original=JSON.stringify(s);assert.throws(()=>serializeState(s),/UTF-8/);assert.equal(JSON.stringify(s),original);
 assert.throws(()=>parseState(original),/UTF-8/);assert.equal(utf8Bytes(serializeState(JSON.parse(before))),LIMITS.bytes-1);
});
test('rejected mutation rollback retains row and cell references and removes added data',()=>{
 const s=initialState(),accepted=validateState(s),event=s.events[0],row=event.rows.distance[0],cells=row.cells;
 event.name='Rejected';cells[event.columns[1].id]='Rejected';s.events.push(createEvent());s.presets.push({name:'Rejected',event:createEvent()});
 restoreObject(s,accepted);assert.deepEqual(s,accepted);assert.equal(s.events[0],event);assert.equal(event.rows.distance[0],row);assert.equal(row.cells,cells);
});
test('canonical total limits reject invalid miles without mutating the event',()=>{
 const e=createEvent(),original=clone(e);
 for(const v of ['', ' ', '-1','NaN','Infinity','10000'])assert.throws(()=>validatedTotal(v,'mi'));
 assert.deepEqual(e,original);assert.equal(validatedTotal('10000','km'),10_000_000);
 assert.ok(Math.abs(validatedTotal(totalDistanceMaximum('mi'),'mi')-10_000_000)<1e-8);
 assert.throws(()=>validatedTotal(totalDistanceMaximum('mi')+.01,'mi'));
});
test('CSV distance metadata preserves maximum and bracketed labels and canonical distances',()=>{
 for(const unit of ['km','mi'])for(const label of ['A'.repeat(32),'Water [km]','Water [mi] [km]']){
  const e=createEvent();e.unit=unit;e.columns[1].label=label;e.columns[1].type='distance';e.rows.distance.forEach(r=>r.cells[e.columns[1].id]=unit==='mi'?1609.344:1000);
  const result=importCSV(exportCSV(e));assert.equal(result.columns[1].label,label);assert.equal(result.columns[1].type,'distance');
  assert.equal(result.rows.distance[0].cells[result.columns[1].id],e.rows.distance[0].cells[e.columns[1].id]);
 }
});
test('CSV literal bracket and reserved-prefix text labels are not inferred as distances',()=>{
 for(const label of ['Water [km]','Water [mi]','stemtape:column:literal']){
  const e=createEvent();e.columns[1].label=label;const result=importCSV(exportCSV(e));assert.equal(result.columns[1].label,label);assert.equal(result.columns[1].type,'text');
 }
 const e=createEvent();e.columns[1].type='distance';e.rows.distance.forEach(r=>r.cells[e.columns[1].id]=1000);
 assert.throws(()=>importCSV(exportCSV(e).replace('"1"','"NaN"')));
});


import {EXPECTED_BYTE_LIMIT,byteBudgetFixture,stateBytes} from './byte-budget-fixture.mjs';
test('independent UTF-8 fixture leaves exactly four bytes for an accepted emoji name',()=>{
 assert.equal(LIMITS.bytes,EXPECTED_BYTE_LIMIT);
 const state=byteBudgetFixture(1_999_996),before=JSON.stringify(state);
 const name=state.events[0].name;
 assert.equal(Buffer.byteLength('🍌','utf8'),4);
 state.events[0].name=name+'🍌';
 assert.equal(stateBytes(state),2_000_000);
 const accepted=serializeState(state);
 assert.equal(Buffer.byteLength(accepted,'utf8'),2_000_000);
 assert.equal(parseState(accepted).events[0].name,name+'🍌');
 state.events[0].name+='🍌';
 assert.equal(stateBytes(state),2_000_004);
 assert.throws(()=>serializeState(state),/2,000,000 UTF-8 bytes/);
 assert.equal(Buffer.byteLength(before,'utf8'),1_999_996);
 assert.equal(parseState(accepted).events[0].name,name+'🍌');
});
test('rejected duplicate rolls back all state changes before the next boundary name edit',()=>{
 const state=byteBudgetFixture(),accepted=serializeState(state),copy=clone(state.events[0]);
 copy.id=uid();copy.name=(copy.name+' · copy').slice(0,80);state.events.push(copy);state.active=copy.id;
 assert.ok(stateBytes(state)>EXPECTED_BYTE_LIMIT);
 assert.throws(()=>serializeState(state),/UTF-8 bytes/);
 restoreObject(state,JSON.parse(accepted));
 assert.equal(state.events.length,2);assert.equal(state.active,state.events[0].id);
 assert.equal(stateBytes(state),2_000_000);assert.ok(serializeState(state)===accepted,'Rollback must reproduce the prior accepted backup');
 state.events[0].name+='🍌';assert.equal(stateBytes(state),2_000_004);
 assert.throws(()=>serializeState(state),/UTF-8 bytes/);
});

test('byte-budget fixture keeps active rendering small while retaining bulk in both modes and presets',()=>{
 const state=byteBudgetFixture(),active=state.events.find(e=>e.id===state.active);
 assert.equal(active.rows[active.mode].length,6);assert.equal(active.columns.length,2);
 assert.equal(state.events.length,2);assert.equal(state.presets.length,1);
 for(const e of [state.events[1],state.presets[0].event]){
  assert.equal(e.columns.length,8);
  for(const mode of ['distance','time'])assert.equal(e.rows[mode].length,200);
 }
 assert.equal(stateBytes(state),2_000_000);
 assert.equal(Buffer.byteLength(serializeState(state),'utf8'),2_000_000);
});
