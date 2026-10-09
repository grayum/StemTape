import assert from 'node:assert/strict';

export async function v061Regressions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let phase='settings groups';
 const stored=()=>page.evaluate(()=>localStorage.getItem('stemtape.v1'));
 try{
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  const summary=page.locator('.more-settings > summary');await summary.focus();await summary.press('Enter');
  await page.waitForFunction(()=>document.querySelector('.more-settings').open);
  assert.equal(await page.locator('a.secondary-button,summary.secondary-button,.drag-handle.secondary-button,.column-drag-handle.secondary-button,.danger-button.secondary-button,.primary.secondary-button').count(),0,'Secondary styling is scoped to secondary action buttons');
  assert.deepEqual(await page.locator('.more-settings > .settings-group > h3').allTextContents(),['Sheet size','Appearance','Columns','Footer','Printing']);
  const footer=page.getByRole('region',{name:'Footer',exact:true}),text=footer.getByRole('textbox',{name:'Footer text',exact:true});
  assert.equal(await text.isVisible(),true);assert.equal(await text.isDisabled(),true);assert.equal(await text.inputValue(),'');
  assert.equal(await footer.locator('#footer-help').textContent(),'Printed below the cues, inside the sheet.');
  await footer.getByRole('checkbox',{name:'Show footer',exact:true}).check();await text.fill('Ride safe 🍌');
  await footer.getByRole('checkbox',{name:'Show footer',exact:true}).uncheck();assert.equal(await text.isVisible(),true);assert.equal(await text.isDisabled(),true);assert.equal(await text.inputValue(),'Ride safe 🍌');
  const accepted=await stored();await page.reload();await page.evaluate(()=>document.fonts.ready);await summary.click();
  assert.equal(await text.inputValue(),'Ride safe 🍌');assert.equal(await text.isDisabled(),true);assert.equal(await stored(),accepted,'Showing settings does not save or change the plan');
  phase='import keyboard and handlers';await page.locator('#import').click();
  const dialog=page.getByRole('dialog',{name:'Import from your device',exact:true});await dialog.waitFor({state:'visible',timeout:5000});
  const choose=dialog.getByRole('button',{name:'Choose CSV or JSON',exact:true}),paste=dialog.getByRole('button',{name:'Paste spreadsheet table',exact:true});
  assert.equal(await dialog.getByRole('region',{name:'CSV or JSON file',exact:true}).count(),1);assert.equal(await dialog.getByRole('region',{name:'Spreadsheet table',exact:true}).count(),1);
  await choose.focus();await page.keyboard.press('Tab');assert.equal(await paste.evaluate(n=>n===document.activeElement),true,'Tab reaches the second import option in DOM order');
  await paste.press('Enter');await page.getByRole('heading',{name:'Paste a spreadsheet table',exact:true}).waitFor({timeout:5000});
  await page.getByRole('textbox',{name:'Spreadsheet table',exact:true}).fill('km\ticon\tCue\n10\tbar\tEat');await page.getByRole('button',{name:'Import as new event',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('#dialog').open&&document.querySelectorAll('#editor-rows tr').length===1);
  assert.equal(await page.getByLabel('Cue, row 1',{exact:true}).inputValue(),'Eat');
  await page.locator('#import').click();
  const chooser=page.waitForEvent('filechooser');await choose.click();
  await (await chooser).setFiles({name:'layout.csv',mimeType:'text/csv',buffer:Buffer.from('km,icon,Cue\n20,bottle,Drink')});
  await page.waitForFunction(()=>!document.querySelector('#dialog').open&&document.querySelector('#toast').textContent==='CSV imported as a new event.');
  assert.equal(await page.getByLabel('Cue, row 1',{exact:true}).inputValue(),'Drink');
  phase='responsive themes';
  // 720 CSS pixels also exercises desktop reflow equivalent to a 1440px viewport at 200% zoom.
  // Actual browser zoom and visual inspection remain separate manual checks.
  for(const width of [1440,720,390,320])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1100});await page.getByRole('button',{name:theme==='light'?'Light theme':'Dark theme',exact:true}).click();
   await page.locator('#import').click();await dialog.waitFor({state:'visible',timeout:5000});await page.evaluate(()=>document.fonts.ready);
   const boxes=await dialog.locator('.import-card').evaluateAll(cards=>cards.map(card=>{
    const r=card.getBoundingClientRect(),b=card.querySelector('button').getBoundingClientRect();
    return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,actionBottom:b.bottom,clipped:card.scrollHeight>card.clientHeight+1};
   }));
   assert.equal(boxes.length,2);assert.ok(boxes.every(b=>!b.clipped),'Import cards expand to contain their text');
   if(width>520){assert.ok(Math.abs(boxes[0].width/boxes[1].width-1)<.02,'Wider import cards share equal widths');assert.ok(Math.abs(boxes[0].actionBottom-boxes[1].actionBottom)<boxes[0].height*.02,'Wider import actions align at the bottom');}
   else assert.ok(boxes[1].y>=boxes[0].bottom,'Mobile import cards stack without overlapping');
   assert.equal(await dialog.evaluate(n=>n.scrollWidth>n.clientWidth+1),false,'Import dialog has no horizontal overflow');
   await page.screenshot({path:`artifacts/v061-import-${width}-${theme}.png`,fullPage:true});await page.locator('#close-dialog').click();
   if(width<=740)await page.locator('.mobile-tabs button[data-tab="edit"]').click();
   const preset=page.getByRole('button',{name:'Save as preset',exact:true});await preset.waitFor({state:'visible',timeout:5000});
   assert.equal(await preset.evaluate(n=>getComputedStyle(n).borderTopStyle),'solid','Save as preset shares the secondary border');
   await preset.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   assert.equal(await preset.evaluate(n=>n===document.activeElement&&n.matches(':focus-visible')),true);
   await page.screenshot({path:`artifacts/v061-editor-focus-${width}-${theme}.png`,fullPage:true});
   if(width<=740)await page.locator('.mobile-tabs button[data-tab="preview"]').click();
   await page.locator('.preview-card').waitFor({state:'visible',timeout:5000});if(!await page.locator('.more-settings').evaluate(n=>n.open))await summary.click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Settings fit the responsive workspace');
   const footerBoxes=await footer.evaluate(n=>{
    const toggle=n.querySelector('#footer-enabled').closest('label').getBoundingClientRect(),field=n.querySelector('#footer-text').closest('label').getBoundingClientRect(),grid=n.querySelector('.settings-grid').getBoundingClientRect();
    return {toggleBottom:toggle.bottom,fieldTop:field.top,fieldWidth:field.width,gridWidth:grid.width};
   });
   assert.ok(footerBoxes.fieldTop>=footerBoxes.toggleBottom,'Footer text sits on its own line below Show footer');
   assert.ok(Math.abs(footerBoxes.fieldWidth/footerBoxes.gridWidth-1)<.02,'Footer text spans its entire group');
   assert.equal(await text.isVisible(),true);assert.equal(await text.isDisabled(),true);
   for(const id of ['column-details','save-bike']){
    const secondary=page.locator(`#${id}`);await secondary.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
    const normal=await secondary.evaluate(n=>{const s=getComputedStyle(n);return {border:s.borderTopColor,background:s.backgroundColor,style:s.borderTopStyle,width:parseFloat(s.borderTopWidth),height:n.getBoundingClientRect().height};});
    assert.equal(normal.style,'solid');assert.ok(normal.width>0,'Secondary action has a default visible border');assert.notEqual(normal.background,'rgba(0, 0, 0, 0)');assert.ok(normal.height>=44,'Secondary action has a comfortable touch target');
    await secondary.hover();const hover=await secondary.evaluate(n=>{const s=getComputedStyle(n);return {border:s.borderTopColor,background:s.backgroundColor};});
    assert.notEqual(hover.border,normal.border,'Hover strengthens the neutral border');assert.notEqual(hover.background,normal.background,'Hover changes the tinted background');
   }
   const focused=page.locator('#column-details');await focused.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   assert.equal(await focused.evaluate(n=>n===document.activeElement&&n.matches(':focus-visible')),true,'Keyboard focus returns to the secondary action');
   assert.equal(await focused.evaluate(n=>getComputedStyle(n).outlineColor),'rgb(197, 248, 42)','Secondary keyboard focus uses StemTape lime');
   await page.screenshot({path:`artifacts/v061-settings-${width}-${theme}.png`,fullPage:true});
  }
  assert.deepEqual(errors,[]);
 }catch(err){console.error('v0.6.1 browser phase',phase,'page errors',errors);throw err;}
 finally{await context.close();}
}
