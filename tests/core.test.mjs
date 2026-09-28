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
