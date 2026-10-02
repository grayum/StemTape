import {KEY,LIMITS,SYMBOLS,uid,clone,column,createEvent,initialState,validateEvent,displayDistance,toMetres,formatTime,parseTime,cueHeader,cellText,exportCSV,importCSV,moveCue,sortCuesByPosition,serializeState,parseState,restoreObject,totalDistanceMaximum,validatedTotal} from './core.js';
import {SaveSession} from './save-status.js';
import {ICONS} from './icons.js';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const names={'':'None',banana:'Banana',bottle:'Bottle',bar:'Bar',gel:'Gel',smile:'Smile',mountain:'Climb',feed:'Feed zone',flag:'Finish',coffee:'Coffee',warning:'Caution',cobbles:'Cobbles / pavé',ricecake:'Rice cake',can:'Softdrink',neutral:'Neutral zone',litter:'Litter zone'};
const el=(tag,a={},text)=>{const n=document.createElement(tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
const svg=(tag,a={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
function icon(name){const n=svg('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':1.8,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',class:'icon'});for(const[tag,a]of ICONS[name]||[])n.append(svg(tag,a));return n;}
function button(text,action,cls='',name){const b=el('button',{type:'button',class:cls},text);if(name)b.prepend(icon(name));b.addEventListener('click',action);return b;}
function labelled(text,input){const l=el('label',{},text);l.append(input);return l;}
function select(options,value,action){const s=el('select');for(const[v,t]of options)s.append(el('option',{value:v},t));s.value=value;s.dataset.acceptedValue=value;s.onchange=()=>{action(s.value);if(!hasInvalidEdits())s.dataset.acceptedValue=s.value;};return s;}
function numberInput(value,min,max,step,action){const i=el('input',{type:'number',min,max,step,value,required:''});i.onchange=()=>{if(!i.checkValidity()||i.value==='')return i.reportValidity();action(Number(i.value),i);};return i;}
function check(value,text,action){const i=el('input',{type:'checkbox'});i.checked=value;i.onchange=()=>action(i.checked);const l=labelled(text,i);l.className='checkbox-label';return l;}
let state=initialState(),storageOK=true,startupWarning='',recoveryBlocked=false,recoveryOriginal=null,loadedRaw=null,allowRecoveryReplacement=false;
try{const raw=localStorage.getItem(KEY);loadedRaw=raw;if(raw){try{state=parseState(raw);}catch{recoveryOriginal=raw;startupWarning='Saved data is unreadable or exceeds the supported byte limit. It has not been overwritten. Export a recovery copy before resetting.';recoveryBlocked=true;}}}catch{storageOK=false;startupWarning='Browser storage is unavailable. Export your plan before closing this page.';}
if(!state.active)state.active=state.events[0].id;
let acceptedState=serializeState(state);
const saveSession=new SaveSession({read:()=>localStorage.getItem(KEY),write:raw=>localStorage.setItem(KEY,raw),raw:loadedRaw,savedAt:state.savedAt,available:storageOK,recovery:recoveryBlocked});
const pendingEdits=new Set();let lastSaveAnnouncement='';
function refreshSaveStatus(announce=true){
 const view=saveSession.view({draft:pendingEdits.size>0||hasInvalidEdits()});
 $('save-status-label').textContent=view.text;$('save-status').dataset.saved=String(view.success);
 const time=$('save-status-time');time.hidden=!view.exact;
 time.textContent=view.exact?`${view.success?'Saved at':'Previous successful save:'} ${view.exact}${saveSession.timePersisted?'':' (time available in this tab only)'}`:'';
 if(view.exact){time.dateTime=view.exact;time.title=view.exact;}else{time.removeAttribute('datetime');time.removeAttribute('title');}
 if(announce&&view.announcement!==lastSaveAnnouncement){$('save-announcement').textContent=view.announcement;lastSaveAnnouncement=view.announcement;}
}
window.addEventListener('storage',ev=>{try{if(ev.storageArea!==localStorage)return;}catch{return;}if(ev.key===KEY||ev.key===null){saveSession.observe(ev.newValue);refreshSaveStatus();}});
// Only status nodes change: no storage writes, editor rebuilds or live age announcements.
setInterval(()=>refreshSaveStatus(false),15000);
window.addEventListener('focus',()=>{try{saveSession.observe(localStorage.getItem(KEY));}catch{saveSession.phase='failed';}refreshSaveStatus();});
const event=()=>state.events.find(e=>e.id===state.active)||state.events[0];
let activeDrag=null,pointerHeld=false,rowRefreshPending=false,rowRefreshTimer;
document.addEventListener('pointerdown',()=>{pointerHeld=true;},true);
for(const type of ['pointerup','pointercancel'])document.addEventListener(type,()=>{pointerHeld=false;if(rowRefreshPending)scheduleRowRefresh();},true);
function scheduleRowRefresh(){
 rowRefreshPending=true;clearTimeout(rowRefreshTimer);
 rowRefreshTimer=setTimeout(()=>{
  if(pointerHeld||activeDrag||hasInvalidEdits())return;
  rowRefreshPending=false;
  const focused=document.activeElement,tr=focused?.closest('#editor-rows tr');
  const id=tr?.dataset.rowId,slot=tr?[...tr.querySelectorAll('button,input')].indexOf(focused):-1;
  renderRows();
  if(id&&slot>=0)$('editor-rows').querySelector(`[data-row-id="${CSS.escape(id)}"]`)?.querySelectorAll('button,input')[slot]?.focus({preventScroll:true});
 },0);
}
let fits=true,invalidCells=new Set(),toastTimer;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function save(draftInput=null){
 const replaceRecovery=allowRecoveryReplacement;allowRecoveryReplacement=false;
 let serialized;
 try{const {savedAt,...plan}=state;serialized=serializeState(plan);}catch(err){
  restoreObject(state,JSON.parse(acceptedState));
  if(draftInput?.matches('input,textarea')){draftInput.setCustomValidity(err.message);invalidCells.add('state-edit');}
  else render();
  toast(err.message);renderPreview();return false;
 }
 acceptedState=serialized;delete state.savedAt;
 const result=saveSession.save(state,{recovery:recoveryBlocked&&!replaceRecovery});
 if(result.ok){
  if(result.savedAt===null)delete state.savedAt;else state.savedAt=result.savedAt;
  acceptedState=result.raw;storageOK=true;
  if(replaceRecovery){recoveryBlocked=false;recoveryOriginal=null;}
 }else if(!result.blocked){storageOK=false;toast(result.conflict?'Storage changed in another tab. Export this plan before reloading.':'Storage is full or unavailable. Please export a JSON backup.');}
 if(draftInput)pendingEdits.delete(draftInput);
 refreshSaveStatus();return true;
}
function commit(full=false,draftInput=null){if(!save(draftInput))return false;if(full)render();else renderPreview();return true;}
function invalidInput(){return document.querySelector('input:invalid,textarea:invalid');}
function hasInvalidEdits(){return invalidCells.size>0||!!invalidInput();}
function cancelEdits(){
 pendingEdits.clear();invalidCells.clear();document.querySelectorAll('input,textarea').forEach(n=>n.setCustomValidity(''));
 if($('dialog').open){$('dialog').close();$('dialog-body').replaceChildren();}render(true);toast('Unaccepted edits cancelled. Last accepted values restored.');
}
// Guard before action handlers mutate state. Correction or explicit Escape cancellation is required.
for(const type of ['click','pointerdown','keydown','change'])document.addEventListener(type,ev=>{
 if(!hasInvalidEdits())return;
 if(type==='keydown'&&ev.key==='Escape'){ev.preventDefault();ev.stopImmediatePropagation();cancelEdits();return;}
 const target=ev.target;
 if(target.id==='cancel-edits')return;
 if(target===invalidInput()&&target.matches('input,textarea'))return;
 if(type==='keydown'&&ev.key==='Tab')return;
 if(type==='change'&&target.matches('select'))target.value=target.dataset.acceptedValue??target.value;
 ev.preventDefault();ev.stopImmediatePropagation();toast('Correct the invalid entry, or press Escape to cancel it.');
},true);
// Clear the prior error on correction. The saving handler supplies its own input;
// native events can run microtasks between capture and target listeners.
document.addEventListener('input',ev=>{
 ev.target.setCustomValidity?.('');invalidCells.delete('state-edit');
 if(ev.target.type!=='checkbox'&&ev.target.matches('#event-name,#editor-rows input,.layout-controls input,.settings-grid input,.column-config input'))pendingEdits.add(ev.target);
},true);
document.addEventListener('input',()=>refreshSaveStatus());
document.addEventListener('change',()=>refreshSaveStatus());
$('cancel-edits').onclick=cancelEdits;
function rememberSelects(){document.querySelectorAll('select').forEach(n=>n.dataset.acceptedValue=n.value);}
function openDialog(title){$('dialog-title').textContent=title;$('dialog-body').replaceChildren();if(!$('dialog').open)$('dialog').showModal();return $('dialog-body');}
$('close-dialog').onclick=()=>$('dialog').close();
$('dialog').addEventListener('click',e=>{if(e.target===$('dialog')){const r=$('dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('dialog').close();}});
function confirmAction(title,text,action){const d=openDialog(title);if(recoveryBlocked)offerOriginal(d);d.append(el('p',{},text));const a=el('div',{class:'dialog-actions'});a.append(button('Cancel',()=>$('dialog').close()),button('Continue',()=>{$('dialog').close();action();},'primary'));d.append(a);}
function applyTheme(){document.documentElement.dataset.theme=state.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):state.theme;document.querySelectorAll('button[data-theme]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===state.theme));}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
document.querySelectorAll('button[data-theme]').forEach(b=>{const text=b.textContent;b.replaceChildren(icon({light:'sun',dark:'moon',system:'monitor'}[b.dataset.theme]),el('span',{},text));b.onclick=()=>{state.theme=b.dataset.theme;applyTheme();save();};});
document.querySelectorAll('[data-icon]').forEach(b=>b.prepend(icon(b.dataset.icon)));
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.body.dataset.tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-pressed',t===b));});
function updateEvents(){const s=$('event-select');s.replaceChildren(...state.events.map(e=>el('option',{value:e.id},e.name||'Untitled ride')));s.value=event().id;}
function render(force=false){if(!force&&hasInvalidEdits())return;applyTheme();const e=event();updateEvents();$('event-name').value=e.name;
$('preset').replaceChildren(el('option',{value:'nutrition'},'Nutrition plan'),el('option',{value:'route'},'Route notes'),el('option',{value:'custom'},'Custom'),...state.presets.map((p,i)=>el('option',{value:`saved:${i}`},`${p.name} · saved`)));$('preset').value=e.preset;
$('unit').value=e.unit;$('mode-distance').setAttribute('aria-pressed',e.mode==='distance');$('mode-time').setAttribute('aria-pressed',e.mode==='time');$('mode-time').disabled=e.preset!=='nutrition';$('unit').disabled=e.mode==='time';$('dimension-unit').value=e.dimensionUnit;
const factor=e.dimensionUnit==='in'?25.4:1;for(const[id,min,max]of [['width',20,180],['length',30,260]]){const n=$(id);n.min=min/factor;n.max=max/factor;n.step='any';n.value=e.layout[id]/factor;}
for(const id of ['font','padding','gap','rotation','paper','copies'])$(id).value=e.layout[id];$('header').checked=e.layout.header;$('total').max=totalDistanceMaximum(e.unit);$('total').step='any';$('total').value=Math.min(displayDistance(e.totalM,e.unit),totalDistanceMaximum(e.unit));$('remaining').checked=e.remaining;$('remaining').disabled=e.mode==='time';$('mode-note').textContent=e.mode==='time'?'Elapsed time since the start. Enter hours:minutes.':'Distances are entered from the start. Display units can be changed.';renderRows(force);renderPreview();rememberSelects();}
function renderRows(force=false){if(!force&&hasInvalidEdits())return;rowRefreshPending=false;clearTimeout(rowRefreshTimer);const e=event(),rows=e.rows[e.mode];$('row-count').textContent=`${rows.length} ${rows.length===1?'cue':'cues'}`;const head=el('tr');head.append(el('th',{},'#'));e.columns.forEach((c,i)=>{if(i===1)head.append(el('th',{},'Icon'));head.append(el('th',{},i===0?(e.mode==='time'?'h:mm':e.unit):c.label));});head.append(el('th',{},''));$('editor-head').replaceChildren(head);const body=$('editor-rows');body.replaceChildren();
rows.forEach((r,index)=>{const tr=el('tr',{'data-row-id':r.id});const order=el('td',{class:'row-order'}),grip=button('',()=>{},'drag-handle','grip');grip.setAttribute('aria-label',`Reorder row ${index+1}`);grip.setAttribute('aria-describedby','drag-help');grip.title='Drag to reorder · Arrow Up / Down';attachRowDrag(grip,tr,r.id);order.append(grip,el('span',{class:'row-number'},String(index+1)));tr.append(order);e.columns.forEach((c,i)=>{if(i===1){const td=el('td',{class:'symbol-cell'}),b=button('',()=>symbolPicker(r),'symbol-button');b.dataset.symbol=r.symbol;b.setAttribute('aria-label',`Choose icon for row ${index+1}`);b.title=names[r.symbol];b.append(icon(r.symbol||'plus'));td.append(b);tr.append(td);}
const td=el('td',{class:i===0?'distance-cell':''}),isTime=i===0&&e.mode==='time',input=el('input',{'aria-label':`${i===0?(isTime?'Time':e.unit):c.label}, row ${index+1}`});if(isTime){input.type='text';input.placeholder='1:30';input.pattern='[0-9]{1,3}:[0-5][0-9]';input.value=formatTime(r.cells[c.id]);}else if(c.type==='distance'||c.type==='number'){input.type='number';input.min='0';input.max=c.type==='distance'?String(10_000_000/(e.unit==='mi'?1609.344:1000)):'10000000';input.step='any';input.value=c.type==='distance'?displayDistance(r.cells[c.id],e.unit):r.cells[c.id];}else{input.type='text';input.maxLength=LIMITS.text;input.value=r.cells[c.id];}
const key=r.id+c.id;input.oninput=()=>{input.setCustomValidity('');try{if(!input.checkValidity()||(input.type==='number'&&input.value===''))throw Error('Enter a valid non-negative number.');const v=isTime?parseTime(input.value):c.type==='distance'?toMetres(input.value,e.unit):c.type==='number'?Number(input.value):input.value;r.cells[c.id]=v;invalidCells.delete(key);if(!commit(false,input))invalidCells.add(key);else if(rowRefreshPending)scheduleRowRefresh();}catch(err){invalidCells.add(key);input.setCustomValidity(err.message);renderPreview();}};let originalValue=r.cells[c.id];
input.onfocus=()=>{if(!invalidCells.has(key))originalValue=r.cells[c.id];};
input.onblur=()=>{
 if(invalidCells.has(key))return;
 if(i===0&&r.cells[c.id]!==originalValue){
  originalValue=r.cells[c.id];sortCuesByPosition(rows,c.id);commit();scheduleRowRefresh();
 }
};
if(i===0)input.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();input.blur();}};td.append(input);tr.append(td);});
const td=el('td'),actions=el('div',{class:'row-actions'});for(const[label,name,action]of [['Move row up','up',()=>{const at=rows.findIndex(row=>row.id===r.id);if(moveCue(rows,r.id,at-1)){commit(true);announceMove(r.id,'up');}}],['Move row down','down',()=>{const at=rows.findIndex(row=>row.id===r.id);if(moveCue(rows,r.id,at+1)){commit(true);announceMove(r.id,'down');}}],['Delete row','trash',()=>{const at=rows.findIndex(row=>row.id===r.id);if(at>=0)rows.splice(at,1);commit(true);}]] ){const b=button('',action,'',name);b.setAttribute('aria-label',`${label} ${index+1}`);b.dataset.move=name;if(name!=='trash')b.setAttribute('aria-disabled',String(name==='up'&&index===0||name==='down'&&index===rows.length-1));actions.append(b);}td.append(actions);tr.append(td);body.append(tr);});}
function symbolPicker(row){const d=openDialog('Choose a cue symbol');d.append(el('p',{},'These outline icons print consistently. You can also paste emojis directly into any text field.'));const g=el('div',{class:'option-grid'});for(const name of ['',...SYMBOLS.filter(Boolean).sort((a,b)=>names[a].localeCompare(names[b],'en',{sensitivity:'base'}))]){const b=button(names[name],()=>{row.symbol=name;$('dialog').close();commit(true);});if(name)b.prepend(icon(name));g.append(b);}d.append(g);}
const ctx=document.createElement('canvas').getContext('2d');
function wrap(text,width,font,bold){ctx.font=`${bold?'700':'400'} ${font}px StemSans`;const lines=[];let line='';for(const ch of Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text),s=>s.segment)){if(ch==='\n'){lines.push(line);line='';continue;}if(line&&ctx.measureText(line+ch).width>width){const p=line.lastIndexOf(' ');if(p>0){lines.push(line.slice(0,p));line=line.slice(p+1)+ch;}else{lines.push(line);line=ch;}}else line+=ch;}lines.push(line);return lines;}
function makeSheet(){const e=event(),l=e.layout,rotated=l.rotation===90||l.rotation===270,w=rotated?l.length:l.width,h=rotated?l.width:l.length;const root=svg('svg',{xmlns:NS,viewBox:`0 0 ${l.width} ${l.length}`,width:`${l.width}mm`,height:`${l.length}mm`,role:'img','aria-label':'Printable cue sheet'});root.append(svg('rect',{width:l.width,height:l.length,fill:'white'}));const g=svg('g');if(l.rotation===90)g.setAttribute('transform',`translate(${l.width} 0) rotate(90)`);if(l.rotation===180)g.setAttribute('transform',`translate(${l.width} ${l.length}) rotate(180)`);if(l.rotation===270)g.setAttribute('transform',`translate(0 ${l.length}) rotate(270)`);root.append(g);
const cols=e.columns.filter(c=>c.visible),sum=cols.reduce((s,c)=>s+c.width,0),inner=w-2*l.padding,widths=cols.map(c=>inner*c.width/sum),font=l.font*25.4/72,lineHeight=font*1.25;let y=l.padding;const warnings=[];
const draw=(cells,header,row,index)=>{let x=l.padding;const all=cols.map((c,i)=>{const symbol=!header&&row.symbol&&c===e.columns[1]?row.symbol:null,reserve=symbol?font+1:0,available=widths[i]-1.5-reserve,lines=wrap(cells[i],Math.max(available,1),font,header||c.bold);if(available<font*.65||lines.some(line=>ctx.measureText(line).width>available+.01))warnings.push(`Column “${c.label}” is too narrow.`);return{lines,symbol,reserve};});const height=Math.max(...all.map(a=>a.lines.length))*lineHeight+l.gap;
all.forEach((a,i)=>{const c=cols[i];if(a.symbol){const ic=icon(a.symbol);for(const[k,v]of Object.entries({x,y:y+.4,width:font,height:font,color:'#111'}))ic.setAttribute(k,v);ic.removeAttribute('class');g.append(ic);}let tx=x+.5+a.reserve,anchor='start';if(c.align==='right'){tx=x+widths[i]-.8;anchor='end';}else if(c.align==='center'){tx=x+widths[i]/2+a.reserve/2;anchor='middle';}a.lines.forEach((line,j)=>g.append(svg('text',{x:tx,y:y+font+j*lineHeight,'font-family':'StemSans','font-size':font,'font-weight':header||c.bold?700:400,'text-anchor':anchor,fill:'#111'},line)));x+=widths[i];});y+=height;g.append(svg('line',{x1:l.padding,y1:y-.4,x2:w-l.padding,y2:y-.4,stroke:header?'#222':'#b9b9b9','stroke-width':header?.3:.15}));if(y>h-l.padding)warnings.push(header?'Headers do not fit.':`Row ${index+1} exceeds the strip length.`);};
if(l.header)draw(cols.map(c=>cueHeader(e,c)),true,null,0);e.rows[e.mode].forEach((r,i)=>draw(cols.map(c=>cellText(e,c,r.cells[c.id])),false,r,i));if(!e.rows[e.mode].length)warnings.push('Add at least one cue before printing.');if(e.remaining&&e.mode==='distance'&&e.rows.distance.some(r=>r.cells[e.columns[0].id]>e.totalM))warnings.push('A cue is beyond the total ride distance.');if(invalidCells.size||document.querySelector('.layout-controls input:invalid, .settings-grid input:invalid'))warnings.push('Fix the highlighted input before printing.');return{root,warnings:[...new Set(warnings)],used:y+l.padding};}
function renderPreview(){refreshSaveStatus();$('cancel-edits').hidden=!hasInvalidEdits();const e=event(),{root,warnings,used}=makeSheet();$('sheet-preview').replaceChildren(root);$('size-label').textContent=`${+e.layout.width.toFixed(1)} × ${+e.layout.length.toFixed(1)} mm`;fits=warnings.length===0;$('fit-status').className=fits?'':'overflow';$('fit-status').textContent=fits?`✓ Fits your strip · ${Math.round(used)} mm of content`:`${warnings.slice(0,2).join(' ')} Increase the size, simplify the cues or adjust columns.`;$('print').disabled=!fits;}
function addEvent(e){if(state.events.length>=LIMITS.events)return toast('Maximum 30 saved events. Export a backup and remove an event.');state.events.push(e);state.active=e.id;return commit(true);}
function withBike(e){try{const p=state.bike;if(p){const candidate=clone(e);candidate.layout={...e.layout,...p};e.layout=validateEvent(candidate).layout;}}catch{}return e;}
$('event-select').onchange=()=>{state.active=$('event-select').value;commit(true);};$('new-event').onclick=()=>{const e=withBike(createEvent());e.name='Untitled ride';e.rows={distance:[],time:[]};addEvent(e);};$('duplicate-event').onclick=()=>{const e=clone(event());e.id=uid();e.name=(e.name+' · copy').slice(0,80);addEvent(e);};
$('delete-event').onclick=()=>confirmAction('Delete this event?',`“${event().name}” will be removed from this browser. Export a backup first if you need a copy.`,()=>{const id=event().id;state.events=state.events.filter(e=>e.id!==id);if(!state.events.length)state.events=[withBike(createEvent())];state.active=state.events[0].id;commit(true);});
$('event-name').oninput=()=>{const input=$('event-name');event().name=input.value;commit(false,input);updateEvents();};
$('preset').onchange=()=>{const val=$('preset').value;if(val==='custom'){event().preset='custom';event().mode='distance';commit(true);return;}if(val.startsWith('saved:')){confirmAction('Apply saved preset?','This creates a new event with the saved template. Your current event is kept.',()=>{const e=clone(state.presets[Number(val.split(':')[1])].event);e.id=uid();addEvent(e);});render();return;}if(val===event().preset)return;confirmAction('Start with this preset?','A new event will be created with example cues. Your current event is kept.',()=>addEvent(withBike(createEvent(val))));render();};
for(const mode of ['distance','time'])$(`mode-${mode}`).onclick=()=>{if(mode==='time'&&event().preset!=='nutrition')return;event().mode=mode;commit(true);};$('unit').onchange=()=>{event().unit=$('unit').value;commit(true);};$('dimension-unit').onchange=()=>{event().dimensionUnit=$('dimension-unit').value;commit(true);};
for(const id of ['width','length','font','padding','gap','rotation','copies','paper'])$(id).onchange=()=>{const input=$(id);if(!input.checkValidity()||input.value==='')return input.reportValidity();const e=event(),candidate=clone(e);candidate.layout[id]=id==='paper'?input.value:Number(input.value)*(id==='width'||id==='length'?(e.dimensionUnit==='in'?25.4:1):1);try{e.layout=validateEvent(candidate).layout;commit(false,input);}catch(err){input.setCustomValidity(err.message);toast(err.message);renderPreview();}};
$('header').onchange=()=>{event().layout.header=$('header').checked;commit();};$('remaining').onchange=()=>{event().remaining=$('remaining').checked;commit();};$('total').onchange=()=>{const input=$('total');input.setCustomValidity('');try{const metres=validatedTotal(input.value,event().unit);if(!input.checkValidity())throw Error('Enter a valid total distance.');event().totalM=metres;commit(false,input);}catch(err){input.setCustomValidity(err.message);renderPreview();}};$('save-bike').onclick=()=>{try{const{width,length,padding,rotation}=event().layout;state.bike={width,length,padding,rotation};if(save())toast(storageOK&&!recoveryBlocked?'Bike dimensions saved for new plans.':'Bike dimensions changed in memory — not saved.');}catch{toast('Could not save bike dimensions.');}};
$('add-row').onclick=()=>{const e=event(),rows=e.rows[e.mode];if(rows.length>=LIMITS.rows)return toast('Maximum 200 cues per mode.');const r={id:uid(),symbol:'',cells:{}};e.columns.forEach((c,i)=>r.cells[c.id]=c.type==='number'||c.type==='distance'?i===0?(rows.at(-1)?.cells[c.id]||0):0:'');rows.push(r);commit(true);$('editor-rows').lastElementChild?.querySelector('input')?.focus();};$('sort').onclick=()=>{const e=event();sortCuesByPosition(e.rows[e.mode],e.columns[0].id);commit(true);};
$('save-preset').onclick=()=>{const d=openDialog('Save a personal preset');d.append(el('p',{},'Save columns, dimensions and both sets of cues as a reusable template on this device.'));const input=el('input',{maxlength:40,placeholder:'e.g. Long Sunday nutrition'});d.append(labelled('Preset name',input));d.append(button('Save preset',()=>{if(!input.value.trim())return input.focus();if(state.presets.length>=20)return toast('Maximum 20 presets.');state.presets.push({name:input.value.trim(),event:clone(event())});$('dialog').close();if(commit(true))toast(storageOK&&!recoveryBlocked?'Personal preset saved.':'Personal preset created in memory — not saved.');},'primary'));};
function columnsDialog(){const d=openDialog('Columns');d.append(el('p',{},'Widths are relative shares of the strip. Hidden columns stay in your data. The first distance/time column cannot be removed.'));const e=event();e.columns.forEach((c,i)=>{const row=el('div',{class:'column-config'}),name=el('input',{value:c.label,maxlength:32});name.oninput=()=>{c.label=name.value;commit(false,name);};row.append(labelled('Name',name));const type=select(['text','number','distance','symbol'].map(t=>[t,t]),c.type,v=>{const populated=['distance','time'].some(mode=>e.rows[mode].some(r=>r.cells[c.id]!==''&&r.cells[c.id]!==0));if(populated){toast('Add a new column to change type without losing values.');type.value=c.type;return;}c.type=v;for(const mode of ['distance','time'])e.rows[mode].forEach(r=>r.cells[c.id]=v==='number'||v==='distance'?0:'');commit(true);});type.disabled=i===0;row.append(labelled('Field type',type),labelled('Width share',numberInput(c.width,5,95,1,(v,input)=>{c.width=v;commit(false,input);})),labelled('Alignment',select(['left','center','right'].map(v=>[v,v]),c.align,v=>{c.align=v;commit();})),check(c.visible,'Show in print',v=>{if(!v&&e.columns.filter(c=>c.visible).length===1){toast('Keep at least one visible column.');columnsDialog();return;}c.visible=v;commit();}),check(c.bold,'Bold',v=>{c.bold=v;commit();}));
if(i>0){const actions=el('div',{class:'actions wide'}),up=button('Move left',()=>{if(i>1){[e.columns[i-1],e.columns[i]]=[e.columns[i],e.columns[i-1]];commit(true);columnsDialog();}});up.disabled=i===1;const remove=button('Remove',()=>confirmAction('Remove column?',`“${c.label}” and its values in both modes will be removed.`,()=>{e.columns.splice(i,1);for(const mode of ['distance','time'])for(const r of e.rows[mode])delete r.cells[c.id];commit(true);columnsDialog();}),'danger-button');remove.disabled=e.columns.length<=2;actions.append(up,remove);row.append(actions);}d.append(row);});const actions=el('div',{class:'dialog-actions'}),add=button('Add column',()=>{if(e.columns.length>=8)return;const c=column('New column');e.columns.push(c);for(const mode of ['distance','time'])for(const r of e.rows[mode])r.cells[c.id]='';commit(true);columnsDialog();},'','plus');add.disabled=e.columns.length>=8;actions.append(add,button('Done',()=>{$('dialog').close();render();},'primary'));d.append(actions);}
$('column-settings').onclick=columnsDialog;
function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=el('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function filename(){return event().name.replace(/[^a-zA-Z0-9_-]/g,'-').replace(/-+/g,'-').slice(0,60)||'stemtape';}
$('export').onclick=()=>{const d=openDialog('Export your plan');if(recoveryBlocked)offerOriginal(d);d.append(el('p',{},'CSV contains the current mode’s cues, including hidden columns. JSON backs up all events, both modes, presets and preferences.'));d.append(button('CSV · current cue table',()=>{download(exportCSV(event()),'text/csv;charset=utf-8',`${filename()}-${event().mode}.csv`);$('dialog').close();},'export-option','download'),button('JSON · complete backup',()=>{download(serializeState(state),'application/json','stemtape-backup.json');$('dialog').close();},'export-option','save'));d.append(el('p',{},'CSV protects formula-like text for spreadsheets. Use JSON for exact preservation of custom types, formatting and text.'));};
$('import').onclick=()=>{const d=openDialog('Import from your device');d.append(el('p',{},'CSV creates a new event. The first column must be distance_km, distance_mi or time (h:mm), optionally followed by icon, then your cue columns. Files stay on this device.'));d.append(el('p',{},'JSON backups are validated before you choose whether to restore. Maximum file and complete-state size: 2,000,000 UTF-8 bytes.'));d.append(button('Choose CSV or JSON',()=>$('file-input').click(),'primary','upload'), button('Paste spreadsheet table',pasteTable));};
$('file-input').onchange=async()=>{const f=$('file-input').files[0];$('file-input').value='';if(!f)return;try{if(f.size>LIMITS.bytes)throw Error('File exceeds 2,000,000 UTF-8 bytes. Keep this original file for recovery; it has not been changed.');const text=await f.text();if(hasInvalidEdits())throw Error('Correct or cancel unaccepted edits before importing.');if(f.name.toLowerCase().endsWith('.csv')){const e=importCSV(text);$('dialog').close();if(addEvent(e))toast('CSV imported as a new event.');}else if(f.name.toLowerCase().endsWith('.json')){const candidate=parseState(text),d=openDialog('Restore backup?');d.append(el('p',{},`This replaces your ${state.events.length} current event(s) with ${candidate.events.length} event(s) from the backup, including preferences and presets.`));if(recoveryBlocked)offerOriginal(d);const a=el('div',{class:'dialog-actions'});a.append(button(recoveryBlocked?'Back up temporary in-memory plan':'Back up current data',()=>download(serializeState(state),'application/json','stemtape-before-restore.json')),button('Restore backup',()=>{state=candidate;allowRecoveryReplacement=true;$('dialog').close();if(commit(true))toast(recoveryBlocked?'Backup loaded in memory; original still protected.':storageOK?'Backup restored.':'Backup loaded in memory — not saved.');},'primary'));d.append(a);}else throw Error('Choose a .csv or .json file.');}catch(err){const d=openDialog('Import could not be completed');d.append(el('p',{},`${err.message} Your existing plans have not been changed.`));}};
function offerOriginal(d){d.append(el('p',{class:'warning'},'The original saved data is protected. The visible plan is temporary fallback data, not your original. Replacement will overwrite the original; export it first.'),button('Export original recovery data',()=>download(recoveryOriginal??'','application/json','stemtape-recovery.json')));}
function help(){const d=openDialog('Your plan. Your device.');for(const text of ['Create your cues, choose a usable stem or top-tube width and length, then print at 100% / Actual size. Disable browser print headers and footers. Check the 50 mm calibration line with a ruler.','The preview is enlarged. If content does not fit, printing is blocked: increase the strip size, simplify text, hide columns or reduce spacing. Font size never shrinks automatically.','Nutrition entries are your own reminders. Distance and elapsed-time modes keep separate cue lists. Switching units converts distances; switching to time does not estimate ride speed.','Changing a distance or elapsed time sorts cues when you leave the field or press Enter. You can then drag cues or use the arrow buttons to keep a manual order until the next position edit. Equal positions keep their relative order.','Outline icons are bundled Lucide graphics. Pasted Unicode emojis use your device’s emoji font and can look different on another device. Test-print custom emojis before your ride.','Your ride plans stay yours. Everything you enter, including imported files, is processed and saved only on this device, in your browser. Your cue data is never uploaded to or stored on our servers. There are no accounts, trackers or third-party font requests.','When you load the website, the host still receives normal connection information such as your IP address. Hosting logs depend on the operator; this is separate from your locally stored plans.','Browser storage is not encrypted and can be cleared by you or your browser. Each domain has its own data. Export JSON to transfer plans or keep a backup.'])d.append(el('p',{},text));if(recoveryBlocked){offerOriginal(d);d.append(el('p',{class:'warning'},startupWarning),button('Reset saved data',()=>confirmAction('Reset browser data?','The unreadable copy will be replaced. Export the recovery file first.',()=>{allowRecoveryReplacement=true;commit(true);}),'danger-button'));}d.append(button('Clear all local StemTape data',()=>confirmAction('Clear local data?','All events, presets, preferences and bike dimensions in this browser will be removed. Export JSON first.',()=>{try{localStorage.removeItem('stemtape.bike');}catch{}state=initialState();state.active=state.events[0].id;allowRecoveryReplacement=true;if(commit(true))toast(storageOK&&!recoveryBlocked?'Local StemTape data reset.':'Reset is in memory only — not saved.');}),'danger-button'));}
$('help').onclick=help;$('privacy').onclick=help;
function preparePrint(){const e=event(),{root,warnings}=makeSheet();$('print-pages').replaceChildren();if(warnings.length)return false;const W=e.layout.paper==='A4'?190:195.9,H=e.layout.paper==='A4'?277:259.4,outerW=e.layout.width+8,outerH=e.layout.length+8;if(outerW>W||outerH+16>H){toast('Strip is too large for this paper. Reduce dimensions or choose A4.');return false;}const css=[...document.styleSheets].find(s=>s.href?.endsWith('styles.css'));if(css){for(let i=css.cssRules.length-1;i>=0;i--)if(css.cssRules[i].type===CSSRule.PAGE_RULE)css.deleteRule(i);css.insertRule(`@page { size: ${e.layout.paper}; margin: 10mm; }`,css.cssRules.length);}for(let copy=0;copy<e.layout.copies;copy++){const page=el('div',{class:'print-page'}),sheet=svg('svg',{xmlns:NS,viewBox:`0 0 ${W} ${outerH+16}`,width:`${W}mm`,height:`${outerH+16}mm`}),c=root.cloneNode(true);for(const[k,v]of Object.entries({x:4,y:4,width:e.layout.width,height:e.layout.length}))c.setAttribute(k,v);sheet.append(c);for(const x of [4,4+e.layout.width])for(const y of [4,4+e.layout.length]){const sx=x===4?-1:1,sy=y===4?-1:1;sheet.append(svg('line',{x1:x+sx,y1:y,x2:x+sx*3,y2:y,stroke:'#000','stroke-width':.2}),svg('line',{x1:x,y1:y+sy,x2:x,y2:y+sy*3,stroke:'#000','stroke-width':.2}));}const y=outerH+6;sheet.append(svg('line',{x1:4,y1:y,x2:54,y2:y,stroke:'#000','stroke-width':.3}));for(const x of [4,54])sheet.append(svg('line',{x1:x,y1:y-1,x2:x,y2:y+1,stroke:'#000','stroke-width':.3}));sheet.append(svg('text',{x:4,y:y+5,'font-family':'StemSans','font-size':2.5,fill:'#000'},'50 mm · Print at 100% / Actual size'));page.append(sheet);$('print-pages').append(page);}return true;}
$('print').onclick=async()=>{await document.fonts.ready;if(preparePrint())window.print();};window.addEventListener('beforeprint',preparePrint);
render();refreshSaveStatus();if(startupWarning){toast(startupWarning);if(recoveryBlocked)help();}document.fonts.ready.then(renderPreview);

function pasteTable(){
 const d=openDialog('Paste a spreadsheet table');d.append(el('p',{},'Copy a range including headers. First column: km, mi or time. Optional second column: icon. Remaining columns contain your cues.'));
 const input=el('textarea',{rows:9,'aria-label':'Spreadsheet table',placeholder:'km\ticon\tCue\n20\tbanana\tBanana'});d.append(input);
 d.append(button('Import as new event',()=>{try{let text=input.value;if(text.includes('\t'))text=text.split(/\r?\n/).map(line=>line.split('\t').map(cell=>'"'+cell.replaceAll('"','""')+'"').join(',')).join('\n');const e=importCSV(text);$('dialog').close();addEvent(e);}catch(err){toast(err.message);}},'primary'));
}

for(const id of ['width','length','font','padding','gap','total']){$(id).required=true;$(id).addEventListener('input',renderPreview);}

// Pointer Events give mouse, pen and touch the same handle-only reorder behavior.
// Native HTML drag-and-drop is deliberately avoided: it is inconsistent on touch.

function announceMove(id,direction){
 const i=event().rows[event().mode].findIndex(r=>r.id===id);
 $('reorder-status').textContent=`Cue moved to position ${i+1}.`;
 const row=$('editor-rows').querySelector(`[data-row-id="${CSS.escape(id)}"]`);
 (direction?row?.querySelector(`[data-move="${direction}"]`):row?.querySelector('.drag-handle'))?.focus({preventScroll:true});
}
function attachRowDrag(handle,tr,id){
 handle.addEventListener('keydown',e=>{
  if(!['ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
  e.preventDefault();if(hasInvalidEdits()){toast('Finish correcting the current entry before reordering.');return;}
  const rows=event().rows[event().mode],from=rows.findIndex(r=>r.id===id);
  const to=e.key==='Home'?0:e.key==='End'?rows.length-1:from+(e.key==='ArrowUp'?-1:1);
  if(moveCue(rows,id,to)){commit(true);announceMove(id);}
 });
 handle.addEventListener('pointerdown',e=>{
  if(e.button!==0||!e.isPrimary||activeDrag)return;
  if(hasInvalidEdits()){toast('Finish correcting the current entry before reordering.');return;}
  e.preventDefault();handle.focus({preventScroll:true});
  const drag={handle,tr,id,pointer:e.pointerId,startY:e.clientY,x:e.clientX,y:e.clientY,started:false,frame:0};activeDrag=drag;
  handle.setPointerCapture(e.pointerId);
  const hitTest=()=>{
   const hit=document.elementFromPoint(drag.x,drag.y)?.closest('#editor-rows tr');
   if(hit&&hit!==tr){const box=hit.getBoundingClientRect();$('editor-rows').insertBefore(tr,drag.y<box.top+box.height/2?hit:hit.nextSibling);handle.setPointerCapture(drag.pointer);}
  };
  const tick=()=>{
   if(activeDrag!==drag)return;
   if(drag.started){const edge=70,delta=drag.y<edge?-Math.min(14,(edge-drag.y)/4):drag.y>innerHeight-edge?Math.min(14,(drag.y-innerHeight+edge)/4):0;if(delta)window.scrollBy(0,delta);hitTest();}
   drag.frame=requestAnimationFrame(tick);
  };
  const move=e=>{if(e.pointerId!==drag.pointer)return;drag.x=e.clientX;drag.y=e.clientY;if(!drag.started&&Math.abs(drag.y-drag.startY)>5){drag.started=true;tr.classList.add('dragging');document.body.classList.add('reordering');}if(drag.started){e.preventDefault();hitTest();}};
  const finish=(cancelled=false)=>{
   if(activeDrag!==drag)return;activeDrag=null;cancelAnimationFrame(drag.frame);document.body.classList.remove('reordering');tr.classList.remove('dragging');
   handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',cancel);handle.removeEventListener('lostpointercapture',cancel);document.removeEventListener('keydown',escape);
   if(handle.hasPointerCapture(drag.pointer))handle.releasePointerCapture(drag.pointer);
   if(drag.started){const target=[...$('editor-rows').children].indexOf(tr);if(!cancelled&&moveCue(event().rows[event().mode],id,target)){commit(true);announceMove(id);}else{renderRows();handleRefocus(id);}}
  };
  const up=e=>{if(e.pointerId===drag.pointer)finish();},cancel=()=>finish(true),escape=e=>{if(e.key==='Escape'){e.preventDefault();finish(true);}};
  handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',cancel);document.addEventListener('keydown',escape);drag.frame=requestAnimationFrame(tick);
 });
}
function handleRefocus(id){$('editor-rows').querySelector(`[data-row-id="${CSS.escape(id)}"] .drag-handle`)?.focus({preventScroll:true});}
