import assert from 'node:assert/strict';
import {assertWrappedLabel} from './svg-label.mjs';
import {initialState,column,serializeState} from '../dist/core.js';
export async function v041Regressions(browser,base){
 const context=await browser.newContext({locale:'en-GB',timezoneId:'Europe/Amsterdam',viewport:{width:390,height:844},hasTouch:true}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.clock.install({time:new Date('2026-10-03T12:00:00Z')});
  await page.goto(base);await page.locator('#editor-rows tr').first().waitFor();
  assert.equal(await page.locator('#save-status-toggle').isDisabled(),true);
  const s=initialState(),e=s.events[0],c=column('Water distance','distance',20);s.active=e.id;e.unit='mi';e.columns.push(c);
  for(const row of e.rows.distance)row.cells[c.id]=1609.344;
  e.rows.time=[{id:'time-cue',symbol:'',cells:{[e.columns[0].id]:60,[e.columns[1].id]:'Water',[c.id]:3218.688}}];
  const raw=serializeState(s);await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),raw);await page.reload();
  await page.locator('#mode-time').click();assert.equal(await page.locator('#unit').isDisabled(),true);assert.equal(await page.locator('#unit').inputValue(),'mi');
  assert.equal(await page.locator('#dimension-unit').isEnabled(),true);assert.equal(await page.getByLabel('Water distance, row 1',{exact:true}).inputValue(),'2');
  await page.evaluate(()=>document.fonts.ready);
  const sheet=page.locator('#sheet-preview svg[aria-label="Printable cue sheet"]');assert.equal(await sheet.count(),1);
  const rendered=await sheet.evaluate(svg=>{
   const group=svg.querySelector(':scope > g'),children=[...group.children];
   // The first horizontal rule ends the header; x coordinates identify columns
   // independently of their text. This fixture has three columns, no rotation.
   const headerBottom=Number(children.find(n=>n.tagName==='line').getAttribute('y1'));
   const text=children.filter(n=>n.tagName==='text').map(n=>({x:Number(n.getAttribute('x')),y:Number(n.getAttribute('y')),text:n.textContent}));
   const headers=text.filter(n=>n.y<headerBottom),columns=[...new Set(headers.map(n=>n.x))].sort((a,b)=>a-b);
   const targetX=columns[2],inOrder=nodes=>nodes.sort((a,b)=>a.y-b.y).map(n=>n.text);
   return {columnCount:columns.length,headerLines:inOrder(headers.filter(n=>n.x===targetX)),cueLines:inOrder(text.filter(n=>n.x===targetX&&n.y>headerBottom))};
  });
  const diagnostic=JSON.stringify(rendered);
  assert.equal(rendered.columnCount,3,diagnostic);
  assertWrappedLabel(rendered.headerLines,'Water distance (mi)',diagnostic);
  assert.deepEqual(rendered.cueLines,['2'],diagnostic);
  await page.reload();await page.locator('#editor-rows tr').first().waitFor();assert.equal(await page.locator('#unit').isDisabled(),true);
  await page.locator('#mode-distance').click();assert.equal(await page.locator('#unit').isEnabled(),true);assert.equal(await page.locator('#unit').inputValue(),'mi');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('stemtape.v1')));
  assert.deepEqual(saved.events[0].rows,e.rows);assert.equal(saved.events[0].columns[1].label,'Fuel');
  await page.locator('#event-name').fill('Tooltip test');
  await page.waitForFunction(()=>document.getElementById('save-status').dataset.saved==='true');
  const stored=await page.evaluate(()=>localStorage.getItem('stemtape.v1'));
  const box=await page.locator('.workspace').boundingBox();await page.locator('#save-status-toggle').tap();
  assert.equal(await page.locator('#save-tooltip').isVisible(),true);assert.match(await page.locator('#save-status-time').textContent(),/GMT\+02:00/);
  assert.deepEqual(await page.locator('.workspace').boundingBox(),box);
  await page.locator('h2').first().tap();assert.equal(await page.locator('#save-tooltip').isVisible(),false);
  await page.locator('#save-status-toggle').focus();assert.equal(await page.locator('#save-tooltip').isVisible(),true);
  await page.locator('#save-status-toggle').press('Escape');assert.equal(await page.locator('#save-tooltip').isVisible(),false);
  // Previous time stays available during invalid drafts without cancelling those drafts.
  const position=page.locator('#editor-rows input').first();await position.fill('-1');await page.locator('#save-status-toggle').tap();
  assert.match(await page.locator('#save-status-label').textContent(),/Not saved/);assert.match(await page.locator('#save-status-time').textContent(),/Previous successful save/);
  assert.equal(await position.inputValue(),'-1');assert.equal(await page.evaluate(()=>localStorage.getItem('stemtape.v1')),stored);
  await page.locator('#save-status-toggle').press('Escape');
  await position.focus();await page.locator('#save-status-toggle').hover();
  assert.equal(await page.locator('#save-tooltip').isVisible(),true);
  assert.equal(await position.evaluate(n=>n===document.activeElement),true);
  // Hovered content must be dismissible without moving focus or cancelling the draft.
  await position.press('Escape');assert.equal(await page.locator('#save-tooltip').isVisible(),false);
  assert.equal(await position.inputValue(),'-1');assert.equal(await page.evaluate(()=>localStorage.getItem('stemtape.v1')),stored);
  await page.mouse.move(0,0);await page.locator('#save-status-toggle').hover();
  await page.locator('#save-tooltip').hover();assert.equal(await page.locator('#save-tooltip').isVisible(),true);
  await page.mouse.move(0,0);assert.equal(await page.locator('#save-tooltip').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
}
