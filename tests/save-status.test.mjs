import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,serializeState,parseState} from '../dist/core.js';
import {SaveSession,prepareSave,relativeSaveAge} from '../dist/save-status.js';
import {byteBudgetFixture,stateBytes} from './byte-budget-fixture.mjs';
const at=1_790_899_200_000;
function storage(raw=null){return {raw,writes:0,read(){return this.raw;},write(raw){this.writes++;this.raw=raw;}};}
function session(store,options={}){return new SaveSession({read:()=>store.read(),write:raw=>store.write(raw),raw:store.raw,now:()=>at,...options});}

test('successful save atomically persists data and time; relative display is read-only',()=>{
 const store=storage(),s=session(store),state=initialState();assert.equal(s.view().success,false);
 assert.equal(s.save(state).ok,true);assert.equal(store.writes,1);
 assert.equal(parseState(store.raw).savedAt,at);assert.equal(s.view().text,'✓ Saved just now');
 assert.equal(s.view({now:at+60000}).text,'✓ Saved 1 minute ago');
 assert.equal(s.view({now:at+720000}).text,'✓ Saved 12 minutes ago');
 assert.equal(s.view().exact,new Date(at).toISOString());assert.equal(store.writes,1);
});
test('reload keeps prior time; legacy data and unsaved defaults never receive invented times',()=>{
 const raw=prepareSave(initialState(),at).raw,store=storage(raw);
 const s=session(store,{savedAt:parseState(raw).savedAt,now:()=>at+720000});
 assert.equal(s.view().text,'✓ Saved 12 minutes ago');assert.equal(store.writes,0);
 const legacy=serializeState(initialState()),old=session(storage(legacy));
 assert.equal(old.view().text,'Stored on this device — save time unknown');assert.equal(old.lastSavedAt,null);
 assert.equal(session(storage()).view().text,'Not saved yet');
});
test('quota and blocked reads/writes retain the last successful time and previous atomic state',()=>{
 for(const operation of ['read','write']){
  const store=storage(),s=session(store);s.save(initialState());const previous=store.raw;
  store[operation]=()=>{throw Error('blocked');};assert.equal(s.save(initialState()).ok,false);
  assert.equal(store.raw,previous);assert.equal(s.lastSavedAt,at);assert.equal(s.view().success,false);
  assert.match(s.view().text,/Not saved/);assert.match(s.view().announcement,/Previous successful save/);
 }
 assert.match(session(storage(),{available:false}).view().text,/Not saved/);
});
test('invalid draft removes check without forgetting prior time; correction restores it',()=>{
 const s=session(storage());s.save(initialState());assert.equal(s.view({draft:true}).success,false);
 assert.match(s.view({draft:true}).text,/Not saved/);assert.equal(s.view({draft:true}).exact,new Date(at).toISOString());
 assert.equal(s.view({draft:false}).success,true);
});
test('recovery never writes or adopts fallback/import timestamps before explicit replacement',()=>{
 const original='unreadable original',store=storage(original),s=session(store,{savedAt:at,recovery:true});
 const state=initialState();state.savedAt=at-60000;
 assert.equal(s.lastSavedAt,null);assert.equal(s.save(state,{recovery:true}).blocked,true);
 assert.equal(store.raw,original);assert.equal(store.writes,0);assert.match(s.view().text,/original protected/);
 assert.equal(s.save(state).ok,true);assert.equal(parseState(store.raw).savedAt,at);
});
test('imports get the local successful write time, not a transported timestamp',()=>{
 const state=initialState();state.savedAt=at-600000;
 const store=storage(),s=session(store);s.save(parseState(serializeState(state)));
 assert.equal(parseState(store.raw).savedAt,at);
});
test('future times and backwards clocks are explicit, never negative ages',()=>{
 assert.equal(relativeSaveAge(at,at-1),'clock changed');assert.equal(relativeSaveAge(null,at),'time unknown');
 assert.equal(relativeSaveAge(at,at+3600000),'1 hour ago');assert.equal(relativeSaveAge(at,at+86400000),'1 day ago');
 const store=storage(),s=session(store,{now:()=>NaN});assert.equal(s.save(initialState()).ok,true);
 assert.equal(s.lastSavedAt,null);assert.equal(Object.hasOwn(parseState(store.raw),'savedAt'),false);
});
test('stale tabs and external removal cannot silently overwrite other stored state',()=>{
 const store=storage(),a=session(store),b=session(store);a.save(initialState());const latest=store.raw;
 b.observe(latest);assert.equal(b.view().success,false);assert.match(b.view().text,/another tab/);
 assert.equal(b.save(initialState()).conflict,true);assert.equal(store.raw,latest);
 store.raw=null;a.observe(null);assert.equal(a.save(initialState()).conflict,true);assert.equal(store.raw,null);
});
test('optional save time validates and round-trips without migrating legacy state',()=>{
 const legacy=serializeState(initialState());assert.equal(serializeState(parseState(legacy)),legacy);
 const state=initialState();state.savedAt=at;assert.equal(parseState(serializeState(state)).savedAt,at);
 for(const bad of [null,-1,0,1.1,'today',NaN,Infinity,8640000000000001]){
  state.savedAt=bad;assert.throws(()=>serializeState(state),/timestamp/);
 }
});
test('metadata budget includes its UTF-8 bytes and yields to complete plan data at the boundary',()=>{
 const overhead=Buffer.byteLength(',"savedAt":'+at,'utf8');
 const exact=byteBudgetFixture(2_000_000-overhead),withTime=prepareSave(exact,at);
 assert.equal(Buffer.byteLength(withTime.raw,'utf8'),2_000_000);assert.equal(parseState(withTime.raw).savedAt,at);
 const oneMore=byteBudgetFixture(2_000_000-overhead+1),withoutTime=prepareSave(oneMore,at);
 assert.equal(withoutTime.savedAt,null);assert.equal(stateBytes(parseState(withoutTime.raw)),2_000_000-overhead+1);
 const full=byteBudgetFixture(),result=prepareSave(full,at);
 assert.equal(Buffer.byteLength(result.raw,'utf8'),2_000_000);assert.equal(result.savedAt,null);
 assert.deepEqual(parseState(result.raw),parseState(serializeState(full)));
 full.events[0].name+='🍌';assert.throws(()=>prepareSave(full,at),/UTF-8 bytes/);
});
