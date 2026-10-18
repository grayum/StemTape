import assert from 'node:assert/strict';
import {initialState,serializeState} from '../dist/core.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';

// Shared placement/focus assertions also run at actual browser zoom.
export async function historyPlacement(page){
 const layout=await page.locator('.editor-actions').evaluate(n=>{
  const group=n.querySelector('#history-controls'),undo=group.querySelector('#undo'),redo=group.querySelector('#redo'),save=n.querySelector('#save-preset');
  const a=undo.getBoundingClientRect(),b=redo.getBoundingClientRect(),g=group.getBoundingClientRect(),s=save.getBoundingClientRect(),p=n.getBoundingClientRect();
  return {order:group.nextElementSibling===save&&undo.nextElementSibling===redo,innerGap:b.left-a.right,outerGap:s.left-g.right,sameLine:Math.abs(s.top-g.top)<1,groupLine:Math.abs(a.top-b.top)<1,wrapped:s.top>=g.bottom+11,contained:g.left>=p.left-1&&g.right<=p.right+1&&s.left>=p.left-1&&s.right<=p.right+1};
 });
 assert.equal(layout.order,true);assert.equal(layout.groupLine,true);assert.equal(layout.contained,true);
 assert.ok(Math.abs(layout.innerGap-6)<1);if(layout.sameLine)assert.ok(Math.abs(layout.outerGap-12)<1);else assert.equal(layout.wrapped,true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(await page.locator('#undo').isEnabled()&&await page.locator('#redo').isEnabled()){
  await page.locator('#undo').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#redo').evaluate(n=>n===document.activeElement),true);
  await page.keyboard.press('Tab');assert.equal(await page.locator('#save-preset').evaluate(n=>n===document.activeElement),true);
  await page.keyboard.press('Shift+Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#undo').evaluate(n=>n===document.activeElement&&n.matches(':focus-visible')),true);
 }
}

