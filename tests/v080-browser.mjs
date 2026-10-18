import assert from 'node:assert/strict';
import {initialState,serializeState} from '../dist/core.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';
import {historyPlacement} from './v070-browser.mjs';
export async function presetLayout(page){
 await historyPlacement(page);
 const columns=page.locator('#column-settings'),sort=page.locator('#sort');
 assert.equal(await columns.evaluate(n=>n.nextElementSibling.id==='sort'),true);
 assert.equal(await columns.evaluate(n=>{const a=n.getBoundingClientRect(),b=n.nextElementSibling.getBoundingClientRect();return a.right<=b.left&&Math.abs(a.top-b.top)<1;}),true);
 await columns.focus();await page.keyboard.press('Tab');assert.equal(await sort.evaluate(n=>n===document.activeElement),true);

 const update=page.locator('#update-preset');
 if(await update.isVisible()){
  assert.equal(await page.locator('#save-preset').evaluate(n=>n.nextElementSibling.id==='update-preset'&&n.parentElement.id==='preset-controls'),true);
  assert.equal(await update.evaluate(n=>{const a=n.previousElementSibling.getBoundingClientRect(),b=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect();return b.top>=a.top&&Math.abs(b.right-p.right)<1&&(Math.abs(b.top-a.top)<1?b.left-a.right>=5:b.top-a.bottom>=5);}),true);
  await page.locator('#save-preset').focus();await page.keyboard.press('Tab');assert.equal(await update.evaluate(n=>n===document.activeElement),true);
  assert.equal(await update.evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),true);
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
}
export async function v080Regressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stemtape.v1')));
 const plan=async()=>{const s=await state();return s.events.find(e=>e.id===s.active);};
 const blur=()=>page.locator('#row-count').click();
 const save=async name=>{await page.locator('#save-preset').click();await page.getByLabel('Preset name',{exact:true}).fill(name);await page.getByRole('button',{name:'Save preset',exact:true}).click();};
 const update=async()=>{await page.locator('#update-preset').click();await page.getByRole('button',{name:'Update preset',exact:true}).click();};
 const close=()=>page.locator('#close-dialog').click();
 let phase='new';
 try{
  await page.goto(base);assert.equal(await page.locator('#update-preset').isHidden(),true);
  await page.locator('#event-name').fill('Source');await blur();await save('Same name');let s=await state();const first=s.presets[0].id,original=s.active;
  assert.equal((await plan()).presetId,first);assert.equal(await page.locator('#update-preset').isVisible(),true);
  await page.locator('#undo').click();assert.equal((await plan()).presetId,first);await page.locator('#redo').click();assert.equal((await plan()).presetId,first);
  phase='duplicate and same names';await page.locator('#duplicate-event').click();assert.equal((await plan()).presetId,first);const duplicate=(await plan()).id;
  await save('Other name');s=await state();s.presets[1].name='Same name';await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(s));await page.reload();const second=s.presets[1].id;assert.notEqual(second,first);
  await page.locator('#event-name').fill('Revision two');await blur();const before=await state();
  await page.locator('#update-preset').click();assert.match(await page.locator('#dialog-body').textContent(),/Replace “Same name”/);assert.equal(await page.getByRole('button',{name:'Cancel',exact:true}).evaluate(n=>n===document.activeElement),true);
  await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await state(),before);
  await update();s=await state();assert.deepEqual(s.presets[0],before.presets[0]);assert.deepEqual(s.events,before.events);assert.equal(s.presets[1].event.name,'Revision two');assert.ok(s.presets[1].previous);
  const recovery=structuredClone(s.presets[1].previous);await update();assert.deepEqual((await state()).presets[1].previous,recovery);
  phase='new uses updated template; recovery unchanged plans';await page.locator('#preset').selectOption('saved:1');await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal((await plan()).name,'Revision two (2)');assert.equal((await plan()).presetId,second);assert.equal(await page.locator('#undo').isDisabled(),true);
  const beforeRecovery=(await state()).events;await page.locator('#update-preset').click();await page.getByRole('button',{name:'Restore previous version',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Cancel',exact:true}).evaluate(n=>n===document.activeElement),true);await page.keyboard.press('Enter');assert.deepEqual((await state()).presets[1].previous,recovery);
  await page.locator('#update-preset').click();await page.getByRole('button',{name:'Restore previous version',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();assert.deepEqual((await state()).events,beforeRecovery);assert.equal((await state()).presets[1].event.name,recovery.event.name);
  phase='failed write atomic and preserves redo';await page.locator('#event-select').selectOption(duplicate);await page.locator('#event-name').fill('Storage draft');await blur();await page.locator('#undo').click();
  const persisted=await state(),redo=await page.locator('#redo').getAttribute('aria-label');
  await page.evaluate(()=>{window.originalWrite=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});
  await page.locator('#update-preset').click();await page.getByRole('button',{name:'Update preset',exact:true}).click();assert.deepEqual(await state(),persisted);assert.equal(await page.locator('#dialog').evaluate(n=>n.open),true);await close();assert.equal(await page.locator('#redo').getAttribute('aria-label'),redo);assert.match(await page.locator('#save-status-label').textContent(),/Not saved/);
  await page.evaluate(()=>Storage.prototype.setItem=window.originalWrite);await page.locator('#redo').click();assert.equal((await plan()).name,'Storage draft');assert.equal((await plan()).presetId,second);
  phase='invalid drafts blocked';const cue=(await plan()).columns[0].id,cell=page.locator(`#editor-rows input[data-column-id="${cue}"]`).first();await cell.fill('-1');await page.locator('#update-preset').click();assert.equal(await page.locator('#dialog').evaluate(n=>n.open),false);assert.equal(await cell.inputValue(),'-1');await cell.press('Escape');
  phase='delete unlinks all and undo cannot relink';await page.locator('#update-preset').click();await page.getByRole('button',{name:'Delete personal preset',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.locator('#update-preset').isHidden(),true);assert.equal(await page.locator('#save-preset').evaluate(n=>n===document.activeElement),true);assert.equal((await state()).presets.length,1);
  await page.locator('#undo').click();assert.equal((await plan()).presetId,undefined);await page.locator('#redo').click();assert.equal((await plan()).presetId,undefined);await page.locator('#event-select').selectOption(original);assert.equal((await plan()).presetId,first);
  phase='Flanders repeat/reload independent';for(let i=0;i<2;i++){await page.locator('#preset').selectOption('flanders');await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.locator('#editor-rows tr').count(),19);assert.equal(await page.locator('#update-preset').isHidden(),true);}
  s=await state();assert.equal(s.events.filter(e=>e.preset==='flanders').length,2);assert.equal(s.presets.length,1);const flanders=await plan();assert.equal(flanders.columns.find(c=>c.id===flanders.noteColumnId).visible,true);assert.equal(flanders.rows.distance.at(-1).cells[flanders.noteColumnId],'Finish');
  await page.reload();assert.equal((await state()).events.length,s.events.length);assert.equal((await state()).presets.length,1);assert.equal(await page.locator('#print').isDisabled(),true);
  phase='Flanders preview and print';await page.locator('.more-settings > summary').click();await page.locator('#width').fill('100');await page.locator('#length').fill('220');await blur();await page.evaluate(()=>window.print=()=>{});assert.equal(await page.locator('#print').isEnabled(),true);await page.locator('#print').click();
  assert.equal(await page.locator('#print-pages svg[aria-label="Printable cue sheet"]').innerHTML(),await page.locator('#sheet-preview > svg').innerHTML());assert.match(await page.locator('#print-pages').textContent(),/Finish/);await page.pdf({path:'artifacts/v080-flanders.pdf',preferCSSPageSize:true});await page.screenshot({path:'artifacts/v080-flanders-screen.png',fullPage:true});await page.emulateMedia({media:'print'});await page.screenshot({path:'artifacts/v080-flanders-print.png',fullPage:true});await page.emulateMedia({media:'screen'});
  phase='failed new/recovery and blur-to-preset';await page.locator('#event-select').selectOption(original);
  await page.locator('#event-name').fill('Latest field edit');await save('Blur snapshot');assert.equal((await state()).presets.at(-1).event.name,'Latest field edit');
  await page.locator('#event-name').fill('Recovery new');await blur();await update();const beforeFailure=await state();
  await page.evaluate(()=>{window.originalWrite=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});
  await save('Must not exist');assert.deepEqual(await state(),beforeFailure);assert.equal(await page.locator('#dialog').evaluate(n=>n.open),true);await close();
  await page.locator('#update-preset').click();await page.getByRole('button',{name:'Restore previous version',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();assert.deepEqual(await state(),beforeFailure);
  await page.evaluate(()=>Storage.prototype.setItem=window.originalWrite);
  phase='backup collision and missing references rejected transactionally';
  const importJSON=async value=>{await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});};
  for(const bad of ['duplicate','missing']){const candidate=structuredClone(beforeFailure);if(bad==='duplicate')candidate.presets.push(structuredClone(candidate.presets[0]));else candidate.presets=[];await importJSON(candidate);await page.getByRole('heading',{name:'Import could not be completed'}).waitFor();assert.deepEqual(await state(),beforeFailure);await close();}
  const imported=structuredClone(beforeFailure);imported.presets[0].name='Imported same identity';await importJSON(imported);await page.getByRole('button',{name:'Restore backup',exact:true}).click();assert.equal((await state()).presets[0].name,'Imported same identity');assert.deepEqual((await state()).presets.at(-1).previous,beforeFailure.presets.at(-1).previous);
  phase='byte budget rejects without mutation';const tight=byteBudgetFixture();await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(tight));await page.reload();const beforeBudget=await state();await save('Too large');assert.deepEqual(await state(),beforeBudget);assert.equal(await page.locator('#dialog').evaluate(n=>n.open),true);await close();
  phase='legacy use and backups';const legacy=initialState();legacy.active=legacy.events[0].id;legacy.presets.push({name:'Legacy',event:structuredClone(legacy.events[0])});await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(legacy));await page.reload();await page.locator('#preset').selectOption('saved:0');await page.getByRole('button',{name:'Continue',exact:true}).click();assert.ok((await plan()).presetId);await save('Layout copy');
  await page.locator('#event-name').fill('History 1');await blur();await page.locator('#event-name').fill('History 2');await blur();await page.locator('#undo').click();
  for(const width of [1440,390,320])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});if(width<=740)await page.locator('button[data-tab=edit]').click();await page.locator(`button[data-theme=${theme}]`).click();await presetLayout(page);await page.locator('#save-preset').scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/v080-${width}-${theme}.png`,fullPage:true});
   await page.locator('#update-preset').press('Enter');assert.equal(await page.getByRole('button',{name:'Cancel',exact:true}).evaluate(n=>n===document.activeElement),true);assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await page.screenshot({path:`artifacts/v080-dialog-${width}-${theme}.png`,fullPage:true});await page.keyboard.press('Escape');assert.equal(await page.locator('#update-preset').evaluate(n=>n===document.activeElement),true);
  }
  assert.deepEqual(errors,[]);console.log('PASS: v0.8.0 identity/association, confirmation/no-op, atomic failures, recovery, delete/Undo, legacy use, Flanders, mobile/themes/focus');
 }catch(err){await page.screenshot({path:'artifacts/v080-failure.png',fullPage:true});throw new Error(`v0.8.0 ${phase}: ${err.message}`,{cause:err});}finally{await context.close();}
}

// User-found duplicate-name regression: UI rejection must never become overwrite.
export async function v080NameRegressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const message='A preset with this name already exists. Choose a different name.';
 const raw=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 const read=async()=>JSON.parse(await raw());
 const saveDialog=()=>page.locator('#save-preset').click();
 const submit=()=>page.getByRole('button',{name:'Save preset',exact:true}).click();
 const close=()=>page.locator('#close-dialog').click();
 const create=async name=>{await saveDialog();await page.getByLabel('Preset name',{exact:true}).fill(name);await submit();};
 const assertRejected=async(before,inputValue)=>{
  assert.equal(await raw(),before);assert.equal(await page.locator('#dialog').evaluate(n=>n.open),true);
  const input=page.getByLabel('Preset name',{exact:true});assert.equal(await input.inputValue(),inputValue);assert.equal(await input.getAttribute('aria-invalid'),'true');
  assert.match(await input.getAttribute('aria-describedby'),/preset-name-error/);assert.equal(await input.evaluate(n=>n===document.activeElement),true);
  assert.equal(await page.locator('#preset-name-error').textContent(),message);assert.equal(await page.locator('#preset-name-error').getAttribute('role'),'alert');assert.equal(await page.locator('#preset-name-error').isVisible(),true);
 };
 try{
  await page.goto(base);await create('My Preset');const initial=await raw();
  for(const name of ['My Preset','my preset','  MY pReSeT  ','Nutrition plan',' route NOTES ','Custom',' TOUR OF FLANDERS ']){
   await saveDialog();await page.getByLabel('Preset name',{exact:true}).fill(name);await submit();await assertRejected(initial,name);
   assert.equal(await page.getByRole('button',{name:'Update preset',exact:true}).count(),0);await close();
  }
  await saveDialog();await page.getByLabel('Preset name',{exact:true}).fill('My Preset');await submit();await assertRejected(initial,'My Preset');await page.getByLabel('Preset name',{exact:true}).fill('  Second CASE  ');
  assert.equal(await page.locator('#preset-name-error').isHidden(),true);assert.equal(await page.getByLabel('Preset name',{exact:true}).getAttribute('aria-invalid'),null);await submit();assert.equal((await read()).presets[1].name,'Second CASE');
  const beforeRename=await raw();await page.locator('#update-preset').click();await page.getByRole('button',{name:'Update preset',exact:true}).click();assert.equal(await raw(),beforeRename); // unchanged self/no-op
  for(const name of ['My Preset',' my PRESET ','Tour of Flanders']){await page.locator('#update-preset').click();await page.getByRole('button',{name:'Rename preset…',exact:true}).click();await page.getByLabel('Preset name',{exact:true}).fill(name);await page.getByRole('button',{name:'Rename preset',exact:true}).click();await assertRejected(beforeRename,name);await close();}
  await page.locator('#update-preset').click();await page.getByRole('button',{name:'Rename preset…',exact:true}).click();await page.getByLabel('Preset name',{exact:true}).fill(' second case ');await page.getByRole('button',{name:'Rename preset',exact:true}).click();assert.equal((await read()).presets[1].name,'second case');assert.equal((await read()).presets[1].previous.name,'Second CASE');
  // Restore a previously valid same-name backup through the actual import dialog.
  const duplicate=await read();duplicate.presets[1].name='My Preset';duplicate.presets[1].previous.name='My Preset';
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'duplicates.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(duplicate))});await page.getByRole('button',{name:'Restore backup',exact:true}).click();
  const labels=await page.locator('#preset option[value^="saved:"]').allTextContents();assert.deepEqual(labels,['My Preset · personal preset 1','My Preset · personal preset 2']);
  const ids=duplicate.presets.map(p=>p.id);
  for(const index of [0,1]){
   await page.locator('#preset').selectOption(`saved:${index}`);await page.getByRole('button',{name:'Continue',exact:true}).click();let s=await read();assert.equal(s.events.find(e=>e.id===s.active).presetId,ids[index]);const other=structuredClone(s.presets[1-index]);
   await page.locator('#event-name').fill(`Updated duplicate ${index}`);await page.locator('#row-count').click();await page.locator('#update-preset').click();assert.match(await page.locator('#dialog-body').textContent(),new RegExp(`personal preset ${index+1}`));
   await page.getByRole('button',{name:'Update preset',exact:true}).click();s=await read();assert.equal(s.presets[index].event.name,`Updated duplicate ${index}`);assert.deepEqual(s.presets[1-index],other);
   await page.locator('#update-preset').click();await page.getByRole('button',{name:'Restore previous version',exact:true}).click();assert.match(await page.locator('#dialog-body').textContent(),new RegExp(`personal preset ${index+1}`));await page.getByRole('button',{name:'Continue',exact:true}).click();s=await read();assert.equal(s.presets[index].previous.event.name,`Updated duplicate ${index}`);assert.deepEqual(s.presets[1-index],other);
  }
  for(const width of [1440,390,320])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});if(width<740)await page.locator('button[data-tab=edit]').click();await page.locator(`button[data-theme=${theme}]`).click();await saveDialog();const before=await raw();await page.getByLabel('Preset name',{exact:true}).fill(' my preset ');await submit();await assertRejected(before,' my preset ');assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await page.screenshot({path:`artifacts/v080-names-${width}-${theme}.png`,fullPage:true});await page.keyboard.press('Escape');assert.equal(await page.locator('#save-preset').evaluate(n=>n===document.activeElement),true);
  }
  assert.deepEqual(errors,[]);console.log('PASS: duplicate-name inline validation, case/whitespace/built-ins, self rename, unchanged state/links, imported duplicate identity updates/recovery, mobile/themes/focus');
 }catch(err){await page.screenshot({path:'artifacts/v080-names-failure.png',fullPage:true});throw err;}finally{await context.close();}
}
