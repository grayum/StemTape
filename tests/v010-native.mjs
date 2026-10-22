import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {v010Regressions} from './v010-browser.mjs';
const require=createRequire(import.meta.url),engine=process.env.STEMTAPE_BROWSER||'chromium';
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
await mkdir('artifacts',{recursive:true});const browser=await pw[engine].launch({headless:true});
try{console.log(`${engine} ${browser.version()}`);await v010Regressions(browser,process.env.BASE_URL||'http://127.0.0.1:8080/',{engine,pdf:engine==='chromium'});}finally{await browser.close();}
