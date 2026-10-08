import assert from 'node:assert/strict';
import {initialState,serializeState,parseState,exportCSV,importCSV} from '../dist/core.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';

export async function v060Regressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100},hasTouch:true,acceptDownloads:true}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let phase='legacy fixture';
 const raw=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 const plan=async()=>{const s=JSON.parse(await raw());return s.events.find(e=>e.id===s.active);};
 const ready=()=>page.waitForFunction(()=>document.fonts.status==='loaded'&&document.querySelector('#sheet-preview svg'));
 const seed=async s=>{await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(s));await page.reload();await ready();};
 const item=id=>page.locator(`#column-order-list [data-column-id="${id}"]`);
 const cell=id=>page.locator(`#editor-rows input[data-column-id="${id}"]`);
 const openSettings=async()=>{const summary=page.locator('.more-settings > summary');if(!await page.locator('.more-settings').evaluate(n=>n.open))await summary.click();};
 try{
  await page.goto(base);await ready();const s=initialState(),e=s.events[0];s.active=e.id;e.rows.distance=e.rows.distance.slice(0,1);
  const first=e.columns[0].id,cue=e.columns[1].id;e.rows.time=[{id:'time-row',symbol:'gel',cells:{[first]:60,[cue]:'Drink'}}];
  Object.assign(e.layout,{width:80,length:110,footerEnabled:true,footerText:'Go'});e.rows.distance[0].symbol='bar';
  await seed(s);assert.equal(await page.locator('#show-note').isChecked(),false,'Old plans do not create Note metadata on load');assert.equal((await plan()).noteColumnId,undefined);
  await openSettings();const originalSheet=await page.locator('#sheet-preview').innerHTML();
  assert.match(await item(first).textContent(),/Fixed first/);assert.equal(await item(first).locator('button').count(),0,'Primary column has no movement controls');
  phase='Note creation and identity';await page.locator('#show-note').check();const note=(await plan()).noteColumnId;
  assert.deepEqual((await plan()).columns.map(c=>c.id),[first,note,cue]);assert.equal((await plan()).cueColumnId,cue);
  assert.deepEqual(await page.locator('#sheet-preview svg > g > text').evaluateAll(nodes=>nodes.slice(0,3).map(n=>n.textContent)),['km','Note','Fuel'],'Preview headers follow the selected column order');
  assert.ok(Math.abs(await page.locator('#sheet-preview svg svg').evaluate(n=>Number(n.getAttribute('x')))-(2+76*57/125))<1e-8,'Icon stays with Fuel when Note is inserted');
  await cell(note).fill('Bridge 🍌');assert.equal((await plan()).rows.distance[0].cells[note],'Bridge 🍌');
  assert.equal(await item(note).getByRole('button',{name:'Move left',exact:true}).isDisabled(),true);
  assert.equal(await item(cue).getByRole('button',{name:'Move right',exact:true}).isDisabled(),true);
  phase='Movement and keyboard focus';await item(note).getByRole('button',{name:'Move right',exact:true}).click();
  assert.deepEqual((await plan()).columns.map(c=>c.id),[first,cue,note]);
  assert.deepEqual(await page.locator('#sheet-preview svg > g > text').evaluateAll(nodes=>nodes.slice(0,3).map(n=>n.textContent)),['km','Fuel','Note'],'Preview moves the complete header with its column');
  assert.ok(Math.abs(await page.locator('#sheet-preview svg svg').evaluate(n=>Number(n.getAttribute('x')))-(2+76*32/125))<1e-8,'Icon follows the same Fuel column after movement');
  assert.equal(await item(note).locator('.column-drag-handle').evaluate(n=>n===document.activeElement),true,'Boundary movement restores focus to the same column handle');
  assert.match(await page.locator('#column-order-status').textContent(),/position 3/);
  await item(note).locator('.column-drag-handle').press('Home');assert.deepEqual((await plan()).columns.map(c=>c.id),[first,note,cue]);
  assert.equal(await item(note).locator('.column-drag-handle').evaluate(n=>n===document.activeElement),true);
  const rows=(await plan()).rows;await item(note).locator('.column-drag-handle').press('End');assert.deepEqual((await plan()).rows,rows,'Column movement does not sort cues or change either mode list');
  phase='Note rename/hide/reload';await page.locator('#column-details').click();
  const config=page.locator(`#dialog-body .column-config[data-column-id="${note}"]`);
  await config.getByLabel('Name',{exact:true}).fill('Location');assert.equal(await config.getAttribute('aria-label'),'Column Location');assert.equal(await config.getByLabel('Field type',{exact:true}).isDisabled(),true);
  assert.equal(await config.getByRole('button',{name:'Remove',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'Done',exact:true}).click();await page.locator('#show-note').uncheck();
  assert.equal(await cell(note).isVisible(),false);assert.equal((await plan()).rows.distance[0].cells[note],'Bridge 🍌');
  assert.equal(await page.locator('#sheet-preview').innerHTML(),originalSheet,'Hiding Note restores the original sheet geometry including its footer');
  await page.reload();await ready();await openSettings();await page.locator('#show-note').check();
  assert.equal((await plan()).columns[2].id,note);assert.equal((await plan()).columns[2].label,'Location');assert.equal(await cell(note).inputValue(),'Bridge 🍌');
  const csv=exportCSV(await plan()),imported=importCSV(csv);assert.equal(imported.columns[2].label,'Location');assert.equal(imported.rows.distance[0].cells[imported.noteColumnId],'Bridge 🍌');assert.equal(imported.columns.length,3);
  phase='Invalid time drafts';await page.locator('#mode-time').click();await cell(first).fill('bad');const before=await raw();
  await item(note).getByRole('button',{name:'Move left',exact:true}).click();await page.locator('#show-note').click();
  assert.equal(await cell(first).inputValue(),'bad');assert.equal(await raw(),before);assert.equal(await page.locator('#show-note').isChecked(),true);
  await cell(first).press('Escape');await page.locator('#mode-distance').click();
  phase='Quota failure';const prior=await raw();await page.evaluate(()=>{window.columnWrite=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('quota','QuotaExceededError');};});
  await item(note).getByRole('button',{name:'Move left',exact:true}).click();assert.equal(await raw(),prior);assert.match(await page.locator('#save-status-label').textContent(),/Not saved/);assert.equal(await page.locator('#save-status').getAttribute('data-saved'),'false');
  await page.evaluate(()=>Storage.prototype.setItem=window.columnWrite);await cell(note).fill('Bridge');
  phase='JSON restore and duplicate';const backup=await raw();assert.equal(parseState(backup).events[0].noteColumnId,note);
  await page.locator('#duplicate-event').click();assert.equal((await plan()).noteColumnId,note);assert.equal((await plan()).columns.length,3);
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'columns.json',mimeType:'application/json',buffer:Buffer.from(backup)});
  await page.getByRole('heading',{name:'Restore backup?',exact:true}).waitFor({timeout:10000});await page.getByRole('button',{name:'Restore backup',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('#event-select option').length===1);
  assert.equal((await plan()).noteColumnId,note);assert.equal((await plan()).rows.distance[0].cells[note],'Bridge');
  phase='Preview/print/footer rotations';await openSettings();await page.evaluate(()=>window.print=()=>{});
  for(const rotation of [0,90,180,270]){
   await page.locator('#rotation').selectOption(String(rotation));assert.equal(await page.locator('#print').isEnabled(),true,`80 × 110 sheet fits at rotation ${rotation}`);
   await page.locator('#print').click();await page.waitForFunction(()=>document.querySelector('#print-pages [data-footer]')?.textContent==='Go');
   const printed=page.locator('#print-pages svg[aria-label="Printable cue sheet"]');assert.equal(await printed.count(),1);
   assert.equal(await printed.locator(':scope > g').evaluate(n=>n.outerHTML),await page.locator('#sheet-preview svg > g').evaluate(n=>n.outerHTML));
   assert.deepEqual(await printed.evaluate(n=>[n.getAttribute('width'),n.getAttribute('height')]),['80','110']);
  }
  phase='Mobile native emulated touch';await page.setViewportSize({width:390,height:844});await page.locator('.mobile-tabs button[data-tab="preview"]').click();
  await page.locator('.preview-card').waitFor({state:'visible',timeout:5000});await openSettings();
  await item(note).scrollIntoViewIfNeeded();const handle=await item(note).locator('.column-drag-handle').boundingBox(),target=await item(cue).boundingBox();
  const cdp=await context.newCDPSession(page),beforeTouch=await raw();
  const touch=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1}]});
  const x=handle.x+handle.width/2,y=handle.y+handle.height/2,toY=target.y+target.height-2;
  await touch('touchStart',x,y);await touch('touchMove',x,toY);await page.waitForFunction(()=>document.querySelector('.column-order-item.dragging'));
  assert.equal(await raw(),beforeTouch,'A pending touch gesture has not written storage');await touch('touchCancel',x,toY);
  assert.equal(await raw(),beforeTouch,'Cancelled touch movement preserves saved order');
  const h=await item(note).locator('.column-drag-handle').boundingBox(),t=await item(cue).boundingBox();
  await touch('touchStart',h.x+h.width/2,h.y+h.height/2);await touch('touchMove',h.x+h.width/2,t.y+t.height-2);await touch('touchEnd',0,0);
  await page.waitForFunction(id=>JSON.parse(localStorage.getItem('stemtape.v1')).events[0].columns[2].id===id,note,{timeout:5000});
  assert.equal((await plan()).columns[0].id,first);assert.equal(await item(note).locator('.column-drag-handle').evaluate(n=>n===document.activeElement),true);
  for(const theme of ['light','dark']){await page.getByRole('button',{name:theme==='light'?'Light theme':'Dark theme',exact:true}).click();await page.screenshot({path:`artifacts/v060-mobile-${theme}.png`,fullPage:true});}
  phase='Narrow sheet overflow';await page.locator('#rotation').selectOption('0');await page.locator('#width').fill('32');await page.locator('#width').press('Tab');
  await page.locator('.mobile-tabs button[data-tab="edit"]').click();await cell(note).fill('W'.repeat(160));assert.equal(await page.locator('#print').isDisabled(),true,'Narrow sheet overflow blocks printing without changing its size');assert.equal((await plan()).layout.width,32);
  phase='Exact-budget creation rollback';await seed(byteBudgetFixture());await page.locator('.mobile-tabs button[data-tab="preview"]').click();await openSettings();
  const full=await raw();await page.locator('#show-note').click();assert.equal(await raw(),full);assert.equal(await page.locator('#show-note').isChecked(),false);assert.equal((await plan()).columns.length,2);
  assert.deepEqual(errors,[]);
 }catch(err){
  try{console.error('v0.6.0 browser diagnostics',JSON.stringify({phase,errors,state:await page.evaluate(()=>({view:document.body.dataset.tab??'edit',invalid:document.querySelectorAll('input:invalid').length,columns:document.querySelectorAll('#column-order-list li').length,save:document.querySelector('#save-status-label')?.textContent,focusedTag:document.activeElement?.tagName}))}));}catch{}
  throw err;
 }finally{await context.close();}
}
