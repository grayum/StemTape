// npm install --no-save playwright@1.62.1 && npx playwright install chromium
// Run against the local development server or Docker: BASE_URL=http://127.0.0.1:8080 npm run test:browser
import assert from 'node:assert/strict';
import {saveStatusRegressions} from './save-status-browser.mjs';
import {reviewRegressions} from './review-browser.mjs';
import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
await mkdir('artifacts',{recursive:true});
let context;
try{
context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
const page=await context.newPage();const errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const base=process.env.BASE_URL||'http://127.0.0.1:8080';
page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:'))external.push(r.url());});
await page.goto(base);await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('#editor-rows tr').count(),6);
assert.equal(await page.locator('#unit').inputValue(),'km');
assert.equal(await page.locator('#print').isEnabled(),true);
await page.screenshot({path:'artifacts/desktop-light.png',fullPage:true});
// Leading handle: mouse drop, keyboard move, and cancellation preserve row data.
const firstId=await page.locator('#editor-rows tr').first().getAttribute('data-row-id');
const grip=await page.locator('#editor-rows tr').first().locator('.drag-handle').boundingBox();
const third=await page.locator('#editor-rows tr').nth(2).boundingBox();
await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2);await page.mouse.down();
await page.mouse.move(grip.x+grip.width/2,third.y+third.height*.8,{steps:12});await page.mouse.up();
assert.equal(await page.locator('#editor-rows tr').nth(2).getAttribute('data-row-id'),firstId);
await page.locator('#editor-rows tr').nth(2).locator('.drag-handle').press('Home');
assert.equal(await page.locator('#editor-rows tr').first().getAttribute('data-row-id'),firstId);
const start=await page.locator('#editor-rows tr').first().locator('.drag-handle').boundingBox();
await page.mouse.move(start.x+10,start.y+10);await page.mouse.down();await page.mouse.move(start.x+10,third.y+third.height*.8,{steps:10});await page.keyboard.press('Escape');await page.mouse.up();
assert.equal(await page.locator('#editor-rows tr').first().getAttribute('data-row-id'),firstId);
assert.equal(await page.locator('.privacy-promise').textContent(),'Your ride plans stay yours.');
assert.equal(await page.locator('.brand small').textContent(),'A little tape. A clear plan.');
assert.equal(await page.locator('footer a').first().getAttribute('href'),'https://github.com/grayum/StemTape');
assert.equal(await page.getByRole('link',{name:'Graham van der Wielen',exact:true}).getAttribute('href'),'https://grahamofthewheels.com/');
for(const name of ['Cobbles / pavé','Rice cake','Softdrink','Neutral zone','Litter zone']){
 await page.getByRole('button',{name:'Choose icon for row 1',exact:true}).click();await page.getByRole('button',{name,exact:true}).click();
}
await page.getByRole('button',{name:'Choose icon for row 1',exact:true}).click();await page.getByRole('button',{name:'Banana',exact:true}).click();

