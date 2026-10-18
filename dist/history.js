// Session-only plan snapshots. No library, storage, schema or DOM dependencies.
export const HISTORY_LIMITS=Object.freeze({actions:20,bytes:8*1024*1024});
const cost=entry=>2*(entry.before.length+entry.after.length+entry.label.length)+256;
export class PlanHistory{
 constructor({actions=HISTORY_LIMITS.actions,bytes=HISTORY_LIMITS.bytes}={}){this.limit=actions;this.budget=bytes;this.plans=new Map();this.clock=0;}
 clear(id){if(id===undefined)this.plans.clear();else this.plans.delete(id);}
 retain(ids){const keep=new Set(ids);for(const id of this.plans.keys())if(!keep.has(id))this.clear(id);}
 view(id){const p=this.plans.get(id);return {undo:p?.undo.at(-1)?.label??'',redo:p?.redo.at(-1)?.label??''};}
 get bytes(){let bytes=0;for(const p of this.plans.values())for(const e of [...p.undo,...p.redo])bytes+=cost(e);return bytes;}
 record(id,before,after,label){
  if(before===after)return {trimmed:false};
  const p=this.plans.get(id)||{undo:[],redo:[]};this.plans.set(id,p);p.redo=[];
  const entry={before,after,label,at:++this.clock};let trimmed=false;
  // Evict before retaining a new pair; a single oversized action becomes a boundary.
  while(p.undo.length>=this.limit){p.undo.shift();trimmed=true;}
  if(cost(entry)>this.budget){p.undo=[];return {trimmed:true};}
  while(this.bytes+cost(entry)>this.budget){
   let oldest,owner,stack;
   for(const plan of this.plans.values())for(const name of ['undo','redo']){
    const candidate=plan[name][0];if(candidate&&(!oldest||candidate.at<oldest.at)){oldest=candidate;owner=plan;stack=name;}
   }
   if(!oldest)break;
   // Only evict the far end of a chain, never leave a gap in reachable history.
   if(stack==='undo')owner.undo.shift();else owner.redo.shift();trimmed=true;
  }
  p.undo.push(entry);return {trimmed};
 }
 peek(id,direction){const p=this.plans.get(id),entry=p?.[direction].at(-1);return entry?{snapshot:direction==='undo'?entry.before:entry.after,label:entry.label}:null;}
 accept(id,direction){const p=this.plans.get(id),entry=p?.[direction].pop();if(entry)p[direction==='undo'?'redo':'undo'].push(entry);}
}
