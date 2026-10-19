import test from 'node:test';
import assert from 'node:assert/strict';
import {createEvent,validateEvent} from '../dist/core.js';
import {GRID_STROKE,gridMode,setGridMode,gridGeometry} from '../dist/grid.js';
test('default/legacy grid mapping and allowlisted overrides preserve old dimensions',()=>{
 const e=createEvent(),l=structuredClone(e.layout);assert.equal(gridMode(l),'rows');for(const [lines,mode] of [[false,'none'],[true,'rows']]){e.layout.lines=lines;assert.equal(gridMode(validateEvent(e).layout),mode);}
 for(const mode of ['none','rows','full']){e.layout.grid=mode;assert.equal(gridMode(validateEvent(e).layout),mode);assert.equal(e.layout.width,l.width);}
 for(const bad of ['all','Full grid',true,null,1]){e.layout.grid=bad;assert.throws(()=>validateEvent(e),/Invalid grid mode/);}
 delete e.layout.grid;e.layout.lines='false';assert.throws(()=>validateEvent(e),/legacy row lines/);
});
test('grid choices are atomic/no-op aware and preserve legacy preference as history baseline',()=>{
 const l={lines:false};assert.equal(setGridMode(l,'none'),false);assert.equal(setGridMode(l,'full'),true);assert.equal(setGridMode(l,'full'),false);assert.equal(l.lines,false);assert.equal(setGridMode(l,'rows'),true);assert.throws(()=>setGridMode(l,'arbitrary'),/Invalid grid/);
});
test('shared grid draws each boundary once, inside padding, with bottom ink budget',()=>{
 const g=gridGeometry({left:2,right:30,top:2,bottom:25,widths:[8,10,10],rowEnds:[9,17,25]});
 const moves=g.path.match(/M[^M]+/g).map(x=>x.trim());assert.equal(moves.length,8);assert.equal(new Set(moves).size,8);assert.ok(g.path.includes('M10 2.075V25'));assert.ok(g.path.includes('M20 2.075V25'));assert.equal(g.inkBottom,25+GRID_STROKE/2);
 const hidden=gridGeometry({left:2,right:30,top:2,bottom:10,widths:[14,14],rowEnds:[10]});assert.equal(hidden.path.split(' ').filter(x=>x.startsWith('M')).length,5);assert.match(hidden.path,/M16 /);
});
