import {BUILTIN_CUES} from './presets.js';
// Pure data model: canonical metres and elapsed minutes; no HTML or network access.
export const VERSION = 1;
export const KEY = 'stemtape.v1';
export const LIMITS = {events: 30, rows: 200, columns: 8, text: 160, footer: 80, bytes: 2_000_000};
export const SYMBOLS = ['','banana','bottle','bar','gel','smile','mountain','feed','flag','coffee','warning','cobbles','ricecake','can','neutral','litter'];
export const uid = () => globalThis.crypto.randomUUID();
export const clone = value => JSON.parse(JSON.stringify(value));
export function column(label, type='text', width=50) { return {id:uid(), label, type, width, visible:true, align:type==='distance'||type==='number'?'right':'left', bold:false}; }
export function createEvent(preset='nutrition') {
  const first=column('km','distance',32); first.bold=true;
  // No provenance marker exists on stored labels; only new templates get the new default.
  const columns = [first, column(preset==='nutrition'?'Fuel':'Note','text',68)];
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
  // Optional references preserve identity across moves; absent fields keep legacy byte budgets unchanged.
  if(Object.hasOwn(e,'cueColumnId')){
    out.cueColumnId=str(e.cueColumnId,64,'cue column reference');
    if(!cols.slice(1).some(c=>c.id===out.cueColumnId))throw Error('Invalid cue column reference.');
  }
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
  // Absent footer fields mean disabled/empty. Do not inflate old exact-budget plans on load.
  if(Object.hasOwn(l,'footerEnabled'))out.layout.footerEnabled=boolean(l.footerEnabled,'footer visibility');
  if(Object.hasOwn(l,'footerText')){
    out.layout.footerText=str(l.footerText,LIMITS.footer,'footer text (80-character maximum; most emojis count as two)');
    if(/[\r\n\t\u2028\u2029]/.test(l.footerText))throw Error('Footer must be a single line.');
  }
  return out;
}
export function validateState(s){
  if(s?.version!==VERSION)throw Error('Unsupported backup version.');
  if(!Array.isArray(s.events)||s.events.length<1||s.events.length>LIMITS.events)throw Error('Backup must contain 1–30 events.');
  const events=s.events.map(validateEvent);if(new Set(events.map(e=>e.id)).size!==events.length)throw Error('Duplicate event IDs.');
  if(!Array.isArray(s.presets)||s.presets.length>20)throw Error('Too many personal presets.');
  const presets=s.presets.map(p=>({name:str(p.name,40,'preset name'),event:validateEvent(p.event)}));
  let bike=null;if(s.bike){const e=createEvent();e.layout={...e.layout,...s.bike};const l=validateEvent(e).layout;bike={width:l.width,length:l.length,padding:l.padding,rotation:l.rotation};}
  const out={bike,version:VERSION,theme:choice(s.theme,['light','dark','system'],'theme'),active:events.some(e=>e.id===s.active)?s.active:events[0].id,events,presets};
  // Optional v1 metadata. Legacy backups remain unchanged; malformed metadata enters recovery.
  if(Object.hasOwn(s,'savedAt')){
    if(!Number.isSafeInteger(s.savedAt)||s.savedAt<=0||s.savedAt>8_640_000_000_000_000)throw Error('Invalid save timestamp.');
    out.savedAt=s.savedAt;
  }
  return out;
}
export function parseCSV(text){
  if(utf8Bytes(text)>LIMITS.bytes)throw Error('File exceeds 2 MB.');
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
export function exportCSV(e){
  const cols=e.columns.slice(1).filter(c=>c.visible),head=[e.mode==='time'?'time':`distance_${e.unit}`,'icon',...cols.map(c=>csvHeader(c,e.unit,e))];
  return '\uFEFF'+[head,...e.rows[e.mode].map(r=>[e.mode==='time'?formatTime(r.cells[e.columns[0].id]):displayDistance(r.cells[e.columns[0].id],e.unit),r.symbol,...cols.map(c=>c.type==='distance'?displayDistance(r.cells[c.id],e.unit):r.cells[c.id])])].map(r=>r.map(safeCSVCell).join(',')).join('\r\n');
}
export function importCSV(text){
  const data=parseCSV(text);if(data.length<2)throw Error('CSV needs a header and at least one row.');
  const h=data.shift().map(v=>v.trim()),first=h[0]?.toLowerCase(),mode=['time','h:mm'].includes(first)?'time':'distance';
  if(!['time','h:mm','distance_km','km','distance_mi','mi'].includes(first))throw Error('First CSV column must be distance_km, distance_mi or time (h:mm).');
  const iconIndex=h[1]?.toLowerCase()==='icon'?1:-1,start=iconIndex===1?2:1;
  if((h.length-start<1&&iconIndex!==1)||h.length-start>7)throw Error('CSV needs 1–7 cue columns, or position and icon only.');
  const meta=h.slice(start).map(parseCSVHeader);
  if(['cue'].some(role=>meta.filter(c=>c.role===role).length>1))throw Error('Duplicate CSV column role.');
  const e=createEvent('nutrition');e.name='Imported plan';e.mode=mode;e.unit=first.endsWith('mi')?'mi':'km';
  e.columns=[e.columns[0],...meta.map(c=>column(c.label,c.type,50))];e.rows={distance:[],time:[]};
  for(const [i,c]of meta.entries())if(c.role)e.cueColumnId=e.columns[i+1].id;
  // CSV omits hidden data, so icon-only imports need a blank data column.
  if(e.columns.length===1)e.columns.push(column('Fuel','text',68));
  for(const values of data){
    if(values.length!==h.length)throw Error('CSV rows must match the header length.');
    const raw=values[0].trim();if(!raw)throw Error('Every row needs a distance or time.');
    const n=mode==='time'?parseTime(raw):toMetres(raw,e.unit);if(!Number.isFinite(n)||n<0)throw Error('Distances must be positive numbers.');
    const r={id:uid(),symbol:iconIndex===1?values[1]:'',cells:{[e.columns[0].id]:n}};
    e.columns.slice(1).forEach((c,i)=>{
      if(!meta[i]){r.cells[c.id]='';return;}
      const value=values[start+i];if(c.type==='distance'&&!value.trim())throw Error('Every distance cell needs a number.');
      r.cells[c.id]=c.type==='distance'?toMetres(value,meta[i].unit):value;
    });e.rows[mode].push(r);
  }
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

// One wire representation and UTF-8 budget for persisted state and complete backups.
export const utf8Bytes = text => new TextEncoder().encode(text).length;
export function assertByteLimit(text) {
  if (utf8Bytes(text)>LIMITS.bytes) throw Error('Complete state exceeds 2,000,000 UTF-8 bytes. Export existing data and remove events or presets before adding more.');
  return text;
}
export function serializeState(state) {
  return assertByteLimit(JSON.stringify(validateState(state)));
}
export function parseState(text) {
  assertByteLimit(text);
  const state=validateState(JSON.parse(text));
  serializeState(state);
  return state;
}
export function totalDistanceMaximum(unit) { return 10_000_000/(unit==='mi'?1609.344:1000); }
export function validatedTotal(value,unit) {
  if(String(value).trim()==='')throw Error('Enter a total distance.');
  return finite(toMetres(value,unit),0,10_000_000,'total distance');
}
// Roll back rejected edits in place so existing row/column handlers retain their references.
export function restoreObject(target,source) {
  for(const key of Object.keys(target))if(!Object.hasOwn(source,key))delete target[key];
  for(const [key,value] of Object.entries(source)) {
    if(value && typeof value==='object' && target[key] && typeof target[key]==='object' && Array.isArray(value)===Array.isArray(target[key]))restoreObject(target[key],value);
    else target[key]=clone(value);
  }
  if(Array.isArray(target))target.length=source.length;
}

// Explicit metadata avoids confusing literal labels such as "Water [km]" with units.
const CSV_COLUMN_PREFIX='stemtape:column:';
function csvHeader(c,unit,e) {
  const role=c.id===e.cueColumnId?'cue':null;
  const meta=[c.type==='distance'?'distance':'text',c.label,c.type==='distance'?unit:null];
  if(role)meta.push(role);
  return role||c.type==='distance'||c.label.startsWith(CSV_COLUMN_PREFIX)?CSV_COLUMN_PREFIX+JSON.stringify(meta):c.label;
}
function parseCSVHeader(header) {
  if(!header.startsWith(CSV_COLUMN_PREFIX))return {label:header,type:'text'};
  const meta=JSON.parse(header.slice(CSV_COLUMN_PREFIX.length));
  if(!Array.isArray(meta)||![3,4].includes(meta.length)||!['text','distance'].includes(meta[0])||typeof meta[1]!=='string'||(meta[0]==='distance'?!['km','mi'].includes(meta[2]):meta[2]!==null)||
     (meta.length===4&&meta[3]!=='cue'))throw Error('Invalid CSV column metadata.');
  return {type:meta[0],label:meta[1],unit:meta[2],role:meta[3]};
}