// Sorted picker; None remains first.
await page.getByRole('button',{name:'Choose icon for row 1',exact:true}).click();
const labels=await page.locator('.option-grid button').allTextContents();
assert.equal(labels[0],'None');assert.deepEqual(labels.slice(1),labels.slice(1).sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
await page.locator('#close-dialog').click();
// Valid position edits sort on commit; manual placement and text edits persist.
const edited=page.locator(`[data-row-id="${firstId}"]`);
await edited.locator('input').first().fill('110');await edited.locator('input').first().press('Enter');
await page.waitForFunction(id=>document.querySelectorAll('#editor-rows tr')[4]?.dataset.rowId===id,firstId);
await edited.locator('.drag-handle').press('Home');
await edited.locator('input').nth(1).fill('Manual order');await page.reload();
assert.equal(await page.locator('#editor-rows tr').first().getAttribute('data-row-id'),firstId);
// Clicking an arrow directly from a changed position must not lose that click.
await edited.locator('input').first().fill('90');await edited.getByRole('button',{name:'Move row down 1',exact:true}).click();
await page.waitForFunction(id=>document.querySelectorAll('#editor-rows tr')[4]?.dataset.rowId===id,firstId);
await edited.locator('input').first().fill('20');await edited.locator('input').first().press('Enter');
await page.waitForFunction(id=>document.querySelectorAll('#editor-rows tr')[0]?.dataset.rowId===id,firstId);

await page.getByRole('button',{name:'Dark theme',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
assert.equal(await page.locator('#sheet-preview svg>rect').getAttribute('fill'),'white');
await page.screenshot({path:'artifacts/desktop-dark.png',fullPage:true});
await page.getByLabel('Eat / drink, row 1',{exact:true}).fill('Banana 🍌');await page.reload();await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.getByLabel('Eat / drink, row 1',{exact:true}).inputValue(),'Banana 🍌');
await page.locator('#mode-time').click();assert.equal(await page.locator('#editor-rows tr').count(),0);await page.locator('#add-row').click();await page.getByLabel('Time, row 1',{exact:true}).fill('1:30');await page.getByLabel('Eat / drink, row 1',{exact:true}).fill('Gel');
await page.locator('#add-row').click();
const earlierId=await page.locator('#editor-rows tr').last().getAttribute('data-row-id');
await page.getByLabel('Time, row 2',{exact:true}).fill('0:45');await page.getByLabel('Time, row 2',{exact:true}).press('Enter');
await page.waitForFunction(id=>document.querySelector('#editor-rows tr')?.dataset.rowId===id,earlierId);
await page.locator('#editor-rows tr').first().locator('.drag-handle').press('End');
await page.reload();assert.equal(await page.getByLabel('Time, row 1',{exact:true}).inputValue(),'1:30');
await page.getByRole('button',{name:'Delete row 2',exact:true}).click();
await page.locator('#mode-distance').click();assert.equal(await page.locator('#editor-rows tr').count(),6);await page.locator('#mode-time').click();assert.equal(await page.getByLabel('Time, row 1',{exact:true}).inputValue(),'1:30');
await page.getByLabel('Time, row 1',{exact:true}).fill('1:99');assert.equal(await page.locator('#print').isDisabled(),true);await page.getByLabel('Time, row 1',{exact:true}).fill('1:30');
await page.locator('#mode-distance').click();await page.locator('#unit').selectOption('mi');assert.equal(await page.getByLabel('mi, row 1',{exact:true}).inputValue(),'12.43');await page.locator('#unit').selectOption('km');
await page.getByLabel('Eat / drink, row 1',{exact:true}).fill('<img src=x onerror=alert(1)>');assert.equal(await page.locator('#sheet-preview img').count(),0);
await page.getByLabel('Eat / drink, row 1',{exact:true}).fill('X'.repeat(160));assert.equal(await page.locator('#print').isDisabled(),true);await page.getByLabel('Eat / drink, row 1',{exact:true}).fill('Banana');
await page.locator('#export').click();const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'JSON · complete backup',exact:true}).click()]);assert.equal(download.suggestedFilename(),'stemtape-backup.json');
await page.locator('#import').click();await page.locator('#file-input').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')});await page.getByRole('heading',{name:'Import could not be completed'}).waitFor();assert.equal(await page.locator('#editor-rows tr').count(),6);await page.locator('#close-dialog').click();
const beforeCSVEvent=await page.locator('#event-select').inputValue();
assert.equal(await page.locator('input:invalid,textarea:invalid').count(),0,'CSV import starts without invalid drafts');
await page.locator('#import').click();
await page.locator('#file-input').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('km,icon,Cue\n10,banana,Eat\n20,bottle,Drink')});
// setInputFiles dispatches change; it does not await the handler's File.text().
await page.waitForFunction(previousId=>{
 const dialog=document.getElementById('dialog');
 if(dialog.open&&document.getElementById('dialog-title').textContent==='Import could not be completed'){
  throw new Error(document.getElementById('dialog-body').textContent);
 }
 return !dialog.open&&document.getElementById('event-select').value!==previousId
  &&document.getElementById('toast').textContent==='CSV imported as a new event.';
},beforeCSVEvent,{timeout:10000});
assert.notEqual(await page.locator('#event-select').inputValue(),beforeCSVEvent);
assert.equal(await page.locator('#event-select option:checked').textContent(),'Imported plan');
assert.equal(await page.locator('#editor-rows tr').count(),2);
assert.deepEqual(await page.locator('#editor-rows tr').evaluateAll(rows=>rows.map(row=>({
 position:row.querySelectorAll('input')[0].value,
 symbol:row.querySelector('.symbol-button').dataset.symbol,
 cue:row.querySelectorAll('input')[1].value
}))),[
 {position:'10',symbol:'banana',cue:'Eat'},
 {position:'20',symbol:'bottle',cue:'Drink'}
]);
await page.locator('#column-settings').click();await page.getByRole('button',{name:'Add column',exact:true}).click();await page.getByRole('button',{name:'Done',exact:true}).click();assert.equal(await page.locator('#editor-head th').count(),6);
await page.locator('#event-select').selectOption({index:0});await page.evaluate(()=>window.print=()=>window.dispatchEvent(new Event('beforeprint')));await page.locator('#print').click();await page.waitForFunction(()=>document.querySelector('#print-pages svg'));
const printedSheet=page.locator('#print-pages svg[aria-label="Printable cue sheet"]');
assert.equal(await printedSheet.count(),1,'Single-copy print contains exactly one printable sheet');
const dim=await printedSheet.evaluate(n=>({w:n.getAttribute('width'),h:n.getAttribute('height')}));assert.deepEqual(dim,{w:'32',h:'90'});
await page.pdf({path:'artifacts/test-print.pdf',preferCSSPageSize:true,printBackground:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/mobile-edit.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('[data-tab=preview]').click();assert.equal(await page.locator('.preview-card').isVisible(),true);await page.screenshot({path:'artifacts/mobile-preview.png',fullPage:true});
assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
await reviewRegressions(browser,base);
await saveStatusRegressions(browser,base);
console.log('PASS: desktop/mobile, local persistence, theme, time/distance, XSS, imports, columns, overflow, export and PDF.');
}finally{await context?.close();await browser.close();}
