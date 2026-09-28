import {BUILTIN_CUES} from './presets.js';
// Pure data model: canonical metres and elapsed minutes; no HTML or network access.
export const VERSION = 1;
export const KEY = 'stemtape.v1';
export const LIMITS = {events: 30, rows: 200, columns: 8, text: 160, bytes: 2_000_000};
export const SYMBOLS = ['','banana','bottle','bar','gel','smile','mountain','feed','flag','coffee','warning','cobbles','ricecake','can','neutral','litter'];
export const uid = () => globalThis.crypto.randomUUID();
export const clone = value => JSON.parse(JSON.stringify(value));
export function column(label, type='text', width=50) { return {id:uid(), label, type, width, visible:true, align:type==='distance'||type==='number'?'right':'left', bold:false}; }
export function createEvent(preset='nutrition') {
  const first=column('km','distance',32); first.bold=true;
  const columns = [first, column(preset==='nutrition'?'Eat / drink':'Note','text',68)];
  const values = BUILTIN_CUES[preset] || [];
  const rows=values.map(([d,s,t])=>({id:uid(),cells:{[first.id]:d*1000,[columns[1].id]:t},symbol:s}));
  return {id:uid(),name:'Sunday 120 km',preset,mode:'distance',unit:'km',dimensionUnit:'mm',totalM:120000,remaining:false,columns,rows:{distance:rows,time:[]},layout:{width:32,length:90,font:11,padding:2,gap:2,rotation:0,header:true,paper:'A4',copies:1}};
}
export function initialState(){return {version:VERSION,theme:'system',active:'',events:[createEvent()],presets:[],bike:null};}
export function displayDistance(m,unit){return +(m/(unit==='mi'?1609.344:1000)).toFixed(2);}
export function toMetres(value,unit){return Number(value)*(unit==='mi'?1609.344:1000);}
export function formatTime(n){return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
export function parseTime(s){if(!/^\d{1,3}:[0-5]\d$/.test(s))throw Error('Use elapsed time as h:mm, for example 1:30.');const [h,m]=s.split(':').map(Number);return h*60+m;}
export function cueHeader(event,c){return c===event.columns[0]?event.mode==='time'?'h:mm':`${event.unit}${event.remaining?' left':''}`:c.type==='distance'?`${c.label} (${event.unit})`:c.label;}
export function cellText(event,c,value){if(c.type==='distance'){if(c===event.columns[0]&&event.mode==='time')return formatTime(value||0);const m=(c===event.columns[0]&&event.remaining)?event.totalM-(value||0):(value||0);return String(displayDistance(m,event.unit));}return String(value??'');}
function finite(v,min,max,label){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(`Invalid ${label}.`);return v;}
function str(v,max,label){if(typeof v!=='string'||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw Error(`Invalid ${label}.`);return v;}
function choice(v,values,label){if(!values.includes(v))throw Error(`Invalid ${label}.`);return v;}
function boolean(v,label){if(typeof v!=='boolean')throw Error(`Invalid ${label}.`);return v;}
export function validateEvent(e){
  if(!e||typeof e!=='object')throw Error('Invalid event.');
  if(!Array.isArray(e.columns)||e.columns.length<2||e.columns.length>LIMITS.columns)throw Error('Use 2–8 columns.');
  const cols=e.columns.map(c=>({id:str(c.id,64,'column ID'),label:str(c.label,32,'column name'),type:choice(c.type,['text','number','distance','symbol'],'column type'),width:finite(c.width,5,95,'column width'),visible:boolean(c.visible,'visibility'),align:choice(c.align,['left','center','right'],'alignment'),bold:boolean(c.bold,'bold')}));
  if(new Set(cols.map(c=>c.id)).size!==cols.length||cols[0].type!=='distance'||!cols.some(c=>c.visible))throw Error('Invalid column structure.');
  // Reject prototype-related keys before constructing cell maps.
  if(cols.some(c=>['__proto__','constructor','prototype'].includes(c.id)))throw Error('Invalid column ID.');
  const out={id:str(e.id,64,'event ID'),name:str(e.name,80,'event name'),preset:choice(e.preset,['nutrition','route','custom'],'preset'),mode:choice(e.mode,['distance','time'],'mode'),unit:choice(e.unit,['km','mi'],'unit'),dimensionUnit:choice(e.dimensionUnit,['mm','in'],'dimension unit'),totalM:finite(e.totalM,0,10_000_000,'total distance'),remaining:boolean(e.remaining,'remaining distance'),columns:cols,rows:{}};
  if(e.preset!=='nutrition'&&e.mode!=='distance')throw Error('Time mode is only available in Nutrition plan.');
  for(const mode of ['distance','time']){
    if(!Array.isArray(e.rows?.[mode])||e.rows[mode].length>LIMITS.rows)throw Error('Too many rows (maximum 200 per mode).');
    out.rows[mode]=e.rows[mode].map(r=>{
      const row={id:str(r.id,64,'row ID'),symbol:choice(r.symbol,SYMBOLS,'symbol'),cells:{}};
      for(const [i,c] of cols.entries()){const value=r.cells?.[c.id];row.cells[c.id]=c.type==='distance'||c.type==='number'?finite(value,0,i===0&&mode==='time'?59999:10_000_000,'cell value'):str(value,LIMITS.text,'cell text');if(i===0&&mode==='time'&&!Number.isInteger(value))throw Error('Elapsed time must use whole minutes.');}
      return row;
    });
    if(new Set(out.rows[mode].map(r=>r.id)).size!==out.rows[mode].length)throw Error('Duplicate row IDs.');
  }
  const l=e.layout||{};out.layout={width:finite(l.width,20,180,'width (20–180 mm)'),length:finite(l.length,30,260,'length (30–260 mm)'),font:finite(l.font,8,24,'font size (8–24 pt)'),padding:finite(l.padding,1,8,'padding'),gap:finite(l.gap,0.5,6,'row spacing'),rotation:choice(l.rotation,[0,90,180,270],'rotation'),header:boolean(l.header,'header'),paper:choice(l.paper,['A4','Letter'],'paper'),copies:finite(l.copies,1,4,'copies')};
  if(!Number.isInteger(l.copies))throw Error('Copies must be a whole number.');
  return out;
}
export function validateState(s){
  if(s?.version!==VERSION)throw Error('Unsupported backup version.');
  if(!Array.isArray(s.events)||s.events.length<1||s.events.length>LIMITS.events)throw Error('Backup must contain 1–30 events.');
  const events=s.events.map(validateEvent);if(new Set(events.map(e=>e.id)).size!==events.length)throw Error('Duplicate event IDs.');
  if(!Array.isArray(s.presets)||s.presets.length>20)throw Error('Too many personal presets.');
  const presets=s.presets.map(p=>({name:str(p.name,40,'preset name'),event:validateEvent(p.event)}));
  let bike=null;if(s.bike){const e=createEvent();e.layout={...e.layout,...s.bike};const l=validateEvent(e).layout;bike={width:l.width,length:l.length,padding:l.padding,rotation:l.rotation};}
  return {bike,version:VERSION,theme:choice(s.theme,['light','dark','system'],'theme'),active:events.some(e=>e.id===s.active)?s.active:events[0].id,events,presets};
}
export function parseCSV(text){
  if(new TextEncoder().encode(text).length>LIMITS.bytes)throw Error('File exceeds 2 MB.');
  text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else {quoted=false;closed=true;}}else cell+=ch;}
    else if(ch==='"'){if(cell||closed)throw Error('Unexpected quote in CSV.');quoted=true;}
    else if(ch===','||ch==='\n'||ch==='\r'){row.push(cell);cell='';closed=false;if(ch!==','){if(ch==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v!==''))rows.push(row);row=[];}}
    else {if(closed)throw Error('Unexpected text after CSV quote.');cell+=ch;}
    if(cell.length>2000||rows.length>LIMITS.rows+1)throw Error('CSV exceeds row or cell limits.');
  }
  if(quoted)throw Error('Unclosed CSV quote.');if(cell||row.length){row.push(cell);if(row.some(v=>v!==''))rows.push(row);}return rows;
}
// Spreadsheet-safe CSV is not a lossless backup; JSON preserves exact strings.
export function safeCSVCell(v){let s=String(v??'');if(/^[\s]*[=+\-@\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function exportCSV(e){const head=[e.mode==='time'?'time':`distance_${e.unit}`,'icon',...e.columns.slice(1).map(c=>c.type==='distance'?`${c.label} [${e.unit}]`:c.label)];return '\uFEFF'+[head,...e.rows[e.mode].map(r=>[e.mode==='time'?formatTime(r.cells[e.columns[0].id]):displayDistance(r.cells[e.columns[0].id],e.unit),r.symbol,...e.columns.slice(1).map(c=>c.type==='distance'?displayDistance(r.cells[c.id],e.unit):r.cells[c.id])])].map(r=>r.map(safeCSVCell).join(',')).join('\r\n');}
export function importCSV(text){
  const data=parseCSV(text);if(data.length<2)throw Error('CSV needs a header and at least one row.');
  const h=data.shift().map(v=>v.trim());const first=h[0]?.toLowerCase();const mode=['time','h:mm'].includes(first)?'time':'distance';
  if(!['time','h:mm','distance_km','km','distance_mi','mi'].includes(first))throw Error('First CSV column must be distance_km, distance_mi or time (h:mm).');
  const iconIndex=h[1]?.toLowerCase()==='icon'?1:-1;const start=iconIndex===1?2:1;
  if(h.length-start<1||h.length-start>7)throw Error('CSV needs 1–7 cue columns.');
  const e=createEvent('nutrition');e.name='Imported plan';e.mode=mode;e.unit=first.endsWith('mi')?'mi':'km';e.columns=[e.columns[0],...h.slice(start).map(label=>column(label,'text',50))];e.rows={distance:[],time:[]};
  for(const values of data){if(values.length!==h.length)throw Error('CSV rows must match the header length.');const raw=values[0].trim();if(!raw)throw Error('Every row needs a distance or time.');const n=mode==='time'?parseTime(raw):toMetres(raw,e.unit);if(!Number.isFinite(n)||n<0)throw Error('Distances must be positive numbers.');const r={id:uid(),symbol:iconIndex===1?values[1]:'',cells:{[e.columns[0].id]:n}};e.columns.slice(1).forEach((c,i)=>r.cells[c.id]=values[start+i]);e.rows[mode].push(r);}
  return validateEvent(e);
}

// Move by stable ID so cue values, symbols and both mode lists remain intact.
export function moveCue(rows, id, targetIndex) {
  const from=rows.findIndex(r=>r.id===id);
  if(from<0 || !Number.isInteger(targetIndex) || targetIndex<0 || targetIndex>=rows.length || from===targetIndex)return false;
  const [row]=rows.splice(from,1);rows.splice(targetIndex,0,row);return true;
}

// Stable sorting keeps equal-position cues in their current manual order.
export function sortCuesByPosition(rows,columnId){
 rows.sort((a,b)=>a.cells[columnId]-b.cells[columnId]);
}
