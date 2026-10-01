import assert from 'node:assert/strict';
import {initialState,clone,uid,column} from '../dist/core.js';

// Independent test oracle: do not size fixtures with the application's serializer.
export const EXPECTED_BYTE_LIMIT=2_000_000;
export const stateBytes=state=>Buffer.byteLength(JSON.stringify(state),'utf8');
export function byteBudgetFixture(targetBytes=EXPECTED_BYTE_LIMIT){
 const state=initialState();state.active=state.events[0].id;
 // Keep the active editor/preview small; bulk exercises storage, not SVG stress.
 const event=clone(state.events[0]);event.id=uid();event.columns.push(...Array.from({length:6},()=>column('Extra')));
 for(const mode of ['distance','time'])event.rows[mode]=Array.from({length:200},(_,i)=>({
  id:uid(),symbol:'',cells:Object.fromEntries(event.columns.map((c,j)=>[c.id,j===0?i:'']))
 }));
 state.events.push(event);state.presets.push({name:'Budget',event:clone(event)});
 let remaining=targetBytes-stateBytes(state);
 assert.ok(remaining>=0,'Target must fit the fixture structure');
 for(const e of [...state.events.slice(1),...state.presets.map(p=>p.event)])for(const mode of ['distance','time'])for(const row of e.rows[mode])for(const c of e.columns.slice(1)){
  const n=Math.min(remaining,320);
  row.cells[c.id]='é'.repeat(Math.floor(n/2))+'x'.repeat(n%2);remaining-=n;
 }
 assert.equal(remaining,0,'Fixture text capacity must reach the target');
 assert.equal(stateBytes(state),targetBytes,'Independent UTF-8 fixture byte count');
 return state;
}
