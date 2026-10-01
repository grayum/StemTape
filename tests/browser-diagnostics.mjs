import {mkdir,writeFile} from 'node:fs/promises';

// Node-side bookkeeping remains available even when the page main thread stalls.
export function browserDiagnostics(page){
 const started=performance.now(),pending=new Map(),errors=[],failed=[],phases=[];
 let current='setup',phaseStart=started,fixture=null;
 const resource=url=>{try{const u=new URL(url);return u.protocol==='http:'||u.protocol==='https:'?u.origin+u.pathname:u.protocol;}catch{return 'invalid URL';}};
 const log=event=>{const entry={...event,elapsedMs:Math.round(performance.now()-started)};console.log('[review-browser]',JSON.stringify(entry));return entry;};
 page.on('request',r=>pending.set(r,{url:resource(r.url()),type:r.resourceType(),started:performance.now()}));
 page.on('requestfinished',r=>pending.delete(r));
 page.on('requestfailed',r=>{failed.push({url:resource(r.url()),error:r.failure()?.errorText});pending.delete(r);});
 page.on('pageerror',e=>errors.push(e.message));
 for(const event of ['domcontentloaded','load'])page.on(event,()=>log({phase:current,event}));
 return {
  phase(name,summary=fixture){
   phases.push(log({phase:current,event:'end',durationMs:Math.round(performance.now()-phaseStart)}));
   current=name;phaseStart=performance.now();fixture=summary;
   phases.push(log({phase:current,event:'start',fixture}));
  },
  async failure(error){
   const report={phase:current,elapsedMs:Math.round(performance.now()-started),phaseElapsedMs:Math.round(performance.now()-phaseStart),fixture,
    error:String(error),pageErrors:errors,failedRequests:failed,pendingResources:[...pending.values()].map(r=>({url:r.url,type:r.type,pendingMs:Math.round(performance.now()-r.started)})),phases};
   console.error('[review-browser failure]',JSON.stringify(report));
   await mkdir('artifacts',{recursive:true});await writeFile('artifacts/review-browser-diagnostics.json',JSON.stringify(report,null,2));
  }
 };
}
export function fixtureSummary(raw){
 const s=JSON.parse(raw),active=s.events.find(e=>e.id===s.active)||s.events[0];
 return {bytes:Buffer.byteLength(raw,'utf8'),eventCount:s.events.length,presetCount:s.presets.length,activeCueCount:active.rows[active.mode].length};
}
