// Runs from browser.mjs; isolated synthetic data only. No production/local personal data.
import assert from 'node:assert/strict';
import {browserDiagnostics,fixtureSummary} from './browser-diagnostics.mjs';
import {isDeepStrictEqual} from 'node:util';
import {initialState,serializeState,clone,uid} from '../dist/core.js';
import {EXPECTED_BYTE_LIMIT,byteBudgetFixture,stateBytes} from './byte-budget-fixture.mjs';
export async function reviewRegressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const diagnostics=browserDiagnostics(page);
 const ready=()=>page.waitForFunction(()=>{
  const raw=localStorage.getItem('stemtape.v1');let expected;
  try{const s=JSON.parse(raw);if(new TextEncoder().encode(raw).length<=2_000_000)expected=s.events.find(e=>e.id===s.active)||s.events[0];}catch{}
  return document.fonts.status==='loaded'&&!!document.querySelector('#sheet-preview svg[aria-label="Printable cue sheet"]')
   &&document.getElementById('fit-status').textContent.length>0
   &&(!expected||(document.getElementById('event-select').value===expected.id
    &&document.querySelectorAll('#editor-rows tr').length===expected.rows[expected.mode].length));
 },null,{timeout:10000});
 const reload=async name=>{diagnostics.phase(name,fixtureSummary(await stored()));await page.reload();await ready();diagnostics.phase(name+' ready');};
 const load=async s=>{
  const raw=typeof s==='string'?s:serializeState(s);diagnostics.phase('seed fixture',fixtureSummary(raw));
  if(page.url()==='about:blank')await page.goto(base);
  await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),raw);await reload('load fixture');
 };
 const stored=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 const fresh=()=>{const s=initialState();s.active=s.events[0].id;return s;};
 // Failure messages report sizes/validation only, never complete saved plans.
 const budgetDiagnostics=async(phase,expectedSavedBytes)=>JSON.stringify(await page.evaluate(({phase,expectedSavedBytes,limit})=>{
  const raw=localStorage.getItem('stemtape.v1'),state=JSON.parse(raw),input=document.getElementById('event-name');
  const active=state.events.find(e=>e.id===state.active),events=[...state.events,...state.presets.map(p=>p.event)];
  const savedBytes=new TextEncoder().encode(raw).length;
  if(active)active.name=input.value;
  return {phase,limit,expectedSavedBytes,savedBytes,candidateBytes:new TextEncoder().encode(JSON.stringify(state)).length,
   eventCount:state.events.length,presetCount:state.presets.length,
   distanceRows:events.reduce((n,e)=>n+e.rows.distance.length,0),timeRows:events.reduce((n,e)=>n+e.rows.time.length,0),
   activeMatchesSelection:state.active===document.getElementById('event-select').value,
   valid:input.validity.valid,customError:input.validity.customError,validationMessage:input.validationMessage,
   invalidInputs:document.querySelectorAll('input:invalid,textarea:invalid').length,
   feedback:document.getElementById('toast').textContent};
 },{phase,expectedSavedBytes,limit:EXPECTED_BYTE_LIMIT}));
 try{
  // Invalid drafts survive every full-render entry point; correction and cancellation work.
  const s=fresh();s.events.push({...clone(s.events[0]),id:uid()});await load(s);
  // Sheet controls now live in the disclosure; expose them before creating an invalid draft.
  await page.locator('.more-settings > summary').click();
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
  const manual=await stored();await reload('manual order reload');assert.equal(await stored(),manual);
  // Equal-position edits retain tie identity order, then manual ordering survives reload.
  await load(fresh());const tieRows=await page.locator('#editor-rows tr').evaluateAll(rows=>rows.map(r=>r.dataset.rowId));
  const tie=page.locator(`[data-row-id="${tieRows[0]}"] input`).first();await tie.fill('60');await tie.press('Tab');
  await page.waitForFunction(id=>document.querySelectorAll('#editor-rows tr')[1]?.dataset.rowId===id,tieRows[0]);
  assert.equal(await page.locator('#editor-rows tr').nth(2).getAttribute('data-row-id'),tieRows[2]);
  await page.locator(`[data-row-id="${tieRows[0]}"] .drag-handle`).press('End');const tieManual=await stored();await reload('equal-position order reload');assert.equal(await stored(),tieManual);
  // Exactly four bytes of room: the emoji must be accepted and survive reload.
  // JSON.stringify + Node Buffer is independent of serializeState/utf8Bytes/LIMITS.
  diagnostics.phase('boundary fixture construction');
  const emojiBytes=Buffer.byteLength('🍌','utf8');assert.equal(emojiBytes,4);
  const near=byteBudgetFixture(EXPECTED_BYTE_LIMIT-emojiBytes),originalName=near.events[0].name;
  const expectedAccepted=clone(near);expectedAccepted.events[0].name=originalName+'🍌';
  assert.equal(stateBytes(near),1_999_996);assert.equal(stateBytes(expectedAccepted),2_000_000);
  await load(JSON.stringify(near));
  assert.equal(Buffer.byteLength(await stored(),'utf8'),1_999_996,await budgetDiagnostics('fixture loaded',1_999_996));
  diagnostics.phase('accepted emoji edit');
  await page.locator('#event-name').fill(originalName+'🍌');
  const full=await stored(),acceptedDiagnostic=await budgetDiagnostics('accepted emoji edit',2_000_000);
  assert.equal(Buffer.byteLength(full,'utf8'),2_000_000,acceptedDiagnostic);
  assert.equal(JSON.parse(full).events[0].name,originalName+'🍌',acceptedDiagnostic);
  assert.ok(isDeepStrictEqual(JSON.parse(full),expectedAccepted),acceptedDiagnostic);
  assert.equal(await page.locator('#event-name').evaluate(n=>n.validity.valid),true,acceptedDiagnostic);
  assert.match(await page.locator('#save-status').textContent(),/Saved just now/,acceptedDiagnostic);
  await reload('accepted boundary edit reload');
  assert.equal(await page.locator('#event-name').inputValue(),originalName+'🍌',await budgetDiagnostics('accepted edit after reload',2_000_000));
  assert.ok((await stored())===full,'Reload must preserve the accepted backup');
  // Duplication includes a new active ID, a copy name and both full mode lists.
  const duplicateCandidate=JSON.parse(full),copy=clone(duplicateCandidate.events[0]);
  copy.id=uid();copy.name=(copy.name+' · copy').slice(0,80);duplicateCandidate.events.push(copy);duplicateCandidate.active=copy.id;
  const duplicateBytes=stateBytes(duplicateCandidate);assert.ok(duplicateBytes>EXPECTED_BYTE_LIMIT);
  diagnostics.phase('duplicate rejection');
  await page.locator('#duplicate-event').click();
  const duplicateDiagnostic=await budgetDiagnostics(`rejected duplicate (${duplicateBytes} candidate bytes)`,2_000_000);
  assert.ok((await stored())===full,duplicateDiagnostic);assert.equal(await page.locator('#event-select option').count(),2,duplicateDiagnostic);
  assert.equal(await page.locator('#event-name').inputValue(),originalName+'🍌',duplicateDiagnostic);
  // Another emoji is four bytes over. Keep its visible draft, but do not save it.
  const rejectedName=originalName+'🍌🍌',rejectedCandidate=JSON.parse(full);rejectedCandidate.events[0].name=rejectedName;
  assert.equal(stateBytes(rejectedCandidate),2_000_004);
  diagnostics.phase('over-budget draft');
  await page.locator('#event-name').fill(rejectedName);
  const rejectedDiagnostic=await budgetDiagnostics('rejected emoji edit (2000004 candidate bytes)',2_000_000);
  assert.ok((await stored())===full,rejectedDiagnostic);
  assert.equal(await page.locator('#event-name').inputValue(),rejectedName,rejectedDiagnostic);
  assert.equal(await page.locator('#event-name').evaluate(n=>n.validity.customError),true,rejectedDiagnostic);
  assert.match(await page.locator('#event-name').evaluate(n=>n.validationMessage),/2,000,000 UTF-8 bytes/,rejectedDiagnostic);
  assert.match(await page.locator('#toast').textContent(),/2,000,000 UTF-8 bytes/,rejectedDiagnostic);
  assert.equal(await page.locator('#cancel-edits').isVisible(),true,rejectedDiagnostic);
  assert.equal(await page.locator('#event-select option:checked').textContent(),originalName+'🍌',rejectedDiagnostic);
  // Correcting a rejected draft must clear its error without losing the accepted emoji.
  diagnostics.phase('correct over-budget draft');
  await page.locator('#event-name').fill(originalName+'🍌');
  const correctedDiagnostic=await budgetDiagnostics('corrected draft',2_000_000);
  assert.ok((await stored())===full,correctedDiagnostic);
  assert.equal(await page.locator('#event-name').evaluate(n=>n.validity.valid),true,correctedDiagnostic);
  assert.equal(await page.locator('#cancel-edits').isVisible(),false,correctedDiagnostic);
  diagnostics.phase('over-budget draft');
  await page.locator('#event-name').fill(rejectedName);
  assert.equal(await page.locator('#event-name').inputValue(),rejectedName,await budgetDiagnostics('repeat rejected draft',2_000_000));
  diagnostics.phase('cancel over-budget draft');
  await page.locator('#event-name').press('Escape');
  assert.equal(await page.locator('#event-name').inputValue(),originalName+'🍌',await budgetDiagnostics('cancel rejected draft',2_000_000));
  await reload('cancelled boundary edit reload');
  assert.ok((await stored())===full,await budgetDiagnostics('rejected edit after reload',2_000_000));
  assert.equal(await page.locator('#event-name').inputValue(),originalName+'🍌');
  diagnostics.phase('boundary backup round trip');
  await page.locator('#export').click();const [backup]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'JSON · complete backup',exact:true}).click()]);
  const stream=await backup.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);const raw=Buffer.concat(chunks);assert.equal(raw.length,EXPECTED_BYTE_LIMIT);
  assert.ok(raw.toString('utf8')===full,'Complete backup must equal the accepted serialized state');
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:raw});await page.getByRole('button',{name:'Restore backup',exact:true}).click();assert.ok((await stored())===full,'Restored boundary backup must equal the accepted state');
  // Oversized original is preserved byte-for-byte and export offered before replacement.
  diagnostics.phase('oversized recovery');
  const oversized=full+' ';await load(oversized);assert.ok((await stored())===oversized,'Recovery must retain the original oversized state');assert.equal(await page.locator('#dialog').getAttribute('aria-labelledby'),'dialog-title');
  const [recovery]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export original recovery data',exact:true}).click()]);
  const recoveryStream=await recovery.createReadStream();const recoveryChunks=[];for await(const chunk of recoveryStream)recoveryChunks.push(chunk);assert.ok(Buffer.concat(recoveryChunks).toString()===oversized,'Recovery export must retain the original oversized state');
  await page.locator('#close-dialog').click();await page.locator('#event-name').fill('Temporary');assert.ok((await stored())===oversized,'Recovery must retain the original oversized state');
  diagnostics.phase('recovery restore confirmation');
  // Hold File.text pending deliberately: setInputFiles does not await async onchange.
  await page.evaluate(()=>{
   const original=File.prototype.text;
   File.prototype.text=function(){
    File.prototype.text=original;
    return new Promise(resolve=>{window.releaseRecoveryFileRead=()=>{delete window.releaseRecoveryFileRead;resolve(original.call(this));};});
   };
  });
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(serializeState(fresh()))});
  await page.waitForFunction(()=>typeof window.releaseRecoveryFileRead==='function',null,{timeout:10000});
  await page.getByRole('heading',{name:'Import from your device',exact:true}).waitFor({state:'visible',timeout:10000});
  assert.ok((await stored())===oversized,'Pending file read must retain the oversized original');
  await page.evaluate(()=>window.releaseRecoveryFileRead());
  const recoveryDialog=page.locator('#dialog');
  try{
   // Wait for successful parsing and confirmation UI before counting recovery actions.
   await recoveryDialog.getByRole('heading',{name:'Restore backup?',exact:true}).waitFor({state:'visible',timeout:10000});
   assert.equal(await recoveryDialog.evaluate(n=>n.open),true);
   assert.equal(await recoveryDialog.getByRole('button',{name:'Export original recovery data',exact:true}).count(),1);
   assert.equal(await recoveryDialog.getByRole('button',{name:'Back up temporary in-memory plan',exact:true}).count(),1);
  }catch(error){
   // Static UI labels and sizes only; never include dialog body or saved plan contents.
   console.error('[recovery confirmation]',JSON.stringify(await page.evaluate(()=>({
    dialogOpen:document.getElementById('dialog').open,
    heading:document.getElementById('dialog-title').textContent,
    buttonNames:[...document.querySelectorAll('#dialog button')].map(b=>b.getAttribute('aria-label')||b.textContent),
    savedBytes:new TextEncoder().encode(localStorage.getItem('stemtape.v1')||'').length,
    invalidInputs:document.querySelectorAll('input:invalid,textarea:invalid').length,
    saveStatus:document.getElementById('save-status').textContent
   }))));
   throw error;
  }
  assert.ok((await stored())===oversized,'Opening restore confirmation must not overwrite the original');
  const [restoreRecovery]=await Promise.all([page.waitForEvent('download'),recoveryDialog.getByRole('button',{name:'Export original recovery data',exact:true}).click()]);
  const restoreStream=await restoreRecovery.createReadStream(),restoreChunks=[];for await(const chunk of restoreStream)restoreChunks.push(chunk);
  assert.ok(Buffer.concat(restoreChunks).toString('utf8')===oversized,'Restore confirmation must export the oversized original byte-for-byte');
  await page.locator('#close-dialog').click();assert.ok((await stored())===oversized,'Recovery must retain the original oversized state');
  // Storage failure status remains visible on mobile.
  await load(fresh());await page.evaluate(()=>Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');});await page.locator('#event-name').fill('Still exportable');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#save-status').isVisible(),true);assert.match(await page.locator('#save-status').textContent(),/Not saved/);
  assert.deepEqual(errors,[]);
  diagnostics.phase('complete');
 }catch(error){await diagnostics.failure(error);throw error;}finally{await context.close();}
}
