import assert from 'node:assert/strict';
import {initialState,serializeState,clone,SYMBOLS,column} from '../dist/core.js';
import {ICON_COLOURS} from '../dist/icon-colours.js';
import {COLOURED_OUTLINE,STROKE_ONLY_CUES} from '../dist/icon-fills.js';
import {CELL_PADDING} from '../dist/grid.js';

export async function v090Refinements(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const initial=initialState();initial.active=initial.events[0].id;const event=initial.events[0];event.layout={...event.layout,width:100,length:200,font:10,grid:'full',footerEnabled:true,footerText:'Ride safely'};
 const row=clone(event.rows.distance[0]);event.rows.distance=SYMBOLS.filter(Boolean).map((symbol,i)=>({...clone(row),id:crypto.randomUUID(),symbol,cells:{...row.cells,[event.columns[0].id]:i*1000,[event.columns[1].id]:symbol}}));
 const seed=async s=>{await page.evaluate(raw=>localStorage.setItem('stemtape.v1',raw),serializeState(s));await page.reload();await page.evaluate(()=>document.fonts.ready);};
 const edit=async()=>{if(await page.locator('button[data-tab=edit]').isVisible())await page.locator('button[data-tab=edit]').click();};
 const preview=async()=>{if(await page.locator('button[data-tab=preview]').isVisible())await page.locator('button[data-tab=preview]').click();};
 try{
  await page.goto(base);
  for(const theme of ['light','dark'])for(const palette of ICON_COLOURS){
   const s=clone(initial);s.theme=theme;for(const r of s.events[0].rows.distance)if(palette.value)r.iconColour=palette.id;await seed(s);
   const artwork=page.locator('#sheet-preview [data-cue-icon]');assert.equal(await artwork.count(),15);
   for(let i=0;i<15;i++){
    const symbol=SYMBOLS[i+1],layers=artwork.nth(i).locator('[data-icon-fill]');assert.equal(await layers.count()>0,Boolean(palette.value&&!STROKE_ONLY_CUES.includes(symbol)),symbol);
    if(palette.value){assert.equal(await artwork.nth(i).getAttribute('color'),palette.value);if(!STROKE_ONLY_CUES.includes(symbol))assert.equal(await artwork.nth(i).locator('[stroke="'+COLOURED_OUTLINE+'"]').count()>0,true);}
   }
   const buttons=page.locator('#editor-rows .symbol-button');const banana=await buttons.first().evaluate(n=>({bg:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color}));const bottle=await buttons.nth(1).evaluate(n=>({bg:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color}));assert.deepEqual(banana,bottle,'Banana gets no special default or selected surface/text treatment');
   await buttons.first().click();await page.screenshot({path:`artifacts/v090-filled-picker-${theme}-${palette.id}.png`,fullPage:true});await page.keyboard.press('Escape');assert.equal(await buttons.first().evaluate(n=>n===document.activeElement),true);
   await preview();assert.equal(await page.locator('#print').isEnabled(),true);await page.locator('#sheet-preview').screenshot({path:`artifacts/v090-filled-sheet-${theme}-${palette.id}.png`});
   await page.evaluate(()=>window.print=()=>{});await page.locator('#print').click();assert.equal(await page.locator('#print-pages svg[aria-label="Printable cue sheet"]').innerHTML(),await page.locator('#sheet-preview>svg').innerHTML());await page.emulateMedia({media:'print'});await page.pdf({path:`artifacts/v090-filled-${theme}-${palette.id}.pdf`,preferCSSPageSize:true,printBackground:true});await page.emulateMedia({media:'screen'});
  }
  // Measure actual header/body/icon placement, including custom/Note and a hidden column.
  const s=clone(initial),e=s.events[0];e.rows.distance=e.rows.distance.slice(0,2);e.rows.distance[0].iconColour='blue';const note=column('Note','text',25),extra=column('Extra','text',25),hidden=column('Hidden','text',25);hidden.visible=false;extra.align='center';e.cueColumnId=e.columns[1].id;e.noteColumnId=note.id;e.columns.splice(1,0,note);e.columns.push(extra,hidden);for(const r of e.rows.distance){r.cells[note.id]='Village';r.cells[extra.id]='Cafe';r.cells[hidden.id]='Hidden content';}
  for(const mode of ['none','rows','full'])for(const header of [true,false]){
   e.layout.grid=mode;e.layout.header=header;await seed(s);const visible=e.columns.filter(c=>c.visible),sum=visible.reduce((n,c)=>n+c.width,0),widths=visible.map(c=>(e.layout.width-2*e.layout.padding)*c.width/sum);
   const positions=await page.locator('#sheet-preview text:not([data-footer])').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,x:Number(n.getAttribute('x')),anchor:n.getAttribute('text-anchor')})));
   assert.equal(positions.some(p=>p.text==='Hidden content'),false);let x=e.layout.padding;
   for(const [i,c]of visible.entries()){
    const body=positions.find(p=>p.text===String(c.id===note.id?'Village':c.id===extra.id?'Cafe':c.id===e.columns[0].id?'0':'banana'));assert.ok(body,`${mode} ${c.label}`);let expected=x+CELL_PADDING;if(c.align==='right'||(c.align==='auto'&&['distance','number'].includes(c.type)))expected=x+widths[i]-CELL_PADDING;else if(c.align==='center')expected=x+widths[i]/2;else if(c.id===e.cueColumnId||c.id===initial.events[0].columns[1].id)expected+=e.layout.font*25.4/72+1;
    assert.ok(Math.abs(body.x-expected)<.001,`${c.label}: ${body.x} != ${expected}`);x+=widths[i];
   }
   const iconX=Number(await page.locator('#sheet-preview [data-cue-icon]').first().getAttribute('x'));const cueIndex=visible.findIndex(c=>c.id===initial.events[0].columns[1].id);assert.ok(Math.abs(iconX-(e.layout.padding+widths.slice(0,cueIndex).reduce((a,b)=>a+b,0)+CELL_PADDING))<.001);
   await page.locator('#sheet-preview').screenshot({path:`artifacts/v090-padded-${mode}-${header}.png`});
   if(mode==='full'){await page.evaluate(()=>window.print=()=>{});await page.locator('#print').click();await page.emulateMedia({media:'print'});await page.pdf({path:`artifacts/v090-padded-columns-${header}.pdf`,preferCSSPageSize:true,printBackground:true});await page.emulateMedia({media:'screen'});}
  }
  // Narrow and wide physical sheets, all rotations, header/footer combinations.
  for(const width of [32,100])for(const rotation of [0,90,180,270])for(const header of [true,false]){
   const sample=clone(initial),p=sample.events[0];p.rows.distance=p.rows.distance.slice(0,3);Object.assign(p.layout,{width:rotation%180?150:width,length:rotation%180?width:150,rotation,header,font:8,grid:'full',footerEnabled:header});for(const r of p.rows.distance){r.iconColour='orange';r.cells[p.columns[1].id]='Cue';}await seed(sample);await preview();assert.equal(await page.locator('#print').isEnabled(),true);await page.evaluate(()=>window.print=()=>{});await page.locator('#print').click();await page.emulateMedia({media:'print'});await page.pdf({path:`artifacts/v090-padded-${width}-${rotation}-${header}.pdf`,preferCSSPageSize:true,printBackground:true});await page.emulateMedia({media:'screen'});
  }
  for(const width of [1440,390,320])for(const theme of ['light','dark']){await page.setViewportSize({width,height:1100});const s=clone(initial);s.theme=theme;s.events[0].rows.distance[0].iconColour='purple';await seed(s);await edit();await page.locator('#editor-rows .symbol-button').first().click();assert.equal(await page.locator('#dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await page.screenshot({path:`artifacts/v090-filled-responsive-${width}-${theme}.png`,fullPage:true});await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  assert.deepEqual(errors,[]);console.log('PASS: all 15 cue artworks, audited fills/open utensils, monochrome Banana, shared 0.8 mm padding, headers/Note/custom/hidden columns, narrow/wide rotated PDFs, responsive themes/focus');
 }finally{await context.close();}
}
