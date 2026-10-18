import {BUILTIN_PRESET_NAMES} from './presets.js';
import {clone,uid,serializeState,validateEvent} from './core.js';

export const PRESET_NAME_COLLISION='A preset with this name already exists. Choose a different name.';
import {nameKey,uniqueEventName} from './names.js';
function availableName(state,name,excludeId){
 const key=nameKey(name);
 if(Object.values(BUILTIN_PRESET_NAMES).some(n=>nameKey(n)===key)||state.presets.some(p=>(!excludeId||p.id!==excludeId)&&nameKey(p.name)===key)){
  const error=Error(PRESET_NAME_COLLISION);error.code='preset-name-collision';throw error;
 }
}
// Display-only library positions distinguish even legacy duplicates, never identities.
export function personalPresetLabel(presets,preset){return `${preset.name} · personal preset ${presets.indexOf(preset)+1}`;}

// Candidate-only operations: callers must persist the entire validated candidate
// in one atomic write before exposing it. No history or storage side effects here.
export function presetTemplate(plan){const e=clone(plan);delete e.presetId;return e;}
export function presetChange(state,operation,{planId=state.active,id,name,index}={}){
 const next=clone(state),plan=next.events.find(e=>e.id===planId);
 const preset=next.presets.find(p=>p.id===id&&id);
 const cleanName=value=>{if(typeof value!=='string'||!value.trim()||value.trim().length>40)throw Error('Use a preset name of 1–40 characters.');return value.trim();};
 if(!plan)throw Error('Plan not found.');
 if(operation==='new'){
  const label=cleanName(name);availableName(next,label);
  if(next.presets.length>=20)throw Error('Maximum 20 presets.');
  const p={name:label,event:presetTemplate(plan),id:uid()};next.presets.push(p);plan.presetId=p.id;
 }else if(operation==='use'){
  const p=preset??(Number.isInteger(index)?next.presets[index]:null);
  if(!p)throw Error('Preset not found.');
  if(next.events.length>=30)throw Error('Maximum 30 events.');
  p.id??=uid();const e=clone(p.event);e.id=uid();e.name=uniqueEventName(next.events,e.name);e.presetId=p.id;next.events.push(e);next.active=e.id;
 }else{
  if(!preset)throw Error('Personal preset not found. Bundled examples cannot be changed.');
  if(operation==='update'||operation==='rename'){
   if(plan.presetId!==id)throw Error('This plan is not associated with that preset.');
   const event=operation==='update'?presetTemplate(plan):preset.event;
   const label=operation==='rename'?cleanName(name):preset.name;
   if(operation==='rename'&&label!==preset.name)availableName(next,label,id);
   // Update captures content, never a preset rename, even if a caller supplies a name.
   const content=e=>{const {id,...data}=validateEvent(e);return JSON.stringify(data);};
   if(content(event)===content(preset.event)&&label===preset.name)return null;
   preset.previous={name:preset.name,event:preset.event};preset.name=label;preset.event=event;
  }else if(operation==='recover'){
   if(!preset.previous)throw Error('No previous preset version.');
   const previous=preset.previous;preset.previous={name:preset.name,event:preset.event};preset.name=previous.name;preset.event=previous.event;
  }else if(operation==='delete'){
   next.presets=next.presets.filter(p=>p.id!==id);
   for(const e of next.events)if(e.presetId===id)delete e.presetId;
  }else throw Error('Unknown preset operation.');
 }
 // Includes both revisions and association metadata in the existing UTF-8 budget.
 serializeState(next);return next;
}
