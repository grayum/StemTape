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
const root=await mkdtemp(join(tmpdir(),'stemtape-v062-zoom-'));
const ext=root,profile=join(root,'profile');
await writeFile(join(ext,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local StemTape zoom check',version:'1.0',permissions:['tabs'],host_permissions:[`${url.origin}/*`],background:{service_worker:'background.js'}}));
await writeFile(join(ext,'background.js'),'chrome.runtime.onInstalled.addListener(() => {});');
const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:null,args:['--window-size=1440,1100',`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
try{
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const page=await context.newPage();
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 const zoom=await worker.evaluate(async origin=>{const tabs=await chrome.tabs.query({url:`${origin}/*`});for(const tab of tabs)await chrome.tabs.setZoom(tab.id,2);return chrome.tabs.getZoom(tabs.at(-1).id)},url.origin);
 assert.equal(zoom,2);await page.waitForFunction(()=>innerWidth===720&&devicePixelRatio===2);
 const cdp=await context.newCDPSession(page);const shot=async name=>{const data=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});await writeFile(`artifacts/v062-zoom-200-${name}.png`,Buffer.from(data.data,'base64'));};
 for(const theme of ['light','dark']){
  await page.locator(`button[data-theme=${theme}]`).click();await page.locator('button[data-tab=preview]').click();
  const summary=page.locator('.more-settings > summary');if(!await page.locator('.more-settings').evaluate(n=>n.open))await summary.click();
  const privacy=page.locator('#privacy');await privacy.scrollIntoViewIfNeeded();await privacy.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal(await privacy.evaluate(n=>n===document.activeElement&&n.matches(':focus-visible')),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('.print-hint strong').textContent(),'Scale 100% / Actual size.');
  const fit=await privacy.evaluate(n=>{const r=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect();const style=getComputedStyle(n.parentElement);return r.bottom<=p.bottom&&r.top>=n.previousElementSibling.getBoundingClientRect().bottom&&Math.abs(r.right-(p.right-parseFloat(style.paddingRight)-parseFloat(style.borderRightWidth)))<1});assert.equal(fit,true);
  await shot(`preview-${theme}`);await privacy.press('Enter');assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await shot(`help-${theme}`);
  await page.keyboard.press('Escape');assert.equal(await privacy.evaluate(n=>n===document.activeElement),true);
 }
 console.log('PASS: actual Chromium browser zoom 2.0 (720 CSS px, DPR 2), both themes, expanded settings/Help/focus on Docker preview');
}finally{await context.close();await rm(root,{recursive:true,force:true});}
