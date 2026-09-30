// Runs from browser.mjs; isolated synthetic data only. No production/local personal data.
import assert from 'node:assert/strict';
import {initialState,serializeState,clone,uid,column,LIMITS} from '../dist/core.js';
export async function reviewRegressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const load=async s=>{await page.goto(base);await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),typeof s==='string'?s:serializeState(s));await page.reload();await page.evaluate(()=>document.fonts.ready);};
 const stored=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 const fresh=()=>{const s=initialState();s.active=s.events[0].id;return s;};
 try{
  // Invalid drafts survive every full-render entry point; correction and cancellation work.
  const s=fresh();s.events.push({...clone(s.events[0]),id:uid()});await load(s);
  const position=page.locator('#editor-rows input').first();await position.fill('-1');const before=await stored();
  for(const selector of ['#sort','#add-row','#new-event','#duplicate-event','#delete-event','#mode-time','#column-settings','[data-theme=dark]','[data-move=down]','[data-move=trash]']){
   await page.locator(selector).first().click();assert.equal(await position.inputValue(),'-1',selector);assert.equal(await stored(),before,selector);
  }
  for(const [selector,value] of [['#event-select',s.events[1].id],['#unit','mi'],['#dimension-unit','in'],['#preset','custom']]){
   await page.locator(selector).selectOption(value);assert.equal(await stored(),before,selector);assert.equal(await position.inputValue(),'-1');
  }
  const handle=page.locator('.drag-handle').first();await handle.focus();await handle.press('End');assert.equal(await stored(),before);
  await handle.dispatchEvent('pointerdown',{pointerId:7,isPrimary:true,button:0,clientX:50,clientY:50,pointerType:'touch'});
  assert.equal(await page.locator('.dragging').count(),0);assert.equal(await stored(),before);
  await position.fill('21');await position.press('Enter');assert.equal(JSON.parse(await stored()).events[0].rows.distance[0].cells[s.events[0].columns[0].id],21000);
  await position.fill('-2');await page.locator('#cancel-edits').click();assert.equal(await position.inputValue(),'21');
  await page.locator('#mode-time').click();await page.locator('#add-row').click();const time=page.locator('#editor-rows input').first();await time.fill('1:99');await page.locator('#mode-distance').click();assert.equal(await time.inputValue(),'1:99');await time.press('Escape');assert.equal(await time.inputValue(),'0:00');
  // Miles invalid total never reaches storage; unit change is blocked until cancellation.
  await load(fresh());await page.locator('#unit').selectOption('mi');await page.locator('summary').click();
  const total=page.locator('#total');assert.ok(Number(await total.getAttribute('max'))<10000);const validTotal=await stored();
  await total.fill('10000');await total.press('Tab');assert.equal(await stored(),validTotal);
  await page.locator('#unit').selectOption('km');assert.equal(await page.locator('#unit').inputValue(),'mi');await total.press('Escape');
  await total.fill('100');await total.press('Tab');assert.ok(Math.abs(JSON.parse(await stored()).events[0].totalM-160934.4)<1e-8);
  // Arrow activation preserves identity/focus, including arrival at a boundary and blur sort.
  await load(fresh());const id=await page.locator('#editor-rows tr').first().getAttribute('data-row-id');const row=page.locator(`[data-row-id="${id}"]`);
  await row.locator('[data-move=down]').focus();await row.locator('[data-move=down]').press('Enter');
  assert.equal(await row.locator('[data-move=down]').evaluate(n=>n===document.activeElement),true);
  await row.locator('[data-move=up]').press('Enter');assert.equal(await row.locator('[data-move=up]').evaluate(n=>n===document.activeElement),true);
  assert.equal(await row.locator('[data-move=up]').getAttribute('aria-disabled'),'true');assert.match(await page.locator('#reorder-status').textContent(),/position 1/);
  await row.locator('input').first().fill('90');await row.locator('[data-move=down]').click();
  await page.waitForFunction(id=>document.querySelectorAll('#editor-rows tr')[4]?.dataset.rowId===id,id);
  assert.equal(await row.locator('[data-move=down]').evaluate(n=>n===document.activeElement),true);
  const manual=await stored();await page.reload();assert.equal(await stored(),manual);
  // Equal-position edits retain tie identity order, then manual ordering survives reload.
  await load(fresh());const tieRows=await page.locator('#editor-rows tr').evaluateAll(rows=>rows.map(r=>r.dataset.rowId));
  const tie=page.locator(`[data-row-id="${tieRows[0]}"] input`).first();await tie.fill('60');await tie.press('Tab');
  await page.waitForFunction(id=>document.querySelectorAll('#editor-rows tr')[1]?.dataset.rowId===id,tieRows[0]);
  assert.equal(await page.locator('#editor-rows tr').nth(2).getAttribute('data-row-id'),tieRows[2]);
  await page.locator(`[data-row-id="${tieRows[0]}"] .drag-handle`).press('End');const tieManual=await stored();await page.reload();assert.equal(await stored(),tieManual);
  // Whole-state budget rejection for both structural changes and multibyte input.
  const near=fresh(),e=near.events[0];e.columns.push(...Array.from({length:6},()=>column('Extra')));
  for(const mode of ['distance','time'])e.rows[mode]=Array.from({length:200},(_,i)=>({id:uid(),symbol:'',cells:Object.fromEntries(e.columns.map((c,j)=>[c.id,j===0?i:'']))}));
  near.events.push({...clone(e),id:uid()});near.presets.push({name:'Budget',event:clone(e)});
  let remaining=LIMITS.bytes-Buffer.byteLength(serializeState(near));
  for(const ev of [...near.events,...near.presets.map(p=>p.event)])for(const mode of ['distance','time'])for(const r of ev.rows[mode])for(const c of ev.columns.slice(1)){const n=Math.min(remaining,320);r.cells[c.id]='é'.repeat(Math.floor(n/2))+'x'.repeat(n%2);remaining-=n;}
  assert.equal(remaining,0);await load(near);const full=await stored();await page.locator('#duplicate-event').click();assert.equal(await stored(),full);assert.equal(await page.locator('#event-select option').count(),2);
  await page.locator('#event-name').fill(near.events[0].name+'🍌');assert.equal(await stored(),full);assert.equal(await page.locator('#event-name').inputValue(),near.events[0].name+'🍌');await page.locator('#event-name').press('Escape');
  await page.locator('#export').click();const [backup]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'JSON · complete backup',exact:true}).click()]);
  const stream=await backup.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);const raw=Buffer.concat(chunks);assert.equal(raw.length,LIMITS.bytes);
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:raw});await page.getByRole('button',{name:'Restore backup',exact:true}).click();assert.equal(await stored(),full);
  // Oversized original is preserved byte-for-byte and export offered before replacement.
  const oversized=full+' ';await load(oversized);assert.equal(await stored(),oversized);assert.equal(await page.locator('#dialog').getAttribute('aria-labelledby'),'dialog-title');
  const [recovery]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export original recovery data',exact:true}).click()]);
  const recoveryStream=await recovery.createReadStream();const recoveryChunks=[];for await(const chunk of recoveryStream)recoveryChunks.push(chunk);assert.equal(Buffer.concat(recoveryChunks).toString(),oversized);
  await page.locator('#close-dialog').click();await page.locator('#event-name').fill('Temporary');assert.equal(await stored(),oversized);
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(serializeState(fresh()))});
  assert.equal(await page.getByRole('button',{name:'Export original recovery data',exact:true}).count(),1);assert.equal(await page.getByRole('button',{name:'Back up temporary in-memory plan',exact:true}).count(),1);
  await page.locator('#close-dialog').click();assert.equal(await stored(),oversized);
  // Storage failure status remains visible on mobile.
  await load(fresh());await page.evaluate(()=>Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');});await page.locator('#event-name').fill('Still exportable');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#save-status').isVisible(),true);assert.match(await page.locator('#save-status').textContent(),/Not saved/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
}
