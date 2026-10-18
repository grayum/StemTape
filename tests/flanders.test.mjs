import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialState,createEvent,importCSV,parseState,serializeState} from '../dist/core.js';
const initial=()=>{const s=initialState();s.active=s.events[0].id;return s;};
test('Tour of Flanders preserves authoritative BOM CSV rows, symbols, roles, blanks and order',()=>{
 const bytes=readFileSync(new URL('./fixtures/Tour-of-Flanders-distance.csv',import.meta.url));assert.equal(bytes.subarray(0,3).toString('hex'),'efbbbf');
 const csv=importCSV(bytes.toString()),e=createEvent('flanders');
 const data=plan=>plan.rows.distance.map(r=>[r.cells[plan.columns[0].id],r.symbol,...plan.columns.slice(1).map(c=>r.cells[c.id])]);
 assert.deepEqual(data(e),data(csv));assert.equal(e.name,'Tour of Flanders');assert.equal(e.unit,'km');assert.equal(e.rows.distance.length,19);
 assert.deepEqual(e.rows.distance.filter(r=>r.cells[e.noteColumnId]==='Kwaremont').map(r=>r.cells[e.columns[0].id]),[135000,217000,255000]);
 assert.equal(e.columns.find(c=>c.id===e.noteColumnId).visible,true);assert.equal(e.columns.find(c=>c.id===e.cueColumnId).label,'Fuel');
 assert.deepEqual(e.layout,createEvent().layout);const s=initial();s.events.push(e,createEvent('flanders'));const loaded=parseState(serializeState(s));assert.equal(loaded.events.length,3);assert.equal(loaded.presets.length,0);assert.notEqual(loaded.events[1].id,loaded.events[2].id);
});
