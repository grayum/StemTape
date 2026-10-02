import {serializeState,utf8Bytes,LIMITS} from './core.js';

export const validSaveTime=value=>Number.isSafeInteger(value)&&value>0&&value<=8_640_000_000_000_000;
// Metadata shares the atomic state write and byte budget. Never evict plan data for it.
export function prepareSave(state,now){
 const candidate={...state};delete candidate.savedAt;
 const raw=serializeState(candidate); // Validate the complete plan before considering metadata.
 if(!validSaveTime(now))return {raw,savedAt:null};
 const timed=JSON.stringify({...JSON.parse(raw),savedAt:now});
 return utf8Bytes(timed)<=LIMITS.bytes?{raw:timed,savedAt:now}:{raw,savedAt:null};
}
export function relativeSaveAge(savedAt,now){
 if(!validSaveTime(savedAt))return 'time unknown';
 if(!validSaveTime(now)||now<savedAt)return 'clock changed';
 const minutes=Math.floor((now-savedAt)/60000);
 if(minutes===0)return 'just now';
 if(minutes<60)return `${minutes} minute${minutes===1?'':'s'} ago`;
 const hours=Math.floor(minutes/60);
 if(hours<24)return `${hours} hour${hours===1?'':'s'} ago`;
 const days=Math.floor(hours/24);return `${days} day${days===1?'':'s'} ago`;
}
// Dependency injection keeps storage, quota, clocks and tab-conflict tests deterministic.
export class SaveSession{
 constructor({read,write,raw=null,savedAt=null,available=true,recovery=false,now=()=>Date.now()}){
  Object.assign(this,{read,write,raw,now});
  this.lastSavedAt=!recovery&&validSaveTime(savedAt)?savedAt:null;this.timePersisted=this.lastSavedAt!==null;
  this.phase=recovery?'recovery':!available?'failed':raw===null?'unsaved':'stored';
 }
 save(state,{recovery=false}={}){
  const at=this.now(),prepared=prepareSave(state,at);
  if(recovery){this.phase='recovery';return {ok:false,blocked:true};}
  try{
   // Do not silently replace a newer tab's data (or an externally cleared key).
   if(this.read()!==this.raw){this.phase='conflict';return {ok:false,conflict:true};}
   this.write(prepared.raw); // The only success boundary. One key, one atomic write.
   this.raw=prepared.raw;this.lastSavedAt=validSaveTime(at)?at:null;this.timePersisted=prepared.savedAt!==null;this.phase='stored';
   return {ok:true,savedAt:prepared.savedAt,raw:prepared.raw};
  }catch{this.phase='failed';return {ok:false};}
 }
 observe(raw){if(raw!==this.raw)this.phase='conflict';}
 view({draft=false,now=this.now()}={}){
  const exact=this.lastSavedAt===null?'':new Date(this.lastSavedAt).toISOString();
  const previous=exact?` Previous successful save: ${exact}.`:'';
  if(this.phase==='recovery')return {text:'Not saved — original protected; export recovery copy',exact:'',announcement:'Not saved. Original data is protected; export a recovery copy.',success:false};
  if(this.phase==='conflict')return {text:'Not saved — storage changed in another tab; export this plan, then reload',exact,announcement:'Not saved. Storage changed in another tab. Export this plan before reloading.'+previous,success:false};
  if(this.phase==='failed')return {text:'Not saved — storage unavailable; export a backup',exact,announcement:'Not saved. Browser storage is unavailable.'+previous,success:false};
  if(this.phase==='unsaved'&&!draft)return {text:'Not saved yet',exact,announcement:'Not saved yet.',success:false};
  if(draft)return {text:'Not saved — unaccepted changes',exact,announcement:'Not saved. Correct or cancel unaccepted changes.'+previous,success:false};
  if(this.lastSavedAt===null)return {text:'Stored on this device — save time unknown',exact:'',announcement:'Stored on this device. Save time unknown.',success:false};
  return {text:`✓ Saved ${relativeSaveAge(this.lastSavedAt,now)}`,exact,announcement:'Saved on this device.',success:true};
 }
}
