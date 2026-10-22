// Explicitly targets an already running v0.9.0 development server, never production.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {initialState,clone,uid} from '../dist/core.js';
import {presetChange} from '../dist/preset-actions.js';
const base=process.env.STEMTAPE_PREVIOUS_BASE;
if(!base)throw Error('Set STEMTAPE_PREVIOUS_BASE to a local v0.9.0 server.');
const url=new URL(base);assert.ok(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname));
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
let state=initialState();state.active=state.events[0].id;for(const c of state.events[0].columns)c.align=c.type==='distance'?'right':'left';state.events[0].name='Rollback fixture';state=presetChange(state,'new',{name:'Rollback preset'});state.presets[0].previous={name:'Previous',event:clone(state.presets[0].event)};const b=await chromium.launch();const context=await b.newContext(),page=await context.newPage();
try{
 await page.goto(base);assert.equal(await page.locator('.version').textContent(),'v0.9.0');
 for(const target of ['active plan','inactive plan','preset','recovery revision']){
  const s=clone(state);let cols;
  if(target==='active plan')cols=s.events[0].columns;
  if(target==='inactive plan'){const e=clone(s.events[0]);e.id=uid();e.name='Other';s.events.push(e);cols=e.columns;}
  if(target==='preset')cols=s.presets[0].event.columns;
  if(target==='recovery revision')cols=s.presets[0].previous.event.columns;
  cols[0].align='auto';const raw=JSON.stringify(s);
  const result=await page.evaluate(async raw=>{const {parseState}=await import('./core.js');try{parseState(raw);return 'accepted';}catch(e){return e.message;}},raw);assert.equal(result,'Invalid alignment.');
  await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),raw);await page.reload();assert.equal(await page.evaluate(()=>localStorage.getItem('stemtape.v1')),raw);assert.match(await page.locator('#dialog-body').textContent(),/unreadable|recovery/i);
  const safe=JSON.stringify(state);await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),safe);await page.reload();await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'auto.json',mimeType:'application/json',buffer:Buffer.from(raw)});await page.getByRole('heading',{name:'Import could not be completed'}).waitFor();assert.match(await page.locator('#dialog-body').textContent(),/Invalid alignment/);assert.equal(await page.evaluate(()=>localStorage.getItem('stemtape.v1')),safe);console.log(`PASS v0.9.0 Auto rejection: ${target}, parseState/startup recovery/JSON import unchanged`);
 }
 const s=clone(state);s.events[0].columns[1].cueDisplay='icon-only';s.events[0].layout.fitWidth=true;const raw=JSON.stringify(s);
 const normalized=await page.evaluate(async raw=>(await import('./core.js')).parseState(raw),raw);assert.equal(normalized.events[0].columns[1].cueDisplay,undefined);assert.equal(normalized.events[0].layout.fitWidth,undefined);
 await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),raw);await page.reload();assert.match(await page.locator('#sheet-preview').textContent(),/Banana/);await page.locator('#event-name').fill('Older save');const saved=JSON.parse(await page.evaluate(()=>localStorage.getItem('stemtape.v1')));assert.equal(saved.events[0].columns[1].cueDisplay,undefined);assert.equal(saved.events[0].layout.fitWidth,undefined);assert.equal(saved.events[0].rows.distance[0].cells[s.events[0].columns[1].id],'Banana');await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'display.json',mimeType:'application/json',buffer:Buffer.from(raw)});await page.getByRole('heading',{name:'Restore backup?'}).waitFor();console.log('PASS v0.9.0 explicit-alignment display-only rollback: startup/JSON accepted, presentation metadata dropped on validation/save, text retained');
}finally{await context.close();await b.close();}
