// Names are display data, never identities. Compatibility validation intentionally
// permits legacy duplicates; these checks apply only to explicit naming actions.
export const nameKey=name=>name.trim().toLowerCase();
export const EVENT_NAME_COLLISION='A ride plan with this event name already exists. Choose another name.';
export function assertEventName(events,name,id){
 if(typeof name!=='string'||!name.trim())throw Error('Enter an event name.');
 const value=name.trim();if(value.length>80)throw Error('Use an event name of at most 80 characters.');
 if(events.some(e=>e.id!==id&&nameKey(e.name)===nameKey(value))){const error=Error(EVENT_NAME_COLLISION);error.code='event-name-collision';throw error;}
 return value;
}
const prefix=(text,length)=>{let s=text.slice(0,length);if(/[\uD800-\uDBFF]$/.test(s))s=s.slice(0,-1);return s.trimEnd();};
export function uniqueEventName(events,name){
 const base=prefix(name.trim()||'Untitled ride',80),taken=new Set(events.map(e=>nameKey(e.name)));
 if(!taken.has(nameKey(base)))return base;
 for(let n=2;n<=events.length+2;n++){const suffix=` (${n})`,candidate=prefix(base,80-suffix.length)+suffix;if(!taken.has(nameKey(candidate)))return candidate;}
 throw Error('Could not suggest a unique event name.');
}
export function eventDisplayLabel(events,event){
 const duplicates=events.filter(e=>nameKey(e.name)===nameKey(event.name));
 return (event.name||'Untitled ride')+(duplicates.length>1?` · ride plan ${events.indexOf(event)+1}`:'');
}
