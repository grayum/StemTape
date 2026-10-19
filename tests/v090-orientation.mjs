// Focused follow-up; existing full suites cover unaffected state/history/layout.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {initialState,clone,serializeState} from '../dist/core.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BASE_URL||'http://127.0.0.1:8080/';
try{
 await page.goto(base);const seed=initialState(),event=seed.events[0];seed.active=event.id;Object.assign(event.layout,{width:80,length:140,grid:'full',footerEnabled:true,footerText:'Ride safely'});const first=clone(event.rows.distance[0]);event.rows.distance=[];
 for(const colour of ['default','blue'])for(const [i,key]of ['bar','bottle','gel'].entries()){
  const row=clone(first);row.id=crypto.randomUUID();row.symbol=key;row.cells[event.columns[0].id]=event.rows.distance.length*1000;row.cells[event.columns[1].id]=`${key} ${colour}`;if(colour!=='default')row.iconColour=colour;event.rows.distance.push(row);
 }
 const checkBounds=async locator=>{
  const bounds=await locator.evaluate(root=>{
   const points=[];for(const shape of root.children){const box=shape.getBBox(),matrix=shape.transform.baseVal.consolidate()?.matrix??root.createSVGMatrix();
    if(shape.tagName==='path'){const length=shape.getTotalLength();for(let i=0;i<=600;i++)points.push(shape.getPointAtLength(length*i/600).matrixTransform(matrix));}
    else for(const [x,y]of [[box.x,box.y],[box.x+box.width,box.y],[box.x,box.y+box.height],[box.x+box.width,box.y+box.height]])points.push(new DOMPoint(x,y).matrixTransform(matrix));
   }
   return {minX:Math.min(...points.map(p=>p.x))-.9,maxX:Math.max(...points.map(p=>p.x))+.9,minY:Math.min(...points.map(p=>p.y))-.9,maxY:Math.max(...points.map(p=>p.y))+.9};
  });assert.ok(bounds.minX>0&&bounds.minY>0&&bounds.maxX<24&&bounds.maxY<24,JSON.stringify(bounds));
 };
 for(const theme of ['light','dark']){
  seed.theme=theme;await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(seed));await page.reload();await page.evaluate(()=>document.fonts.ready);const persisted=await page.evaluate(()=>localStorage.getItem('stemtape.v1'));
  for(const [i,row]of event.rows.distance.entries()){
   const editor=page.locator('#editor-rows .symbol-button').nth(i).locator('svg');await checkBounds(editor);const paths=await editor.innerHTML();assert.equal(await page.locator('#sheet-preview [data-cue-icon]').nth(i).innerHTML(),paths);
   await page.locator('#editor-rows .symbol-button').nth(i).click();const picker=page.getByRole('button',{name:row.symbol==='bottle'?'Bottle':row.symbol==='bar'?'Bar':'Gel',exact:true}).locator('svg');assert.equal(await picker.innerHTML(),paths);await checkBounds(picker);await picker.screenshot({path:`artifacts/v090-orientation-${theme}-${row.symbol}-${row.iconColour??'default'}.png`});await page.keyboard.press('Escape');assert.equal(await page.locator('#editor-rows .symbol-button').nth(i).evaluate(n=>n===document.activeElement),true);
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('stemtape.v1')),persisted,'Inspection/cancellation must not mutate saved state');assert.equal(await page.locator('#undo').isDisabled(),true);
  await page.screenshot({path:`artifacts/v090-orientation-screen-${theme}.png`,fullPage:true});await page.evaluate(()=>window.print=()=>{});await page.locator('#print').click();assert.equal(await page.locator('#print-pages svg[aria-label="Printable cue sheet"]').innerHTML(),await page.locator('#sheet-preview>svg').innerHTML());await page.emulateMedia({media:'print'});await page.pdf({path:`artifacts/v090-orientation-${theme}.pdf`,preferCSSPageSize:true,printBackground:true});await page.emulateMedia({media:'screen'});
 }
 assert.deepEqual(errors,[]);console.log('PASS: Bar/Gel/Bottle upright at 0 degrees; monochrome/colour, both themes, picker/editor/preview/print equality, stroke bounds, untouched state/history and PDFs');
}finally{await context.close();await browser.close();}