export async function v070Regressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const raw=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 const plan=async()=>{const s=JSON.parse(await raw());return s.events.find(e=>e.id===s.active);};
 const fixture=initialState();fixture.events[0].rows.time=[structuredClone(fixture.events[0].rows.distance[0])];fixture.events[0].rows.time[0].id="elapsed";fixture.events[0].rows.time[0].cells[fixture.events[0].columns[0].id]=60;
 const seed=async()=>{const s=JSON.parse(JSON.stringify(fixture));s.active=s.events[0].id;Object.assign(s.events[0].layout,{width:80,length:150});await page.evaluate(r=>localStorage.setItem('stemtape.v1',r),serializeState(s));await page.reload();await page.evaluate(()=>document.fonts.ready);return s.events[0];};
 const undo=()=>page.locator('#undo').click(),redo=()=>page.locator('#redo').click();
 const blur=()=>page.locator('#row-count').click();
 const settings=async()=>{if(!await page.locator('.more-settings').evaluate(n=>n.open))await page.locator('.more-settings > summary').click();};
 const restore=async backup=>{await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});await page.getByRole('button',{name:'Restore backup',exact:true}).click();};
 let phase='initial';
 try{
  await page.goto(base);let e=await seed(),first=e.columns[0].id,cue=e.columns[1].id;
  const cell=id=>page.locator(`#editor-rows input[data-column-id="${id}"]`).first();
  assert.equal(await page.locator('#undo').isDisabled(),true);assert.equal(await page.locator('#redo').isDisabled(),true);
  phase='completed field and single-click Undo';const old=await cell(cue).inputValue();await cell(cue).fill('');await cell(cue).pressSequentially('New fuel');await undo();
  assert.equal(await cell(cue).inputValue(),old);assert.equal(await page.locator('#undo').isDisabled(),true);
  assert.equal(await page.locator('#history-controls').evaluate(n=>n===document.activeElement),true);
  await cell(cue).fill(old);await blur();assert.equal(await page.locator('#redo').isEnabled(),true);await redo();assert.equal(await cell(cue).inputValue(),'New fuel');
  await cell(cue).fill('New fuel');await blur();assert.equal(await page.locator('#undo').getAttribute('aria-label'),'Undo edit cell');await undo();assert.equal(await cell(cue).inputValue(),old);
  await cell(cue).fill('Branch');await blur();assert.equal(await page.locator('#redo').isDisabled(),true);
  phase='position and automatic sort atomic';e=await seed();const before=(await plan()).rows.distance;
  await cell(first).fill('110');await undo();assert.deepEqual((await plan()).rows.distance,before);await redo();
  assert.equal((await plan()).rows.distance[4].id,before[0].id);assert.equal((await plan()).rows.distance[4].cells[first],110000);
  phase='manual reorder/delete/insert/explicit sort';await page.locator('#editor-rows .drag-handle').first().press('End');const reordered=(await plan()).rows.distance;
  await undo();assert.notDeepEqual((await plan()).rows.distance,reordered);await redo();assert.deepEqual((await plan()).rows.distance,reordered);
  await page.getByRole('button',{name:'Delete row 1',exact:true}).click();await undo();assert.deepEqual((await plan()).rows.distance,reordered);
  await page.locator('#add-row').click();await undo();assert.deepEqual((await plan()).rows.distance,reordered);
  await page.locator('#sort').click();const sorted=(await plan()).rows.distance;await undo();assert.deepEqual((await plan()).rows.distance,reordered);await redo();assert.deepEqual((await plan()).rows.distance,sorted);
  phase='Note and column identity';await settings();await page.locator('#show-note').check();const note=(await plan()).noteColumnId;await undo();assert.equal((await plan()).noteColumnId,undefined);await redo();assert.equal((await plan()).noteColumnId,note);
  await cell(note).fill('Bridge');await blur();await page.locator('#show-note').uncheck();await undo();assert.equal(await cell(note).inputValue(),'Bridge');await redo();assert.equal((await plan()).rows.distance[0].cells[note],'Bridge');
  await undo();const originalColumns=(await plan()).columns;
  await page.locator(`#column-order-list [data-column-id="${note}"]`).getByRole('button',{name:'Move right',exact:true}).click();
  await undo();assert.deepEqual((await plan()).columns,originalColumns);assert.equal((await plan()).rows.distance[0].cells[note],'Bridge');await redo();
  await page.locator('#column-details').click();const config=page.locator(`.column-config[data-column-id="${note}"]`);
  await config.getByLabel('Name',{exact:true}).fill('Location');await page.getByRole('button',{name:'Done',exact:true}).click();await undo();assert.equal((await plan()).columns.find(c=>c.id===note).label,'Note');await redo();
  await page.locator('#column-details').click();await config.getByLabel('Width share',{exact:true}).fill('30');await page.getByRole('button',{name:'Done',exact:true}).click();await undo();assert.equal((await plan()).columns.find(c=>c.id===note).width,25);
  // Empty custom column can change type without losing either mode's cells.
  await page.locator('#column-details').click();await page.getByRole('button',{name:'Add column',exact:true}).click();const custom=(await plan()).columns.at(-1).id;
  await page.locator(`.column-config[data-column-id="${custom}"]`).locator('select').first().selectOption('number');await page.getByRole('button',{name:'Done',exact:true}).click();await undo();
  assert.equal((await plan()).columns.find(c=>c.id===custom).type,'text');assert.equal((await plan()).rows.distance[0].cells[custom],'');
  phase='name/layout/mode/unit atomic';await page.locator('#event-name').fill('Session plan');await undo();assert.notEqual((await plan()).name,'Session plan');await redo();
  await settings();const oldWidth=(await plan()).layout.width;await page.locator('#width').fill('90');await blur();await page.locator('#save-bike').click();await undo();assert.equal((await plan()).layout.width,oldWidth);assert.equal(JSON.parse(await raw()).bike.width,90);
  await page.locator('#dimension-unit').selectOption('in');await undo();assert.equal((await plan()).dimensionUnit,'mm');assert.equal((await plan()).layout.width,oldWidth);
  await page.locator('#copies').selectOption('2');await undo();assert.equal((await plan()).layout.copies,1);
  await page.locator('#footer-enabled').check();await page.locator('#footer-text').fill('Go!');await blur();await page.locator('#footer-enabled').uncheck();await undo();assert.equal((await plan()).layout.footerText,'Go!');assert.equal((await plan()).layout.footerEnabled,true);
  await page.locator('#unit').selectOption('mi');await undo();assert.equal((await plan()).unit,'km');await redo();assert.equal((await plan()).unit,'mi');
  const bothModes=(await plan()).rows;await page.locator('#mode-time').click();await undo();assert.equal((await plan()).mode,'distance');assert.deepEqual((await plan()).rows,bothModes);await redo();assert.equal((await plan()).mode,'time');
  await page.locator('#preset').selectOption('custom');await undo();assert.equal((await plan()).mode,'time');assert.equal((await plan()).preset,'nutrition');
  phase='invalid drafts and shortcuts';await cell(first).fill('1:99');const invalidRaw=await raw();assert.equal(await page.locator('#undo').isDisabled(),true);
  await page.evaluate(()=>document.activeElement.blur());await page.keyboard.press('Control+z');assert.equal(await raw(),invalidRaw);assert.equal(await cell(first).inputValue(),'1:99');await cell(first).press('Escape');assert.equal(await page.locator('#undo').isEnabled(),true);
  await page.locator('#mode-distance').click();await cell(cue).fill('Keyboard');await blur();await page.locator('#history-controls').focus();await page.keyboard.press('Control+z');assert.notEqual((await plan()).rows.distance[0].cells[cue],'Keyboard');await page.keyboard.press('Control+Shift+z');assert.equal((await plan()).rows.distance[0].cells[cue],'Keyboard');await page.keyboard.press('Control+z');await page.keyboard.press('Control+y');assert.equal((await plan()).rows.distance[0].cells[cue],'Keyboard');
  await page.evaluate(()=>Object.defineProperty(navigator,'platform',{value:'MacIntel',configurable:true}));await page.keyboard.press('Meta+z');assert.notEqual((await plan()).rows.distance[0].cells[cue],'Keyboard');await page.keyboard.press('Meta+Shift+z');assert.equal((await plan()).rows.distance[0].cells[cue],'Keyboard');await page.evaluate(()=>delete navigator.platform);
  // Detect interception independently of Chromium's own text undo implementation.
  const native=await cell(cue).evaluate(n=>{n.focus();return n.dispatchEvent(new KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true,cancelable:true}));});assert.equal(native,true);
  await blur();await page.locator('#help').click();const modalPlan=await plan();await page.keyboard.press('Control+z');assert.deepEqual(await plan(),modalPlan);await page.locator('#close-dialog').click();
  phase='per-plan isolation/new/duplicate/presets';const originalId=(await plan()).id;await page.locator('#new-event').click();assert.equal(await page.locator('#undo').isDisabled(),true);
  await page.locator('#event-name').fill('Other');await blur();const otherId=(await plan()).id;await page.locator('#event-select').selectOption(originalId);assert.equal(await page.locator('#undo').isEnabled(),true);
  await page.locator('#event-select').selectOption(otherId);await undo();assert.equal((await plan()).name,'Untitled ride');await page.locator('#duplicate-event').click();assert.equal(await page.locator('#undo').isDisabled(),true);
  await page.locator('#event-select').selectOption(originalId);const beforePresetLabel=await page.locator('#undo').getAttribute('aria-label');await page.locator('#save-preset').click();await page.getByPlaceholder('e.g. Long Sunday nutrition').fill('Template');await page.getByRole('button',{name:'Save preset',exact:true}).click();const label=await page.locator('#undo').getAttribute('aria-label');assert.equal(label,beforePresetLabel);
  await page.locator('#preset').selectOption('saved:0');await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(await page.locator('#undo').getAttribute('aria-label'),label);
  await page.locator('#preset').selectOption('saved:0');await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.locator('#undo').isDisabled(),true);
  phase='imports/restore boundaries and storage failure';await page.locator('#event-select').selectOption(originalId);const backup=await raw();
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await page.getByRole('heading',{name:'Import could not be completed'}).waitFor();await page.locator('#close-dialog').click();assert.equal(await page.locator('#undo').getAttribute('aria-label'),label);
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'new.csv',mimeType:'text/csv',buffer:Buffer.from('km,icon,Cue\n10,bottle,Drink')});await page.waitForFunction(id=>document.getElementById('event-select').value!==id,originalId);assert.equal(await page.locator('#undo').isDisabled(),true);
  await page.locator('#event-select').selectOption(originalId);await cell(cue).fill('Unsaved undo');await blur();const persisted=await raw();
  await page.evaluate(()=>{window.writeOriginal=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('quota','QuotaExceededError');};});await undo();assert.equal(await raw(),persisted);assert.notEqual(await cell(cue).inputValue(),'Unsaved undo');assert.match(await page.locator('#save-status-label').textContent(),/Not saved/);assert.equal(await page.locator('#redo').isEnabled(),true);await redo();assert.equal(await cell(cue).inputValue(),'Unsaved undo');
  const failedRestoreCell=await cell(cue).inputValue(),failedRestoreCount=await page.locator('#event-select option').count(),failedRestoreName=await page.locator('#event-name').inputValue(),failedLabel=await page.locator('#undo').getAttribute('aria-label');await restore(backup);assert.equal(await cell(cue).inputValue(),failedRestoreCell);assert.equal(await page.locator('#event-select option').count(),failedRestoreCount);assert.equal(await page.locator('#event-name').inputValue(),failedRestoreName);assert.equal(await page.locator('#undo').getAttribute('aria-label'),failedLabel);
  await page.evaluate(()=>Storage.prototype.setItem=window.writeOriginal);await restore(backup);assert.equal(await page.locator('#undo').isDisabled(),true);assert.equal(await page.locator('#redo').isDisabled(),true);
  phase='history limits/no exports/reload';await seed();for(let i=0;i<23;i++){await page.locator('#event-name').fill(`Ride ${i}`);await blur();}for(let i=0;i<20;i++)await undo();assert.equal(await page.locator('#event-name').inputValue(),'Ride 2');assert.equal(await page.locator('#undo').isDisabled(),true);
  assert.doesNotMatch(await raw(),/"(history|undo|redo)"/);await page.reload();assert.equal(await page.locator('#redo').isDisabled(),true);
  phase='UTF-8 rejection leaves state and stacks unchanged';const tight=byteBudgetFixture();tight.theme='dark';tight.events[0].name+='ab';await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(tight));await page.reload();
  const shortName=tight.events[0].name.slice(0,-4);await page.locator('#event-name').fill(shortName);await blur();await page.locator('button[data-theme=system]').click();const beforeRejected=await raw(),rejectedLabel=await page.locator('#undo').getAttribute('aria-label');await undo();assert.equal(await page.locator('#event-name').inputValue(),shortName);assert.equal(await raw(),beforeRejected);assert.equal(await page.locator('#undo').getAttribute('aria-label'),rejectedLabel);assert.equal(await page.locator('#redo').isDisabled(),true);
  phase='responsive screenshots/preview/print';await seed();await cell(cue).fill('Screen to print');await undo();await redo();await page.evaluate(()=>window.print=()=>{});await page.locator('#print').click();assert.match(await page.locator('#print-pages').textContent(),/Screen to print/);assert.equal(await page.locator('#print-pages svg[aria-label="Printable cue sheet"]').innerHTML(),await page.locator('#sheet-preview > svg').innerHTML());await page.pdf({path:'artifacts/v070-print.pdf',preferCSSPageSize:true});await page.emulateMedia({media:'print'});await page.screenshot({path:'artifacts/v070-print.png',fullPage:true});await page.emulateMedia({media:'screen'});
  await page.locator('#event-name').fill('Placement');await blur();await undo();
  for(const width of [1440,390,320])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});if(width<=740)await page.locator('[data-tab=edit]').click();await page.locator(`button[data-theme=${theme}]`).click();
   await historyPlacement(page);await page.locator('#undo').scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/v070-${width}-${theme}.png`,fullPage:true});await undo();await redo();
   if(width<=740)await page.locator('[data-tab=preview]').click();assert.match(await page.locator('#sheet-preview').textContent(),/Screen to print/);
  }
  assert.deepEqual(errors,[]);console.log('PASS: v0.7.0 field/sort grouping, rows, columns/Note, modes/units, isolation, boundaries, drafts, shortcuts, save failures, limits and responsive rendering');
 }catch(err){await page.screenshot({path:'artifacts/v070-failure.png',fullPage:true});throw new Error(`v0.7.0 ${phase}: ${err.message}`,{cause:err});}finally{await context.close();}
}
