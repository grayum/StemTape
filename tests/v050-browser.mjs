import assert from 'node:assert/strict';
import {initialState,serializeState,exportCSV} from '../dist/core.js';
export async function v050Regressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const stored=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 const ready=()=>page.waitForFunction(()=>document.fonts.status==='loaded'&&document.querySelector('#sheet-preview svg'));
 const seed=async raw=>{await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),raw);await page.reload();await ready();};
 try{
  await page.goto(base);await ready();
  const s=initialState(),e=s.events[0];s.active=e.id;e.rows.distance=e.rows.distance.slice(0,4);
  for(const [i,key]of ['bar','bottle','gel','cobbles'].entries()){e.rows.distance[i].symbol=key;e.rows.distance[i].cells[e.columns[1].id]=key;}
  await seed(serializeState(s));assert.equal(await page.locator('#footer-enabled').isChecked(),false);assert.equal(await page.locator('#footer-text').isDisabled(),true);
  assert.equal(await page.locator('#sheet-preview [data-footer]').count(),0);
  const originalSheet=await page.locator('#sheet-preview').innerHTML(),csv=exportCSV(e);
  const summary=page.locator('.more-settings > summary');await summary.focus();await summary.press('Enter');
  assert.equal(await page.locator('.more-settings').evaluate(n=>n.open),true);
  await page.locator('#footer-enabled').check();assert.equal(await page.locator('#footer-text').isEnabled(),true);
  assert.equal(await page.locator('#sheet-preview').innerHTML(),originalSheet);
  await page.locator('#footer-text').fill('Ride safe');await page.waitForFunction(()=>document.querySelector('#sheet-preview [data-footer]')?.textContent==='Ride safe');
  await page.locator('#footer-enabled').uncheck();assert.equal(await page.locator('#footer-text').inputValue(),'Ride safe');assert.equal(await page.locator('#sheet-preview').innerHTML(),originalSheet);
  await page.locator('#footer-enabled').check();await page.locator('#footer-text').fill('<img src=x> 🍌');
  assert.equal(await page.locator('#sheet-preview [data-footer]').textContent(),'<img src=x> 🍌');assert.equal(await page.locator('#sheet-preview img').count(),0);
  await page.locator('#footer-text').fill('W'.repeat(80));assert.match(await page.locator('#fit-status').textContent(),/Footer is too wide/);assert.equal(await page.locator('#print').isDisabled(),true);
  const beforeLong=await stored();await page.locator('#footer-text').fill('X'.repeat(81));
  assert.equal(await page.locator('#footer-text').inputValue(),'X'.repeat(81));assert.equal(await stored(),beforeLong);assert.equal(await page.locator('#print').isDisabled(),true);
  await page.locator('#sort').click();assert.equal(await page.locator('#footer-text').inputValue(),'X'.repeat(81));
  await page.locator('#footer-text').press('Escape');
  await page.locator('#footer-text').fill('Ride safe');assert.equal(await page.locator('#print').isEnabled(),true);
  const good=await stored();await page.evaluate(()=>{window.footerWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};});
  await page.locator('#footer-text').fill('Unsaved footer');assert.equal(await stored(),good);assert.match(await page.locator('#save-status-label').textContent(),/Not saved/);
  await page.evaluate(()=>Storage.prototype.setItem=window.footerWrite);await page.locator('#footer-text').fill('Ride safe');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('stemtape.v1')).events[0].layout.footerText==='Ride safe');
  await page.reload();await ready();assert.equal(await page.locator('#footer-text').inputValue(),'Ride safe');assert.equal(await page.locator('#footer-enabled').isChecked(),true);
  await page.locator('#duplicate-event').click();assert.equal(JSON.parse(await stored()).events[1].layout.footerText,'Ride safe');
  // File reading is asynchronous: wait for the visible restore confirmation.
  const backup=await stored();await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'footer.json',mimeType:'application/json',buffer:Buffer.from(backup)});
  await page.getByRole('heading',{name:'Restore backup?',exact:true}).waitFor();await page.getByRole('button',{name:'Restore backup',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#sheet-preview [data-footer]')?.textContent==='Ride safe');
  assert.equal(JSON.parse(await stored()).events[0].layout.footerText,'Ride safe');
  const short=initialState();short.active=short.events[0].id;short.events[0].rows.distance=short.events[0].rows.distance.slice(0,2);
  Object.assign(short.events[0].layout,{length:30,footerEnabled:true,footerText:'Go'});await seed(serializeState(short));
  assert.match(await page.locator('#fit-status').textContent(),/Footer exceeds the sheet length/);assert.equal(await page.locator('#print').isDisabled(),true);
  await page.locator('.more-settings > summary').click();await page.locator('#footer-enabled').uncheck();assert.equal(await page.locator('#print').isEnabled(),true);
  // The same inner sheet and footer coordinates are used by preview and print.
  const small=initialState();small.active=small.events[0].id;small.events[0].rows.distance=small.events[0].rows.distance.slice(0,1);
  Object.assign(small.events[0].layout,{footerEnabled:true,footerText:'Go'});await seed(serializeState(small));
  for(const rotation of [0,90,180,270]){
   await page.locator('.more-settings > summary').click();
   await page.locator('#rotation').selectOption(String(rotation));
   await page.evaluate(()=>{window.footerPrintCount=0;window.print=()=>window.footerPrintCount++;});
   await page.locator('#print').click();await page.waitForFunction(()=>window.footerPrintCount===1);
   const preview=await page.locator('#sheet-preview [data-footer]').evaluate(n=>({text:n.textContent,x:n.getAttribute('x'),y:n.getAttribute('y'),transform:n.parentElement.getAttribute('transform')}));
   const printed=page.locator('#print-pages svg[aria-label="Printable cue sheet"]');assert.equal(await printed.count(),1);
   assert.deepEqual(await printed.locator('[data-footer]').evaluate(n=>({text:n.textContent,x:n.getAttribute('x'),y:n.getAttribute('y'),transform:n.parentElement.getAttribute('transform')})),preview);
   assert.deepEqual(await printed.evaluate(n=>[n.getAttribute('width'),n.getAttribute('height')]),['32','90']);
   await page.locator('.more-settings > summary').click();
  }
  for(const theme of ['light','dark']){
   await page.getByRole('button',{name:theme==='light'?'Light theme':'Dark theme',exact:true}).click();
   assert.equal(await page.locator('.settings-arrow').evaluate(n=>getComputedStyle(n).fill),'rgb(197, 248, 42)');
   await page.screenshot({path:`artifacts/v050-${theme}.png`,fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});await summary.focus();await summary.press('Space');
  assert.equal(await page.locator('.more-settings').evaluate(n=>n.open),true);await page.screenshot({path:'artifacts/v050-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);assert.ok(csv.includes('bar')); // CSV cue format is unchanged; Node tests cover byte-for-byte equality.
 }finally{await context.close();}
}
