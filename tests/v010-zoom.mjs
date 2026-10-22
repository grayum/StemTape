// Actual browser zoom via a temporary local-only Chromium extension, not CSS scaling.
import assert from 'node:assert/strict';
import {writeFile,mkdtemp,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:8080/';
const url=new URL(base);
assert.ok(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname),'Zoom extension is restricted to local testing');
const root=await mkdtemp(join(tmpdir(),'stemtape-v010-zoom-'));
const ext=root,profile=join(root,'profile');
await writeFile(join(ext,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local StemTape zoom check',version:'1.0',permissions:['tabs'],host_permissions:[`${url.origin}/*`],background:{service_worker:'background.js'}}));
await writeFile(join(ext,'background.js'),'chrome.runtime.onInstalled.addListener(() => {});');
const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:null,args:['--window-size=1440,1100',`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
try{
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker'),page=await context.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 const zoom=await worker.evaluate(async origin=>{const tabs=await chrome.tabs.query({url:`${origin}/*`});for(const tab of tabs)await chrome.tabs.setZoom(tab.id,2);return chrome.tabs.getZoom(tabs.at(-1).id)},url.origin);assert.equal(zoom,2);await page.waitForFunction(()=>innerWidth===720&&devicePixelRatio===2);
 const cdp=await context.newCDPSession(page);const shot=async name=>{const data=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});await writeFile(`artifacts/v010-zoom-200-${name}.png`,Buffer.from(data.data,'base64'));};
 for(const theme of ['light','dark']){
  await page.locator(`button[data-theme=${theme}]`).click();await page.locator('button[data-tab=edit]').click();
  await page.locator('[data-move=copy]').first().focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#editor-rows tr').count(),theme==='light'?7:8);
  assert.equal(await page.locator('#editor-rows tr').nth(1).locator('input').first().evaluate(n=>n===document.activeElement),true);
  await page.locator('[data-move=copy]').first().scrollIntoViewIfNeeded();await shot(`duplicate-${theme}`);
  await page.locator('#column-settings').click();const alignment=page.locator('.column-config').first().getByRole('combobox',{name:'Alignment',exact:true});
  await alignment.selectOption('center');await alignment.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await alignment.evaluate(n=>n===document.activeElement),true);
  assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await shot(`columns-${theme}`);
  const display=page.getByRole('combobox',{name:'Cue display',exact:true});
  await display.selectOption('icon-only');await display.focus();await page.keyboard.press('Tab');await display.scrollIntoViewIfNeeded();await shot(`cue-display-${theme}`);await page.keyboard.press('Escape');await page.locator('button[data-tab=preview]').click();if(!await page.locator('.more-settings').evaluate(n=>n.open))await page.locator('.more-settings>summary').click();await page.locator('#fit-width').check();await page.locator('#fit-width').focus();await shot(`fit-width-${theme}`);await page.locator('button[data-tab=edit]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#undo').scrollIntoViewIfNeeded();await shot(`actions-${theme}`);
 }
 console.log('PASS: actual Chromium zoom 2.0, 720 CSS px/DPR2, both themes, duplicate focus, column alignment keyboard, action wrapping and no document/dialog overflow');
}finally{await context.close();await rm(root,{recursive:true,force:true});}
