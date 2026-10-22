import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {cueDisplayRegressions} from './cue-display-browser.mjs';
const engine=process.env.STEMTAPE_BROWSER||'chromium',pw=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
await mkdir('artifacts',{recursive:true});const b=await pw[engine].launch({headless:true});
try{await cueDisplayRegressions(b,process.env.BASE_URL||'http://127.0.0.1:8080/',{engine,pdf:engine==='chromium'});}finally{await b.close();}
