import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,serializeState,parseState,validateEvent,exportCSV,importCSV,clone} from '../dist/core.js';
import {SaveSession} from '../dist/save-status.js';
import {footerGeometry} from '../dist/footer.js';
import {ICONS} from '../dist/icons.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';

test('old plans retain byte representation with footer disabled by absence',()=>{
 const s=initialState(),raw=serializeState(s),restored=parseState(raw);
 assert.equal(serializeState(restored),raw);assert.equal(restored.events[0].layout.footerEnabled??false,false);
 const full=byteBudgetFixture();assert.equal(Buffer.byteLength(serializeState(full)),2_000_000);
 assert.equal(serializeState(parseState(serializeState(full))),serializeState(full));
});
test('footer text and settings round-trip in both modes, duplicates and personal presets',()=>{
 const s=initialState(),e=s.events[0];Object.assign(e.layout,{footerEnabled:true,footerText:'Ride <safe> & smile 🍌'});
 e.mode='time';s.presets.push({name:'Footer',event:clone(e)});const duplicate=clone(e);duplicate.id='duplicate';s.events.push(duplicate);
 const copy=parseState(serializeState(s));assert.equal(copy.events[1].layout.footerText,e.layout.footerText);assert.equal(copy.presets[0].event.layout.footerEnabled,true);
 e.layout.footerEnabled=false;assert.equal(parseState(serializeState(s)).events[0].layout.footerText,'Ride <safe> & smile 🍌');
 e.layout.footerEnabled=true;assert.equal(e.layout.footerText,'Ride <safe> & smile 🍌');
});
test('footer validates boolean, single-line Unicode and 80 UTF-16-unit limit',()=>{
 const e=initialState().events[0];e.layout.footerText='🍌'.repeat(40);assert.equal(validateEvent(e).layout.footerText.length,80);
 for(const text of ['x'.repeat(81),'🍌'.repeat(41),'a\nb','a\rb','a\tb','a\u2028b']){e.layout.footerText=text;assert.throws(()=>validateEvent(e),/footer|Footer/);}
 e.layout.footerText='';e.layout.footerEnabled='true';assert.throws(()=>validateEvent(e),/footer/);
});
test('footer settings never add rows or metadata to cue CSV',()=>{
 const e=initialState().events[0],before=exportCSV(e);Object.assign(e.layout,{footerEnabled:true,footerText:'Not a cue 🍌'});
 assert.equal(exportCSV(e),before);assert.equal(importCSV(before).layout.footerEnabled??false,false);
});
test('footer budget includes metadata/multibyte text; quota failure preserves prior atomic state',()=>{
 const overhead=Buffer.byteLength(',"footerEnabled":true,"footerText":"🍌"');
 const s=byteBudgetFixture(2_000_000-overhead);Object.assign(s.events[0].layout,{footerEnabled:true,footerText:'🍌'});
 assert.equal(Buffer.byteLength(serializeState(s)),2_000_000);assert.equal(parseState(serializeState(s)).events[0].layout.footerText,'🍌');
 let raw=serializeState(s);const previous=raw;let fail=false;
 const session=new SaveSession({raw,read:()=>raw,write:value=>{if(fail)throw Error('quota');raw=value;},now:()=>1791374400000});
 assert.equal(session.save(s).ok,true);assert.equal(session.timePersisted,false);
 s.events[0].layout.footerText+='a';assert.throws(()=>session.save(s),/bytes/);assert.equal(raw,previous);
 s.events[0].layout.footerText='X';fail=true;assert.equal(session.save(s).ok,false);assert.equal(raw,previous);assert.equal(session.view().success,false);
});
test('footer reserves no space if off or empty; measures horizontal ink and vertical bounds',()=>{
 const l={...initialState().events[0].layout,footerEnabled:true,footerText:'Go'};
 assert.equal(footerGeometry({...l,footerEnabled:false},20,{width:100}),null);
 assert.equal(footerGeometry({...l,footerText:' '},20,{width:100}),null);
 const good=footerGeometry(l,20,{width:6});assert.deepEqual(good.warnings,[]);assert.equal(good.x,16);
 assert.match(footerGeometry(l,20,{width:29}).warnings[0],/wide/);
 assert.match(footerGeometry(l,20,{width:2,actualBoundingBoxRight:30}).warnings[0],/wide/);
 assert.match(footerGeometry(l,85,{width:6}).warnings[0],/length/);
});
test('footer uses rotated content dimensions, without changing requested sheet dimensions',()=>{
 const l={...initialState().events[0].layout,footerEnabled:true,footerText:'Go'};
 for(const rotation of [0,90,180,270]){
  const r=footerGeometry({...l,rotation},10,{width:40});assert.equal(r.x,rotation%180?45:16);
  assert.equal(r.warnings.some(x=>x.includes('wide')),rotation%180===0);
 }
 assert.equal(l.width,32);assert.equal(l.length,90);
});
test('existing approved icon keys remain valid through storage and CSV with local geometry',()=>{
 for(const key of ['bar','bottle','gel','cobbles']){
  const s=initialState();s.events[0].rows.distance[0].symbol=key;
  assert.equal(parseState(serializeState(s)).events[0].rows.distance[0].symbol,key);
  assert.equal(importCSV(exportCSV(s.events[0])).rows.distance[0].symbol,key);
  assert.ok(ICONS[key].length>0);for(const [tag,attrs]of ICONS[key]){assert.ok(['path','circle'].includes(tag));assert.equal('href' in attrs,false);}
 }
 assert.equal(ICONS.bar.filter(([tag])=>tag==='circle').length,2);assert.equal(ICONS.gel.length,2);
});
