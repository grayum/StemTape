import assert from 'node:assert/strict';
import {initialState,serializeState} from '../dist/core.js';
import {byteBudgetFixture} from './byte-budget-fixture.mjs';

export async function saveStatusRegressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const stored=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 const status=()=>page.locator('#save-status-label').textContent();
 const waitStatus=text=>page.waitForFunction(text=>document.getElementById('save-status-label').textContent.includes(text),text,{timeout:10000});
 const seed=async raw=>{await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),raw);await page.reload();};
 try{
  await page.clock.install({time:new Date('2026-10-02T12:00:00Z')});await page.goto(base);await page.waitForFunction(()=>document.fonts.status==='loaded');
  assert.equal(await status(),'Not saved yet');assert.equal(await stored(),null);
  const legacy=serializeState(initialState());await seed(legacy);
  assert.match(await status(),/save time unknown/);assert.equal(await stored(),legacy);
  await page.locator('#event-name').fill('Saved plan');await waitStatus('Saved just now');
  const first=await stored(),timestamp=JSON.parse(first).savedAt;
  assert.ok(Number.isSafeInteger(timestamp));assert.equal(await page.locator('#save-status-time').getAttribute('datetime'),new Date(timestamp).toISOString());
  const announcement=await page.locator('#save-announcement').textContent();
  await page.waitForFunction(()=>document.fonts.status==='loaded');
  await page.evaluate(()=>{window.savedEditorNode=document.querySelector('#editor-rows tr');window.savedPreviewNode=document.querySelector('#sheet-preview svg');});
  await page.clock.fastForward(60000);await waitStatus('Saved 1 minute ago');
  assert.equal(await stored(),first);assert.equal(await page.locator('#save-announcement').textContent(),announcement);
  assert.equal(await page.evaluate(()=>window.savedEditorNode===document.querySelector('#editor-rows tr')&&window.savedPreviewNode===document.querySelector('#sheet-preview svg')),true);
  await page.reload();await waitStatus('Saved 1 minute ago');assert.equal(await stored(),first);
  const position=page.locator('#editor-rows input').first();await position.fill('-1');await waitStatus('Not saved');
  assert.equal(await page.locator('#save-status').getAttribute('data-saved'),'false');assert.equal(await stored(),first);
  await position.press('Escape');await waitStatus('Saved 1 minute ago');
  await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};});
  await page.locator('#event-name').fill('Unsaved plan');await waitStatus('Not saved');assert.equal(await stored(),first);
  assert.match(await page.locator('#save-status-time').textContent(),/Previous successful save/);
  for(const theme of ['dark','light']){
   await page.getByRole('button',{name:theme==='dark'?'Dark theme':'Light theme',exact:true}).click();
   await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#save-status').isVisible(),true);
   assert.equal(await page.locator('#save-status').getAttribute('data-saved'),'false');
  }
  await page.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);
  await page.locator('#event-name').fill('Recovered write');await waitStatus('Saved just now');
  const second=await stored();assert.ok(JSON.parse(second).savedAt>timestamp);
  // A second tab must not silently overwrite the first tab's newer data.
  const other=await context.newPage();await other.goto(base);
  await page.locator('#event-name').fill('Newer tab value');
  await other.waitForFunction(()=>document.getElementById('save-status-label').textContent.includes('another tab'));
  const newest=await stored();await other.locator('#event-name').fill('Stale tab edit');assert.equal(await stored(),newest);await other.close();
  // Imported timestamps are not treated as this browser's latest write time.
  const imported=initialState();imported.savedAt=1;
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'old-time.json',mimeType:'application/json',buffer:Buffer.from(serializeState(imported))});
  await page.getByRole('button',{name:'Restore backup',exact:true}).click();await waitStatus('Saved just now');assert.ok(JSON.parse(await stored()).savedAt>1);
  // A failed write after metadata no longer fits must still leave an exportable plan.
  const datedAt=1_790_942_400_000,overhead=Buffer.byteLength(',"savedAt":'+datedAt,'utf8');
  const tight=byteBudgetFixture(2_000_000-overhead);tight.savedAt=datedAt;
  const tightRaw=serializeState(tight);await seed(tightRaw);
  await page.evaluate(()=>{window.restoreSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};});
  await page.locator('#event-name').fill(tight.events[0].name+'🍌');await waitStatus('Not saved');assert.equal(await stored(),tightRaw);
  await page.locator('#export').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'JSON · complete backup',exact:true}).click()]);
  const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
  const exportBytes=Buffer.concat(chunks);assert.ok(exportBytes.length<=2_000_000);
  assert.equal(JSON.parse(exportBytes.toString()).events[0].name,tight.events[0].name+'🍌');
  assert.equal(Object.hasOwn(JSON.parse(exportBytes.toString()),'savedAt'),false);
  await page.evaluate(()=>Storage.prototype.setItem=window.restoreSetItem);
  // Tight-budget writes preserve complete plan data; reload honestly has no time.
  const boundary=byteBudgetFixture(1_999_996);await seed(JSON.stringify(boundary));
  await page.locator('#event-name').fill(boundary.events[0].name+'🍌');await waitStatus('Saved just now');
  assert.equal(Buffer.byteLength(await stored(),'utf8'),2_000_000);assert.equal(Object.hasOwn(JSON.parse(await stored()),'savedAt'),false);
  await page.reload();await waitStatus('save time unknown');
  // Recovery replacement that cannot be written retains original export access.
  const original=(await stored())+' ';await seed(original);await page.locator('#close-dialog').click();
  await page.locator('#event-name').fill('Temporary fallback');await waitStatus('original protected');assert.equal(await stored(),original);
  await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(legacy)});
  await page.getByRole('heading',{name:'Restore backup?',exact:true}).waitFor();
  await page.evaluate(()=>Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');});
  await page.getByRole('button',{name:'Restore backup',exact:true}).click();await waitStatus('Not saved');assert.equal(await stored(),original);
  await page.locator('#privacy').click();assert.equal(await page.getByRole('button',{name:'Export original recovery data',exact:true}).count(),1);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
}
