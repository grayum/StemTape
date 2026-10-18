// Actual browser zoom via a temporary local-only Chromium extension, not CSS scaling.
import assert from 'node:assert/strict';
import {presetLayout} from './v080-browser.mjs';
import {writeFile,mkdtemp,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:8080/';
const url=new URL(base);
assert.ok(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname),'Zoom extension is restricted to local testing');
const root=await mkdtemp(join(tmpdir(),'stemtape-v080-zoom-'));
const ext=root,profile=join(root,'profile');
await writeFile(join(ext,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local StemTape zoom check',version:'1.0',permissions:['tabs'],host_permissions:[`${url.origin}/*`],background:{service_worker:'background.js'}}));
await writeFile(join(ext,'background.js'),'chrome.runtime.onInstalled.addListener(() => {});');
const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:null,args:['--window-size=1440,1100',`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
try{
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const page=await context.newPage();
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 await page.locator('#save-preset').click();await page.getByLabel('Preset name',{exact:true}).fill('Zoom personal');await page.getByRole('button',{name:'Save preset',exact:true}).click();
 await page.locator('#event-name').fill('Zoom revision');await page.locator('#update-preset').click();await page.getByRole('button',{name:'Update preset',exact:true}).click();
 const original=await page.locator('#event-select').inputValue();await page.locator('#new-event').click();await page.locator('#event-name').fill('Occupied event');await page.locator('#row-count').click();await page.locator('#event-select').selectOption(original);
 const zoom=await worker.evaluate(async origin=>{const tabs=await chrome.tabs.query({url:`${origin}/*`});for(const tab of tabs)await chrome.tabs.setZoom(tab.id,2);return chrome.tabs.getZoom(tabs.at(-1).id)},url.origin);
 assert.equal(zoom,2);await page.waitForFunction(()=>innerWidth===720&&devicePixelRatio===2);
 const cdp=await context.newCDPSession(page);const shot=async name=>{const data=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});await writeFile(`artifacts/v080-zoom-200-${name}.png`,Buffer.from(data.data,'base64'));};
 for(const theme of ['light','dark']){
  await page.locator(`button[data-theme=${theme}]`).click();await page.locator('button[data-tab=edit]').click();
  await page.locator('#event-name').fill(`Zoom ${theme}`);await page.locator('#undo').click();await page.locator('#redo').click();
  assert.equal(await page.locator('#event-name').inputValue(),`Zoom ${theme}`);
  await page.locator('#event-name').fill(`Zoom ${theme} again`);await page.locator('#row-count').click();await page.locator('#undo').click();await presetLayout(page);
  await page.locator('#undo').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#undo').evaluate(n=>n.matches(':focus-visible')),true);
  const fitControls=await page.locator('#history-controls').evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;});assert.equal(fitControls,true);
  await page.locator('#undo').scrollIntoViewIfNeeded();await shot(`edit-${theme}`);
  await page.locator('#update-preset').click();assert.equal(await page.getByRole('button',{name:'Cancel',exact:true}).evaluate(n=>n===document.activeElement),true);assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await shot(`preset-dialog-${theme}`);await page.getByRole('button',{name:'Restore previous version',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Cancel',exact:true}).evaluate(n=>n===document.activeElement),true);await shot(`recovery-dialog-${theme}`);await page.keyboard.press('Escape');assert.equal(await page.locator('#update-preset').evaluate(n=>n===document.activeElement),true);
  const beforeEventCollision=await page.evaluate(()=>localStorage.getItem('stemtape.v1'));await page.locator('#event-name').fill(' occupied EVENT ');assert.equal(await page.locator('#event-name-error').textContent(),'A ride plan with this event name already exists. Choose another name.');assert.equal(await page.evaluate(()=>localStorage.getItem('stemtape.v1')),beforeEventCollision);await page.locator('#event-name').scrollIntoViewIfNeeded();await shot(`event-name-collision-${theme}`);await page.locator('#event-name').press('Escape');
  const beforeCollision=await page.evaluate(()=>localStorage.getItem('stemtape.v1'));
  await page.locator('#save-preset').click();await page.getByLabel('Preset name',{exact:true}).fill(' zoom PERSONAL ');await page.getByRole('button',{name:'Save preset',exact:true}).click();
  assert.equal(await page.locator('#preset-name-error').textContent(),'A preset with this name already exists. Choose a different name.');assert.equal(await page.getByLabel('Preset name',{exact:true}).inputValue(),' zoom PERSONAL ');assert.equal(await page.evaluate(()=>localStorage.getItem('stemtape.v1')),beforeCollision);assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await page.locator('#preset-name-error').scrollIntoViewIfNeeded();await shot(`name-collision-${theme}`);await page.keyboard.press('Escape');
  await page.locator('button[data-tab=preview]').click();
  const summary=page.locator('.more-settings > summary');if(!await page.locator('.more-settings').evaluate(n=>n.open))await summary.click();
  const privacy=page.locator('#privacy');await privacy.scrollIntoViewIfNeeded();await privacy.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal(await privacy.evaluate(n=>n===document.activeElement&&n.matches(':focus-visible')),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('.print-hint strong').textContent(),'Scale 100% / Actual size.');
  const fit=await privacy.evaluate(n=>{const r=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect();const style=getComputedStyle(n.parentElement);return r.bottom<=p.bottom&&r.top>=n.previousElementSibling.getBoundingClientRect().bottom&&Math.abs(r.right-(p.right-parseFloat(style.paddingRight)-parseFloat(style.borderRightWidth)))<1});assert.equal(fit,true);
  await shot(`preview-${theme}`);await privacy.press('Enter');assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await shot(`help-${theme}`);
  await page.keyboard.press('Escape');assert.equal(await privacy.evaluate(n=>n===document.activeElement),true);
 }
 console.log('PASS: actual Chromium browser zoom 2.0 (720 CSS px, DPR 2), both themes, Undo/Redo + preset actions/dialog focus, expanded settings/Help/focus');
}finally{await context.close();await rm(root,{recursive:true,force:true});}
