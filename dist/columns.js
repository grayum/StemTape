// Legacy icons belonged to the second data column. Capture that identity before moving it.
export const cueColumnId=e=>e.cueColumnId??e.columns[1].id;
export function moveColumn(e,id,target){
 const from=e.columns.findIndex(c=>c.id===id);
 if(from<1||!Number.isInteger(target)||target<1||target>=e.columns.length||from===target)return false;
 e.cueColumnId=cueColumnId(e);
 const [c]=e.columns.splice(from,1);e.columns.splice(target,0,c);return true;
}
export function canRemoveColumn(e,id){
 const at=e.columns.findIndex(c=>c.id===id);
 return at>0&&e.columns.length>2;
}
export function removeColumn(e,id){
 if(!canRemoveColumn(e,id))return false;
 const cue=cueColumnId(e),at=e.columns.findIndex(c=>c.id===id);e.columns.splice(at,1);
 for(const mode of ['distance','time'])for(const r of e.rows[mode])delete r.cells[id];
 // Explicit removal may change the icon host, but hiding/reordering never does.
 if(cue===id)e.cueColumnId=e.columns[1].id;
 else e.cueColumnId=cue;
 return true;
}
