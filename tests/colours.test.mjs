import test from 'node:test';
import assert from 'node:assert/strict';
import {createEvent,initialState,serializeState,parseState,validateEvent,exportCSV,importCSV,sortCuesByPosition,moveCue,clone,uid} from '../dist/core.js';
import {ICON_COLOURS,setIconColour,iconColour} from '../dist/icon-colours.js';
import {presetChange} from '../dist/preset-actions.js';
import {PlanHistory} from '../dist/history.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';
test('legacy/new monochrome is byte-stable; colour allowlist rejects arbitrary styling',()=>{
 const s=initialState(),raw=serializeState(s);assert.equal(serializeState(parseState(raw)),raw);assert.ok(s.events[0].rows.distance.every(r=>r.iconColour===undefined));assert.equal(iconColour().value,null);
 for(const c of ICON_COLOURS){const e=createEvent();setIconColour(e.rows.distance[0],c.id);assert.equal(iconColour(validateEvent(e).rows.distance[0].iconColour).id,c.id);}
 for(const bad of ['cyan','#f00','url(https://example.com)',null,1,'Blue']){const e=createEvent();e.rows.distance[0].iconColour=bad;assert.throws(()=>validateEvent(e),/Invalid cue icon colour/);}
});
test('colour stays attached to stable row identity through sort, reorder, None and history',()=>{
 const e=createEvent(),row=e.rows.distance[0],id=row.id;setIconColour(row,'blue');const before=JSON.stringify(e);assert.equal(setIconColour(row,'blue'),false);row.cells[e.columns[0].id]=130000;sortCuesByPosition(e.rows.distance,e.columns[0].id);assert.equal(e.rows.distance.at(-1).id,id);assert.equal(e.rows.distance.at(-1).iconColour,'blue');moveCue(e.rows.distance,id,1);row.symbol='';assert.equal(row.iconColour,'blue');row.symbol='bottle';
 const h=new PlanHistory();h.record(e.id,before,JSON.stringify(e),'edit position');assert.equal(JSON.parse(h.peek(e.id,'undo').snapshot).rows.distance[0].iconColour,'blue');h.accept(e.id,'undo');assert.equal(JSON.parse(h.peek(e.id,'redo').snapshot).rows.distance[1].id,id);
 assert.equal(setIconColour(row,'default'),true);assert.equal(row.iconColour,undefined);assert.equal(setIconColour(row,'default'),false);
});
test('colours and grid survive JSON, duplication, preset update/recovery without altering existing plans',()=>{
 let s=initialState();s.active=s.events[0].id;setIconColour(s.events[0].rows.distance[0],'orange');s.events[0].layout.grid='full';s=presetChange(s,'new',{name:'Colour template'});const id=s.presets[0].id;
 const duplicate=clone(s.events[0]);duplicate.id=uid();s.events.push(duplicate);setIconColour(s.events[0].rows.distance[0],'purple');s.events[0].layout.grid='none';s=presetChange(s,'update',{id});assert.equal(s.events[1].rows.distance[0].iconColour,'orange');assert.equal(s.presets[0].previous.event.layout.grid,'full');s=presetChange(s,'recover',{id});s=parseState(serializeState(s));assert.equal(s.presets[0].event.rows.distance[0].iconColour,'orange');assert.equal(s.presets[0].previous.event.rows.distance[0].iconColour,'purple');
 s=presetChange(s,'use',{id});assert.equal(s.events.at(-1).layout.grid,'full');assert.equal(s.events.at(-1).rows.distance[0].iconColour,'orange');
});
test('versioned CSV colours preserve icon IDs and Note/custom cell alignment; legacy CSV stays unchanged',()=>{
 const e=createEvent('flanders');setIconColour(e.rows.distance[0],'blue');setIconColour(e.rows.distance[1],'orange');e.rows.distance[0].symbol='can';e.layout.grid='full';const csv=exportCSV(e),loaded=importCSV(csv);assert.match(csv,/icon-colour/);assert.equal(loaded.layout.grid,undefined);
 assert.deepEqual(loaded.rows.distance.map(r=>[r.symbol,r.iconColour??'default',...loaded.columns.map(c=>r.cells[c.id])]),e.rows.distance.map(r=>[r.symbol,r.iconColour??'default',...e.columns.map(c=>r.cells[c.id])]));
 const old=exportCSV(createEvent());assert.doesNotMatch(old,/icon-colour/);assert.ok(importCSV(old).rows.distance.every(r=>!r.iconColour));
 for(const bad of ['ultraviolet','blue;fill:red',''])assert.throws(()=>importCSV(csv.replace('"blue"',`"${bad}"`)),/Invalid cue icon colour/);
 assert.throws(()=>importCSV(csv.replace('icon-colour"",1','icon-colour"",2')),/Unsupported/);
});
test('CSV hides columns without shifting colour or cue values, and reserves literal metadata-like labels',()=>{
 const e=createEvent();setIconColour(e.rows.distance[0],'red');e.columns[1].label='stemtape:column:example';const round=importCSV(exportCSV(e));assert.equal(round.columns[1].label,'stemtape:column:example');assert.equal(round.rows.distance[0].iconColour,'red');
 e.columns[1].visible=false;const minimal=importCSV(exportCSV(e));assert.equal(minimal.columns[1].label,'Fuel');assert.equal(minimal.rows.distance[0].iconColour,'red');assert.equal(minimal.rows.distance[0].cells[minimal.columns[1].id],'');
});
test('new styling counts toward the unchanged UTF-8 budget without damaging source',()=>{
 const s=byteBudgetFixture(),before=serializeState(s),candidate=clone(s);setIconColour(candidate.events[0].rows.distance[0],'blue');candidate.events[0].layout.grid='full';assert.throws(()=>serializeState(candidate),/2,000,000/);assert.equal(serializeState(s),before);
});
test('time CSV keeps remembered distance units/custom distances and None colour metadata aligned',()=>{
 const e=createEvent(),extra={id:uid(),label:'Water [km]',type:'distance',width:25,visible:true,align:'right',bold:false};e.columns.push(extra);e.mode='time';e.unit='mi';const r=clone(e.rows.distance[0]);r.symbol='';r.cells[e.columns[0].id]=95;r.cells[extra.id]=1609.344;r.iconColour='orange';e.rows.time=[r];for(const row of e.rows.distance)row.cells[extra.id]=1000;
 const loaded=importCSV(exportCSV(e)),row=loaded.rows.time[0];assert.equal(loaded.mode,'time');assert.equal(row.symbol,'');assert.equal(row.iconColour,'orange');assert.equal(row.cells[loaded.columns[0].id],95);assert.equal(row.cells[loaded.columns[2].id],1609.344);assert.equal(loaded.columns[2].label,'Water [km]');
});
