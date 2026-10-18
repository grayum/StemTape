import assert from 'node:assert/strict';
import {initialState,serializeState} from '../dist/core.js';

export async function v062Regressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  const state=initialState(),event=state.events[0];state.active=event.id;
  event.rows.distance=event.rows.distance.slice(0,1);event.rows.distance[0].symbol='bottle';
  await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(state));
  await page.reload();await page.evaluate(()=>document.fonts.ready);
  const editor=page.locator('#editor-rows .symbol-button').first();
  await editor.click();const bottle=page.getByRole('button',{name:'Bottle',exact:true});
  const paths=await bottle.locator('svg').innerHTML();
  // Sample actual curves after rotation, including the existing 1.8-unit stroke.
  const bounds=await bottle.locator('path').evaluateAll(nodes=>{
   const points=[];
   for(const path of nodes){const matrix=path.transform.baseVal.consolidate().matrix,length=path.getTotalLength();
    for(let i=0;i<=1000;i++){const p=path.getPointAtLength(length*i/1000).matrixTransform(matrix);points.push(p);}}
   return {minX:Math.min(...points.map(p=>p.x))-.9,maxX:Math.max(...points.map(p=>p.x))+.9,minY:Math.min(...points.map(p=>p.y))-.9,maxY:Math.max(...points.map(p=>p.y))+.9};
  });
  assert.ok(bounds.minX>0&&bounds.minY>0&&bounds.maxX<24&&bounds.maxY<24,'Rotated artwork and stroke stay within the existing viewBox');
  await page.screenshot({path:'artifacts/v062-picker.png',fullPage:true});await bottle.click();
  assert.equal(await editor.locator('svg').innerHTML(),paths);
  assert.equal(await page.locator('#sheet-preview svg svg').first().innerHTML(),paths);
  await page.evaluate(()=>{window.print=()=>{};});await page.locator('#print').click();
  assert.equal(await page.locator('#print-pages svg svg svg').first().innerHTML(),paths);
  await page.emulateMedia({media:'print'});await page.screenshot({path:'artifacts/v062-print.png',fullPage:true});
  await page.pdf({path:'artifacts/v062-print.pdf',preferCSSPageSize:true});await page.emulateMedia({media:'screen'});
  for(const width of [1440,390,320])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});await page.locator(`button[data-theme=${theme}]`).click();
   if(width<=740)await page.locator('button[data-tab=preview]').click();
   const privacy=page.locator('#privacy');
   assert.equal(await privacy.evaluate(n=>n.parentElement.matches('.preview-card')&&n===n.parentElement.lastElementChild),true);
   assert.equal(await page.locator('.print-hint strong').textContent(),'Scale 100% / Actual size.');
   assert.equal(await page.locator('.print-hint').textContent(),'Print at Scale 100% / Actual size. Cut marks and a 50 mm scale are added to the page.');
   const geometry=await privacy.evaluate(n=>{const r=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect(),hint=n.previousElementSibling.getBoundingClientRect();return {top:r.top,hintBottom:hint.bottom,bottom:r.bottom,parentBottom:p.bottom,right:r.right,innerRight:p.right-parseFloat(getComputedStyle(n.parentElement).paddingRight)-parseFloat(getComputedStyle(n.parentElement).borderRightWidth),position:getComputedStyle(n).position};});
   assert.ok(geometry.top>=geometry.hintBottom&&geometry.bottom<=geometry.parentBottom);
   assert.ok(Math.abs(geometry.right-geometry.innerRight)<1,'Help action aligns with the frame right padding');
   assert.ok(!['absolute','fixed'].includes(geometry.position));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await privacy.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   assert.equal(await privacy.evaluate(n=>n===document.activeElement&&n.matches(':focus-visible')),true);
   await privacy.scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/v062-preview-${width}-${theme}.png`,fullPage:true});
   await privacy.press('Enter');const dialog=page.locator('#dialog');
   assert.equal(await dialog.locator('strong').first().textContent(),'Scale 100% / Actual size.');
   const text=await dialog.textContent();assert.match(text,/Fit to page can change physical dimensions/);assert.match(text,/printed 50 mm scale with a ruler/);assert.match(text,/GitHub Pages behind Cloudflare/);assert.doesNotMatch(text,/Self-hosted installations/);
   assert.equal(await dialog.evaluate(n=>n.scrollWidth>n.clientWidth+1),false);
   await page.screenshot({path:`artifacts/v062-help-${width}-${theme}.png`,fullPage:true});
   await page.keyboard.press('Escape');assert.equal(await privacy.evaluate(n=>n===document.activeElement),true,'Native dialog restores focus to relocated trigger');
  }
  assert.deepEqual(errors,[]);console.log('PASS: v0.6.2 icon bounds/shared rendering, print emphasis, responsive Help placement and focus');
 }finally{await context.close();}
}
