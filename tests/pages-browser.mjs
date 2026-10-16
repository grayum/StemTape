// Plain static hosting: no Nginx rewrites or response security headers.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=new URL(process.env.BASE_URL||'http://127.0.0.1:8081/StemTape/');
assert.equal(base.pathname,'/StemTape/');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 const errors=[],failures=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('requestfailed',r=>failures.push(r.url()));
 page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
 page.on('request',r=>requests.push(r.url()));
 const response=await page.goto(base.href);
 assert.equal(response.status(),200);
 assert.equal(response.headers()['content-security-policy'],undefined,'Exercise meta CSP alone');
 assert.equal(response.headers()['x-frame-options'],undefined);
 await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('#editor-rows tr').count(),6);
 assert.equal(await page.locator('#print').isEnabled(),true);
 // Check the policy matches production except the header-only anti-framing directive.
 const nginx=await readFile(new URL('../deploy/nginx.conf',import.meta.url),'utf8');
 const policy=nginx.match(/add_header Content-Security-Policy "([^"]+)"/)[1];
 const meta=await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
 assert.equal(meta,policy.replace("; frame-ancestors 'none'",''));
 assert.equal(await page.evaluate(()=>{
  const meta=document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  return [...document.querySelectorAll('link,script')].every(n=>!!(meta.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_FOLLOWING));
 }),true,'CSP precedes resource loads');
 assert.equal(await page.evaluate(()=>document.fonts.check('400 12px StemSans')&&document.fonts.check('700 12px StemSans')),true);
 // Check all document-linked assets, including alternate/touch icons not fetched by Chromium.
 const assets=await page.locator('link[href],script[src]').evaluateAll(nodes=>nodes.map(n=>n.href||n.src));
 for(const asset of assets){
  assert.ok(asset.startsWith(base.href),asset);
  const r=await page.request.get(asset);assert.equal(r.status(),200,asset);
 }
 await page.locator('#event-name').fill('Pages path check');
 await page.locator('#event-name').blur();
 await Promise.all([page.waitForURL(base.href),page.getByRole('link',{name:'StemTape home'}).click()]);
 assert.equal(await page.locator('#event-name').inputValue(),'Pages path check','Home stays under project path and retains state');
 const internal=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.href).filter(h=>new URL(h).origin===location.origin));
 assert.ok(internal.length>0);
 for(const href of internal){assert.ok(href.startsWith(base.href),href);assert.equal((await page.request.get(href)).status(),200);}
 const security=await page.request.get(new URL('.well-known/security.txt',base).href);
 assert.equal(security.status(),200);
 assert.equal(await security.text(),await readFile(new URL('../dist/.well-known/security.txt',import.meta.url),'utf8'));
 assert.equal((await page.request.get(new URL('missing-page',base).href)).status(),404,'No SPA fallback');
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 for(const url of requests)assert.ok(url.startsWith(base.href)||url.startsWith('blob:'),url);
 for(const file of ['app.js','core.js','styles.css','assets/StemSans.ttf','assets/StemSans-Bold.ttf']){
  assert.ok(requests.includes(new URL(file,base).href),`Loaded ${file}`);
 }
 // Deliberate policy probes use a separate page so normal-use errors stay meaningful.
 const probe=await browser.newPage();await probe.goto(base.href);
 await probe.evaluate(()=>{
  window.policyViolations=[];
  document.addEventListener('securitypolicyviolation',e=>window.policyViolations.push(e.effectiveDirective));
  const script=document.createElement('script');script.textContent='window.inlineExecuted=true';document.head.append(script);
  const style=document.createElement('style');style.textContent='body{display:none}';document.head.append(style);
  const object=document.createElement('object');object.data='data:text/html,blocked';document.body.append(object);
  const base=document.createElement('base');base.href='/elsewhere/';document.head.append(base);
  return fetch('./app.js').then(()=>{throw Error('connect-src did not block fetch');},()=>{});
 });
 await probe.waitForFunction(()=>['script-src-elem','style-src-elem','object-src','base-uri','connect-src'].every(d=>window.policyViolations.includes(d)));
 assert.equal(await probe.evaluate(()=>window.inlineExecuted),undefined);
 assert.equal(await probe.evaluate(()=>document.baseURI),base.href);
 console.log('PASS: /StemTape/ assets, fonts, home navigation, security.txt and meta-only CSP enforcement.');
}finally{await browser.close();}
