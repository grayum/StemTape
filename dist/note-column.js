import {column,LIMITS} from './core.js';
import {cueColumnId} from './columns.js';

export const noteColumn=e=>e.columns.find(c=>c.id===e.noteColumnId);
export function showNoteColumn(e,visible){
 if(typeof visible!=='boolean')throw Error('Invalid note visibility.');
 let note=noteColumn(e);
 if(!note){
  if(e.noteColumnId!==undefined)throw Error('Invalid note column reference.');
  if(!visible)return false;
  if(e.columns.length>=LIMITS.columns)throw Error('Maximum 8 columns. Remove another column before enabling Note.');
  // Preserve explicit width shares and both mode lists; normal layout/byte checks still apply.
  e.cueColumnId=cueColumnId(e);note=column('Note','text',25);e.noteColumnId=note.id;
  e.columns.splice(1,0,note);
  for(const mode of ['distance','time'])for(const r of e.rows[mode])r.cells[note.id]='';
 }else{
  if(!visible&&!e.columns.some(c=>c.id!==note.id&&c.visible))throw Error('Keep at least one visible column.');
  if(note.visible===visible)return false;
  note.visible=visible;
 }
 return true;
}
