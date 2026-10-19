import {ICON_COLOURS,iconColour,setIconColour} from './icon-colours.js';
import {gridMode,setGridMode,gridGeometry,GRID_STROKE,CELL_PADDING} from './grid.js';
import {KEY,LIMITS,SYMBOLS,uid,clone,column,createEvent,initialState,validateEvent,displayDistance,toMetres,formatTime,parseTime,cueHeader,cellText,exportCSV,importCSV,moveCue,sortCuesByPosition,serializeState,parseState,restoreObject,totalDistanceMaximum,validatedTotal} from './core.js';
import {BUILTIN_PRESET_NAMES} from './presets.js';
import {presetChange,personalPresetLabel} from './preset-actions.js';
import {assertEventName,uniqueEventName,eventDisplayLabel} from './names.js';
import {PlanHistory} from './history.js';
import {SaveSession,formatSaveTime} from './save-status.js';
import {footerGeometry} from './footer.js';
import {iconArtwork} from './icon-fills.js';
import {cueColumnId,moveColumn,canRemoveColumn,removeColumn} from './columns.js';
import {noteColumn,showNoteColumn} from './note-column.js';
import {columnControls} from './column-controls.js';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const names={'':'None',banana:'Banana',bottle:'Bottle',bar:'Bar',gel:'Gel',smile:'Smile',mountain:'Climb',feed:'Feed zone',flag:'Finish',coffee:'Coffee',warning:'Caution',cobbles:'Cobbles / pavé',ricecake:'Rice cake',can:'Softdrink',neutral:'Neutral zone',litter:'Litter zone'};
const el=(tag,a={},text)=>{const n=document.createElement(tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
const svg=(tag,a={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
function icon(name,coloured=false){const n=svg('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':1.8,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',class:'icon'});for(const[tag,a]of iconArtwork(name,coloured))n.append(svg(tag,a));return n;}
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
function showSaveTime(show){
 $('save-tooltip').hidden=!show||$('save-status-toggle').disabled;
 $('save-status-toggle').setAttribute('aria-expanded',String(!$('save-tooltip').hidden));
}
// A real disclosure supplements hover: keyboard and touch users get the same details.
$('save-status').addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse')showSaveTime(true);});
$('save-status').addEventListener('pointerleave',()=>{if(document.activeElement!==$('save-status-toggle'))showSaveTime(false);});
$('save-status-toggle').addEventListener('focus',()=>showSaveTime(true));
$('save-status-toggle').addEventListener('blur',()=>showSaveTime(false));
$('save-status-toggle').onclick=()=>showSaveTime(true);
// Hover does not move focus. Dismiss before editor Escape handlers can cancel a draft.
document.addEventListener('keydown',ev=>{
 if(ev.key==='Escape'&&!$('save-tooltip').hidden){ev.preventDefault();ev.stopImmediatePropagation();showSaveTime(false);}
},true);
document.addEventListener('pointerdown',ev=>{if(!ev.target.closest('#save-status'))showSaveTime(false);},true);
function refreshSaveStatus(announce=true){
 const view=saveSession.view({draft:pendingEdits.size>0||hasInvalidEdits()});
 $('save-status-label').textContent=view.text;$('save-status').dataset.saved=String(view.success);
 const time=$('save-status-time');$('save-status-toggle').disabled=!view.exact;
 const prefix=view.success?'Saved at':'Previous successful save:',suffix=saveSession.timePersisted?'':' (time available in this tab only)';
 const detail=view.exact?`${prefix} ${formatSaveTime(saveSession.lastSavedAt)}${suffix}`:'';
 // Age ticks must not replace controls, move focus or repeatedly announce an unchanged date.
 if(time.textContent!==detail)time.textContent=detail;
 if(view.exact)time.dateTime=view.exact;else{time.removeAttribute('datetime');showSaveTime(false);}
 if(announce&&view.announcement!==lastSaveAnnouncement){$('save-announcement').textContent=view.announcement;lastSaveAnnouncement=view.announcement;}
}
window.addEventListener('storage',ev=>{try{if(ev.storageArea!==localStorage)return;}catch{return;}if(ev.key===KEY||ev.key===null){saveSession.observe(ev.newValue);refreshSaveStatus();}});
// Only status nodes change: no storage writes, editor rebuilds or live age announcements.
setInterval(()=>refreshSaveStatus(false),15000);
window.addEventListener('focus',()=>{try{saveSession.observe(localStorage.getItem(KEY));}catch{saveSession.phase='failed';}refreshSaveStatus();});
const event=()=>state.events.find(e=>e.id===state.active)||state.events[0];
// Only active-plan working snapshots are retained outside the bounded history store.
const history=new PlanHistory();let historyPlan=JSON.stringify(event()),historyPlanId=event().id,fieldHistory=null,applyingHistory=false,lastSaveOK=false;
function fieldLabel(input){
 if(input.closest('#editor-rows'))return input.dataset.columnId===event().columns[0].id?'edit position':'edit cell';
 if(input.id==='event-name')return 'rename plan';
 if(input.id==='footer-text')return 'edit footer';
 if(input.closest('.column-config'))return input.type==='number'?'column width':'column rename';
 return 'edit layout';
}
function historyField(input){return input?.matches('input:not([type=checkbox]),textarea')&&input.matches('#event-name,#editor-rows input,.layout-controls input,.settings-grid input,.column-config input');}
function finishHistoryField(){
 if(!fieldHistory)return;const pending=fieldHistory;fieldHistory=null;
 if(pending.id===historyPlanId)recordHistory(pending.id,pending.before,historyPlan,pending.label);
 refreshHistory();
}
function recordHistory(id,before,after,label){
 if(history.record(id,before,after,label).trimmed)toast('Older Undo history was dropped to keep session memory bounded.');
}
function trackPlan(label){
 const after=JSON.stringify(event()),id=event().id;
 if(!applyingHistory&&id===historyPlanId&&!fieldHistory)recordHistory(id,historyPlan,after,label);
 historyPlan=after;historyPlanId=id;history.retain(state.events.map(e=>e.id));refreshHistory();
}
function refreshHistory(){
 const pending=fieldHistory&&fieldHistory.before!==historyPlan;
 const view=history.view(event().id),blocked=hasInvalidEdits();
 for(const direction of ['undo','redo']){
  const label=direction==='undo'&&pending?fieldHistory.label:direction==='redo'&&pending?'':view[direction];
  $(direction).disabled=blocked||!label;$(direction).setAttribute('aria-label',`${direction==='undo'?'Undo':'Redo'}${label?' '+label:''}`);
 }
}
document.addEventListener('focusin',ev=>{
 if(!historyField(ev.target))return;
 finishHistoryField();fieldHistory={input:ev.target,id:historyPlanId,before:historyPlan,label:fieldLabel(ev.target)};
});
// Blur's position-sort handler runs before bubbling focusout finalizes the action.
document.addEventListener('focusout',ev=>{if(fieldHistory?.input===ev.target)finishHistoryField();});
function applyHistory(direction){
 if($('dialog').open)return;
 if(hasInvalidEdits()){toast('Correct or cancel invalid edits before Undo or Redo.');return;}
 if(historyField(document.activeElement))document.activeElement.blur();
 finishHistoryField();if(hasInvalidEdits())return;
 const target=history.peek(event().id,direction);if(!target)return;
 const focused=document.activeElement;
 try{
  const candidate=validateEvent(JSON.parse(target.snapshot));
  if(candidate.id!==event().id)throw Error('History belongs to another plan.');
  if(candidate.name!==event().name){
   try{assertEventName(state.events,candidate.name,event().id);}catch(err){
    const message=`Cannot ${direction==='undo'?'Undo':'Redo'}: ${err.message} Rename the other ride plan, then retry. Your plan and history are unchanged.`;
    $('history-status').textContent=message;toast(message);return;
   }
  }
  // Association metadata belongs to preset operations, outside plan history.
  delete candidate.presetId;if(event().presetId)candidate.presetId=event().presetId;
  restoreObject(event(),candidate);applyingHistory=true;
  if(!commit(true))return;
  history.accept(event().id,direction);refreshHistory();
  $('history-status').textContent=`${direction==='undo'?'Undid':'Redid'} ${target.label}.${lastSaveOK?'':' Not saved; export a backup.'}`;
  if(focused?.isConnected&&!focused.disabled)focused.focus({preventScroll:true});else $('history-controls').focus({preventScroll:true});
 }catch(err){toast(err.message);}finally{applyingHistory=false;}
}
for(const direction of ['undo','redo']){
 $(direction).addEventListener('pointerdown',()=>{if(!hasInvalidEdits()&&historyField(document.activeElement))document.activeElement.blur();});
 $(direction).onclick=()=>applyHistory(direction);
}
document.addEventListener('keydown',ev=>{
 if(ev.defaultPrevented||ev.altKey||$('dialog').open||ev.target.closest('input,textarea,[contenteditable]:not([contenteditable=false])'))return;
 const mac=/Mac|iPhone|iPad/.test(navigator.platform),key=ev.key.toLowerCase();
 const modifier=mac?ev.metaKey&&!ev.ctrlKey:ev.ctrlKey&&!ev.metaKey;
 if(!modifier)return;
 const direction=key==='z'?(ev.shiftKey?'redo':'undo'):!mac&&key==='y'&&!ev.shiftKey?'redo':null;
 if(direction){ev.preventDefault();applyHistory(direction);}
});
// Library replacement is transactional: failed storage/recovery writes keep old plans/history.
function replaceLibrary(candidate){
 const previous=state,raw=acceptedState;state=candidate;allowRecoveryReplacement=true;
 if(!save()||!lastSaveOK){state=previous;acceptedState=raw;render(true);toast('Restore could not be saved. Existing plans and Undo history are unchanged.');return false;}
 fieldHistory=null;history.clear();historyPlan=JSON.stringify(event());historyPlanId=event().id;pendingEdits.clear();render(true);return true;
}
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
 lastSaveOK=false;const replaceRecovery=allowRecoveryReplacement;allowRecoveryReplacement=false;
 let serialized;
 try{const {savedAt,...plan}=state;serialized=serializeState(plan);}catch(err){
  restoreObject(state,JSON.parse(acceptedState));
  if(draftInput?.matches('input,textarea')){draftInput.setCustomValidity(err.message);invalidCells.add('state-edit');}
  else render();
  toast(err.message);renderPreview();return false;
 }
 // Drop stale metadata even if storage fails: in-memory backups must still fit the plan budget.
 acceptedState=serialized;delete state.savedAt;
 const result=saveSession.save(state,{recovery:recoveryBlocked&&!replaceRecovery});
 lastSaveOK=result.ok;
 if(result.ok){
  if(result.savedAt===null)delete state.savedAt;else state.savedAt=result.savedAt;
  acceptedState=result.raw;storageOK=true;
  // The original remains exportable until its explicit replacement actually reaches storage.
  if(replaceRecovery){recoveryBlocked=false;recoveryOriginal=null;}
 }else if(!result.blocked){storageOK=false;toast(result.conflict?'Storage changed in another tab. Export this plan before reloading.':'Storage is full or unavailable. Please export a JSON backup.');}
 if(draftInput)pendingEdits.delete(draftInput);
 refreshSaveStatus();return true;
}
function commit(full=false,draftInput=null,label='edit plan'){if(!save(draftInput))return false;trackPlan(draftInput?fieldLabel(draftInput):label,draftInput);if(full)render();else renderPreview();return true;}
function invalidInput(){return document.querySelector('input:invalid,textarea:invalid');}
function hasInvalidEdits(){return invalidCells.size>0||!!invalidInput();}
function cancelEdits(){
 clearEventNameError();
 finishHistoryField();pendingEdits.clear();invalidCells.clear();document.querySelectorAll('input,textarea').forEach(n=>n.setCustomValidity(''));
 if($('dialog').open){$('dialog').close();$('dialog-body').replaceChildren();}render(true);toast('Unaccepted edits cancelled. Last accepted values restored.');
}
// Guard before action handlers mutate state. Correction or explicit Escape cancellation is required.
for(const type of ['click','pointerdown','keydown','change'])document.addEventListener(type,ev=>{
 if(!hasInvalidEdits()||ev.target.closest('#save-status'))return;
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
document.addEventListener('input',()=>{refreshSaveStatus();refreshHistory();});
document.addEventListener('change',()=>{refreshSaveStatus();refreshHistory();});
$('cancel-edits').onclick=cancelEdits;
function rememberSelects(){document.querySelectorAll('select').forEach(n=>n.dataset.acceptedValue=n.value);}
function openDialog(title){$('column-dialog-status').hidden=title!=='Columns';$('column-dialog-status').textContent='';$('dialog-title').textContent=title;$('dialog-body').replaceChildren();if(!$('dialog').open)$('dialog').showModal();return $('dialog-body');}
$('close-dialog').onclick=()=>$('dialog').close();
$('dialog').addEventListener('click',e=>{if(e.target===$('dialog')){const r=$('dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('dialog').close();}});
function confirmAction(title,text,action){const d=openDialog(title);if(recoveryBlocked)offerOriginal(d);d.append(el('p',{},text));const a=el('div',{class:'dialog-actions'});a.append(button('Cancel',()=>$('dialog').close()),button('Continue',()=>{$('dialog').close();action();},'primary'));d.append(a);}
function applyTheme(){document.documentElement.dataset.theme=state.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):state.theme;document.querySelectorAll('button[data-theme]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===state.theme));}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
document.querySelectorAll('button[data-theme]').forEach(b=>{const text=b.textContent;b.replaceChildren(icon({light:'sun',dark:'moon',system:'monitor'}[b.dataset.theme]),el('span',{},text));b.onclick=()=>{state.theme=b.dataset.theme;applyTheme();save();};});
document.querySelectorAll('[data-icon]').forEach(b=>b.prepend(icon(b.dataset.icon)));
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.body.dataset.tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-pressed',t===b));});
function updateEvents(){const s=$('event-select');s.replaceChildren(...state.events.map(e=>el('option',{value:e.id},eventDisplayLabel(state.events,e))));s.value=event().id;}
function render(force=false){if(!force&&hasInvalidEdits())return;applyTheme();const e=event();updateEvents();$('event-name').value=e.name;clearEventNameError();
$('preset').replaceChildren(el('option',{value:'nutrition'},BUILTIN_PRESET_NAMES.nutrition),el('option',{value:'route'},BUILTIN_PRESET_NAMES.route),el('option',{value:'custom'},BUILTIN_PRESET_NAMES.custom),el('option',{value:'flanders'},BUILTIN_PRESET_NAMES.flanders+' · example'),...state.presets.map((p,i)=>el('option',{value:`saved:${i}`},personalPresetLabel(state.presets,p))));$('preset').value=e.preset;
const associated=state.presets.find(p=>p.id&&p.id===e.presetId);$('preset-association').textContent=associated?`Based on preset: ${personalPresetLabel(state.presets,associated)}`:'Custom plan';$('update-preset').hidden=!associated;$('update-preset').title=associated?`Replace ${personalPresetLabel(state.presets,associated)}`:'';
$('grid').value=gridMode(e.layout);$('unit').value=e.unit;$('mode-distance').setAttribute('aria-pressed',e.mode==='distance');$('mode-time').setAttribute('aria-pressed',e.mode==='time');$('mode-time').disabled=e.preset!=='nutrition';$('unit').disabled=e.mode==='time';$('dimension-unit').value=e.dimensionUnit;
const factor=e.dimensionUnit==='in'?25.4:1;for(const[id,min,max]of [['width',20,180],['length',30,260]]){const n=$(id);n.min=min/factor;n.max=max/factor;n.step='any';n.value=e.layout[id]/factor;}
for(const id of ['font','padding','gap','rotation','paper','copies'])$(id).value=e.layout[id];$('header').checked=e.layout.header;$('footer-enabled').checked=e.layout.footerEnabled??false;$('footer-text').value=e.layout.footerText??'';$('footer-text').disabled=!e.layout.footerEnabled;$('total').max=totalDistanceMaximum(e.unit);$('total').step='any';$('total').value=Math.min(displayDistance(e.totalM,e.unit),totalDistanceMaximum(e.unit));$('remaining').checked=e.remaining;$('remaining').disabled=e.mode==='time';$('mode-note').textContent=e.mode==='time'?'Elapsed time since the start. Enter hours:minutes.':'Distances are entered from the start. Display units can be changed.';renderRows(force);renderPreview();renderColumnSettings();rememberSelects();if(fieldHistory&&!fieldHistory.input.isConnected)finishHistoryField();refreshHistory();}
function renderRows(force=false){if(!force&&hasInvalidEdits())return;rowRefreshPending=false;clearTimeout(rowRefreshTimer);const e=event(),rows=e.rows[e.mode];$('row-count').textContent=`${rows.length} ${rows.length===1?'cue':'cues'}`;const head=el('tr');head.append(el('th',{},'#'));e.columns.forEach((c,i)=>{if(i===1)head.append(el('th',{},'Icon'));const th=el('th',{'data-column-id':c.id},i===0?(e.mode==='time'?'h:mm':e.unit):c.label);th.hidden=i>0&&!c.visible;head.append(th);});head.append(el('th',{},''));$('editor-head').replaceChildren(head);const body=$('editor-rows');body.replaceChildren();
rows.forEach((r,index)=>{const tr=el('tr',{'data-row-id':r.id});const order=el('td',{class:'row-order'}),grip=button('',()=>{},'drag-handle','grip');grip.setAttribute('aria-label',`Reorder row ${index+1}`);grip.setAttribute('aria-describedby','drag-help');grip.title='Drag to reorder · Arrow Up / Down';attachRowDrag(grip,tr,r.id);order.append(grip,el('span',{class:'row-number'},String(index+1)));tr.append(order);e.columns.forEach((c,i)=>{if(i===1){const td=el('td',{class:'symbol-cell'}),b=button('',()=>symbolPicker(r),'symbol-button');b.dataset.symbol=r.symbol;b.setAttribute('aria-label',`Choose icon for row ${index+1}`);b.title=`${names[r.symbol]} · ${iconColour(r.iconColour).name}`;b.setAttribute('aria-description',`Icon colour: ${iconColour(r.iconColour).name}`);const artwork=icon(r.symbol||'plus',Boolean(r.symbol&&iconColour(r.iconColour).value));if(r.symbol&&iconColour(r.iconColour).value)artwork.setAttribute('color',iconColour(r.iconColour).value);b.append(artwork);td.append(b);tr.append(td);}
const td=el('td',{class:i===0?'distance-cell':''}),isTime=i===0&&e.mode==='time',input=el('input',{'aria-label':`${i===0?(isTime?'Time':e.unit):c.label}, row ${index+1}`});if(isTime){input.type='text';input.placeholder='1:30';input.pattern='[0-9]{1,3}:[0-5][0-9]';input.value=formatTime(r.cells[c.id]);}else if(c.type==='distance'||c.type==='number'){input.type='number';input.min='0';input.max=c.type==='distance'?String(10_000_000/(e.unit==='mi'?1609.344:1000)):'10000000';input.step='any';input.value=c.type==='distance'?displayDistance(r.cells[c.id],e.unit):r.cells[c.id];}else{input.type='text';input.maxLength=LIMITS.text;input.value=r.cells[c.id];}
td.dataset.columnId=c.id;td.hidden=i>0&&!c.visible;input.dataset.columnId=c.id;
const key=r.id+c.id;input.oninput=()=>{input.setCustomValidity('');try{if(!input.checkValidity()||(input.type==='number'&&input.value===''))throw Error('Enter a valid non-negative number.');const v=isTime?parseTime(input.value):c.type==='distance'?toMetres(input.value,e.unit):c.type==='number'?Number(input.value):input.value;r.cells[c.id]=v;invalidCells.delete(key);if(!commit(false,input))invalidCells.add(key);else if(rowRefreshPending)scheduleRowRefresh();}catch(err){invalidCells.add(key);input.setCustomValidity(err.message);renderPreview();}};let originalValue=r.cells[c.id];
input.onfocus=()=>{if(!invalidCells.has(key))originalValue=r.cells[c.id];};
input.onblur=()=>{
 if(invalidCells.has(key))return;
 if(i===0&&r.cells[c.id]!==originalValue){
  originalValue=r.cells[c.id];sortCuesByPosition(rows,c.id);commit(false,input);scheduleRowRefresh();
 }
};
if(i===0)input.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();input.blur();}};td.append(input);tr.append(td);});
const td=el('td'),actions=el('div',{class:'row-actions'});for(const[label,name,action]of [['Move row up','up',()=>{const at=rows.findIndex(row=>row.id===r.id);if(moveCue(rows,r.id,at-1)){commit(true,null,'row reorder');announceMove(r.id,'up');}}],['Move row down','down',()=>{const at=rows.findIndex(row=>row.id===r.id);if(moveCue(rows,r.id,at+1)){commit(true,null,'row reorder');announceMove(r.id,'down');}}],['Delete row','trash',()=>{const at=rows.findIndex(row=>row.id===r.id);if(at>=0)rows.splice(at,1);commit(true,null,'delete row');}]] ){const b=button('',action,'',name);b.setAttribute('aria-label',`${label} ${index+1}`);b.dataset.move=name;if(name!=='trash')b.setAttribute('aria-disabled',String(name==='up'&&index===0||name==='down'&&index===rows.length-1));actions.append(b);}td.append(actions);tr.append(td);body.append(tr);});}
function symbolPicker(row){
 const d=openDialog('Choose a cue symbol');d.append(el('p',{},'Choose an icon or its colour. Colour belongs to this cue, survives icon changes and is kept when None hides the icon. Text and custom symbol columns keep their existing appearance.'));
 const finish=(label)=>{$('dialog').close();commit(true,null,label);Array.from($('editor-rows').children).find(tr=>tr.dataset.rowId===row.id)?.querySelector('.symbol-button')?.focus({preventScroll:true});};
 const palette=el('fieldset',{class:'cue-colours'});palette.append(el('legend',{},'Icon colour'));
 for(const colour of ICON_COLOURS){const b=button(colour.name,()=>{if(setIconColour(row,colour.id))finish('change icon colour');else $('dialog').close();},'secondary-button');b.setAttribute('aria-pressed',String((row.iconColour??'default')===colour.id));const sample=icon(row.symbol||'bottle',Boolean(colour.value));if(colour.value)sample.setAttribute('color',colour.value);b.prepend(sample);palette.append(b);}d.append(palette);
 const g=el('div',{class:'option-grid'});for(const name of ['',...SYMBOLS.filter(Boolean).sort((a,b)=>names[a].localeCompare(names[b],'en',{sensitivity:'base'}))]){const b=button(names[name],()=>{row.symbol=name;finish('change icon');});if(name){const artwork=icon(name,Boolean(iconColour(row.iconColour).value));if(iconColour(row.iconColour).value)artwork.setAttribute('color',iconColour(row.iconColour).value);b.prepend(artwork);}g.append(b);}d.append(g);
}
const ctx=document.createElement('canvas').getContext('2d');
function wrap(text,width,font,bold){ctx.font=`${bold?'700':'400'} ${font}px StemSans`;const lines=[];let line='';for(const ch of Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text),s=>s.segment)){if(ch==='\n'){lines.push(line);line='';continue;}if(line&&ctx.measureText(line+ch).width>width){const p=line.lastIndexOf(' ');if(p>0){lines.push(line.slice(0,p));line=line.slice(p+1)+ch;}else{lines.push(line);line=ch;}}else line+=ch;}lines.push(line);return lines;}
function makeSheet(){const e=event(),l=e.layout,rotated=l.rotation===90||l.rotation===270,w=rotated?l.length:l.width,h=rotated?l.width:l.length;const root=svg('svg',{xmlns:NS,viewBox:`0 0 ${l.width} ${l.length}`,width:`${l.width}mm`,height:`${l.length}mm`,role:'img','aria-label':'Printable cue sheet'});root.append(svg('rect',{width:l.width,height:l.length,fill:'white'}));const g=svg('g');if(l.rotation===90)g.setAttribute('transform',`translate(${l.width} 0) rotate(90)`);if(l.rotation===180)g.setAttribute('transform',`translate(${l.width} ${l.length}) rotate(180)`);if(l.rotation===270)g.setAttribute('transform',`translate(0 ${l.length}) rotate(270)`);root.append(g);
const mode=gridMode(l),full=mode==='full',rowEnds=[];const cols=e.columns.filter(c=>c.visible),sum=cols.reduce((s,c)=>s+c.width,0),inner=w-2*l.padding,widths=cols.map(c=>inner*c.width/sum),font=l.font*25.4/72,lineHeight=font*1.25;let y=l.padding+(full?GRID_STROKE:0);const warnings=[];
const draw=(cells,header,row,index)=>{let x=l.padding;const all=cols.map((c,i)=>{const symbol=!header&&row.symbol&&c.id===cueColumnId(e)?row.symbol:null,reserve=symbol?font+1:0,available=widths[i]-2*CELL_PADDING-reserve,lines=wrap(cells[i],Math.max(available,1),font,header||c.bold);if(available<font*.65||lines.some(line=>ctx.measureText(line).width>available+.01))warnings.push(`Column “${c.label}” is too narrow.`);return{lines,symbol,reserve};});const height=Math.max(...all.map(a=>a.lines.length))*lineHeight+l.gap;
all.forEach((a,i)=>{const c=cols[i];if(a.symbol){const ic=icon(a.symbol,Boolean(iconColour(row.iconColour).value));for(const[k,v]of Object.entries({x:x+CELL_PADDING,y:y+.4,width:font,height:font,color:iconColour(row.iconColour).value??'#111','data-cue-icon':row.id}))ic.setAttribute(k,v);ic.removeAttribute('class');g.append(ic);}let tx=x+CELL_PADDING+a.reserve,anchor='start';if(c.align==='right'){tx=x+widths[i]-CELL_PADDING;anchor='end';}else if(c.align==='center'){tx=x+widths[i]/2+a.reserve/2;anchor='middle';}a.lines.forEach((line,j)=>g.append(svg('text',{x:tx,y:y+font+j*lineHeight,'font-family':'StemSans','font-size':font,'font-weight':header||c.bold?700:400,'text-anchor':anchor,fill:'#111'},line)));x+=widths[i];});y+=height;rowEnds.push(y);if(mode==='rows')g.append(svg('line',{x1:l.padding,y1:y-.4,x2:w-l.padding,y2:y-.4,stroke:header?'#222':'#b9b9b9','stroke-width':header?.3:.15}));if(y+(full?GRID_STROKE/2:0)>h-l.padding)warnings.push(header?'Headers do not fit.':`Row ${index+1} exceeds the strip length.`);};
if(l.header)draw(cols.map(c=>cueHeader(e,c)),true,null,0);e.rows[e.mode].forEach((r,i)=>draw(cols.map(c=>cellText(e,c,r.cells[c.id])),false,r,i));if(!e.rows[e.mode].length)warnings.push('Add at least one cue before printing.');if(e.remaining&&e.mode==='distance'&&e.rows.distance.some(r=>r.cells[e.columns[0].id]>e.totalM))warnings.push('A cue is beyond the total ride distance.');
if(full&&rowEnds.length){const geometry=gridGeometry({left:l.padding,right:w-l.padding,top:l.padding,bottom:y,widths,rowEnds});g.append(svg('path',{d:geometry.path,fill:'none',stroke:'#777','stroke-width':GRID_STROKE,'data-grid':'full'}));y=geometry.inkBottom;}
// Footer shares the rotated table coordinate system, never the outer page/calibration area.
if(l.footerEnabled&&l.footerText?.trim()){
 ctx.font=`400 ${font}px StemSans`;
 const footer=footerGeometry(l,y,ctx.measureText(l.footerText));warnings.push(...footer.warnings);
 g.append(svg('text',{x:footer.x,y:footer.y,'font-family':'StemSans','font-size':font,'font-weight':400,'text-anchor':'middle',fill:'#111','data-footer':''},l.footerText));y=footer.bottom;
}
if(invalidCells.size||document.querySelector('.layout-controls input:invalid, .settings-grid input:invalid'))warnings.push('Fix the highlighted input before printing.');return{root,warnings:[...new Set(warnings)],used:y+l.padding};}
function renderPreview(){refreshSaveStatus();$('cancel-edits').hidden=!hasInvalidEdits();const e=event(),{root,warnings,used}=makeSheet();$('sheet-preview').replaceChildren(root);$('size-label').textContent=`${+e.layout.width.toFixed(1)} × ${+e.layout.length.toFixed(1)} mm`;fits=warnings.length===0;$('fit-status').className=fits?'':'overflow';$('fit-status').textContent=fits?`✓ Fits your strip · ${Math.round(used)} mm of content`:`${warnings.slice(0,2).join(' ')} Increase the size, simplify the cues or adjust columns.`;$('print').disabled=!fits;}
function addEvent(e){if(state.events.length>=LIMITS.events)return toast('Maximum 30 saved events. Export a backup and remove an event.');e.name=uniqueEventName(state.events,e.name);state.events.push(e);state.active=e.id;return commit(true);}
function withBike(e){try{const p=state.bike;if(p){const candidate=clone(e);candidate.layout={...e.layout,...p};e.layout=validateEvent(candidate).layout;}}catch{}return e;}
$('event-select').onchange=()=>{state.active=$('event-select').value;commit(true);};$('new-event').onclick=()=>{const e=withBike(createEvent());e.name='Untitled ride';e.rows={distance:[],time:[]};addEvent(e);};$('duplicate-event').onclick=()=>{const e=clone(event());e.id=uid();addEvent(e);};
$('delete-event').onclick=()=>confirmAction('Delete this event?',`“${event().name}” will be removed from this browser. Export a backup first if you need a copy.`,()=>{const id=event().id;state.events=state.events.filter(e=>e.id!==id);if(!state.events.length)state.events=[withBike(createEvent())];state.active=state.events[0].id;commit(true);});
function clearEventNameError(){
 $('event-name').removeAttribute('aria-invalid');$('event-name-error').hidden=true;$('event-name-error').textContent='';
}
$('event-name').oninput=()=>{
 const input=$('event-name');clearEventNameError();invalidCells.delete('event-name');
 try{
  // The original record is untouched while this field contains an invalid draft.
  const name=assertEventName(state.events,input.value,event().id);event().name=name;
  if(!commit(false,input))throw Error(input.validationMessage);updateEvents();
 }catch(err){
  input.setCustomValidity(err.message);input.setAttribute('aria-invalid','true');invalidCells.add('event-name');
  $('event-name-error').textContent=err.message;$('event-name-error').hidden=false;renderPreview();
 }
};
$('preset').onchange=()=>{const val=$('preset').value;if(val==='custom'){event().preset='custom';event().mode='distance';commit(true,null,'change planning mode');return;}if(val.startsWith('saved:')){confirmAction('Apply saved preset?','This creates a new event with the saved template. Your current event is kept.',()=>{persistPreset('use',{index:Number(val.split(':')[1])});});render();return;}if(val===event().preset&&val!=='flanders')return;confirmAction('Start with this preset?','A new event will be created with example cues. Your current event is kept.',()=>addEvent(withBike(createEvent(val))));render();};
for(const mode of ['distance','time'])$(`mode-${mode}`).onclick=()=>{if(mode==='time'&&event().preset!=='nutrition')return;event().mode=mode;commit(true,null,'change planning mode');};$('unit').onchange=()=>{event().unit=$('unit').value;commit(true,null,'change units');};$('dimension-unit').onchange=()=>{event().dimensionUnit=$('dimension-unit').value;commit(true,null,'change dimension units');};
for(const id of ['width','length','font','padding','gap','rotation','copies','paper'])$(id).onchange=()=>{const input=$(id);if(!input.checkValidity()||input.value==='')return input.reportValidity();const e=event(),candidate=clone(e);candidate.layout[id]=id==='paper'?input.value:Number(input.value)*(id==='width'||id==='length'?(e.dimensionUnit==='in'?25.4:1):1);try{e.layout=validateEvent(candidate).layout;commit(false,input);}catch(err){input.setCustomValidity(err.message);toast(err.message);renderPreview();}};
$('footer-enabled').onchange=()=>{event().layout.footerEnabled=$('footer-enabled').checked;if(commit(false,null,'toggle footer'))$('footer-text').disabled=!event().layout.footerEnabled;};
$('footer-text').oninput=()=>{const input=$('footer-text');event().layout.footerText=input.value;commit(false,input);};
$('grid').onchange=()=>{if(setGridMode(event().layout,$('grid').value))commit(true,null,'change grid');};
$('header').onchange=()=>{event().layout.header=$('header').checked;commit(false,null,'toggle headers');};$('remaining').onchange=()=>{event().remaining=$('remaining').checked;commit(false,null,'toggle distance remaining');};$('total').onchange=()=>{const input=$('total');input.setCustomValidity('');try{const metres=validatedTotal(input.value,event().unit);if(!input.checkValidity())throw Error('Enter a valid total distance.');event().totalM=metres;commit(false,input);}catch(err){input.setCustomValidity(err.message);renderPreview();}};$('save-bike').onclick=()=>{try{const{width,length,padding,rotation}=event().layout;state.bike={width,length,padding,rotation};if(save())toast(storageOK&&!recoveryBlocked?'Bike dimensions saved for new plans.':'Bike dimensions changed in memory — not saved.');}catch{toast('Could not save bike dimensions.');}};
$('add-row').onclick=()=>{const e=event(),rows=e.rows[e.mode];if(rows.length>=LIMITS.rows)return toast('Maximum 200 cues per mode.');const r={id:uid(),symbol:'',cells:{}};e.columns.forEach((c,i)=>r.cells[c.id]=c.type==='number'||c.type==='distance'?i===0?(rows.at(-1)?.cells[c.id]||0):0:'');rows.push(r);commit(true,null,'insert row');$('editor-rows').lastElementChild?.querySelector('input')?.focus();};$('sort').onclick=()=>{const e=event();sortCuesByPosition(e.rows[e.mode],e.columns[0].id);commit(true,null,'sort rows');};
// Successful preset writes alone expose replacement/recovery and association changes.
function persistPreset(operation,options={},nameInput=null){
 if(hasInvalidEdits())return false;
 let candidate;try{candidate=presetChange(state,operation,options);}catch(err){if(err.code==='preset-name-collision'&&nameInput){const message=$('preset-name-error');message.textContent=err.message;message.hidden=false;nameInput.setAttribute('aria-invalid','true');nameInput.focus();}else toast(err.message);return false;}
 if(!candidate){toast('Preset is unchanged; previous version kept.');return true;}
 const previous=state,raw=acceptedState;state=candidate;
 if(!save()||!lastSaveOK){state=previous;acceptedState=raw;render();refreshSaveStatus();toast('Preset change was not saved. Plans and both preset versions are unchanged.');return false;}
 historyPlan=JSON.stringify(event());historyPlanId=event().id;fieldHistory=null;history.retain(state.events.map(e=>e.id));render();if(operation==='update')toast('Preset updated; existing plans unchanged.');return true;
}
function presetNameField(dialog,attributes){
 const input=el('input',{id:'preset-name',maxlength:40,'aria-describedby':'preset-name-error preset-name-guidance',...attributes});
 const error=el('p',{id:'preset-name-error',class:'warning',role:'alert'});error.hidden=true;
 dialog.append(labelled('Preset name',input),error,el('p',{id:'preset-name-guidance'},'Choose a unique name, including among built-in examples. Update preset changes only the personal preset associated with this plan; matching names never select an update target.'));
 input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');error.hidden=true;error.textContent='';});return input;
}
$('save-preset').onclick=()=>{
 const d=openDialog('Save a personal preset');d.append(el('p',{},'Save both cue lists and layout as a new personal preset. This plan will be associated with the new copy. Preset actions are outside plan Undo; updating keeps one recoverable previous version.'));
 const input=presetNameField(d,{placeholder:'e.g. Long Sunday nutrition'});
 d.append(button('Save preset',()=>{if(persistPreset('new',{name:input.value},input)){ $('dialog').close();toast('New personal preset saved.');}},'primary'));input.focus();
};
function confirmPreset(title,text,action){confirmAction(title,text,action);$('dialog-body').querySelector('button')?.focus();}
$('update-preset').onclick=()=>{
 const p=state.presets.find(p=>p.id&&p.id===event().presetId);if(!p)return;
 const d=openDialog('Update preset?');d.append(el('p',{},`Replace “${p.name}” (personal preset ${state.presets.indexOf(p)+1}) with this plan? The preset name stays “${p.name}”. Existing ride plans stay unchanged. One previous version is retained; preset actions are outside plan Undo/Redo.`));
 d.append(el('p',{},'Captures the event name, both distance/time cue lists and their manual order, icons, cue icon colours and all cell contents (including hidden Note text); column labels, types, widths, order, visibility, alignment and bold; planning mode, units, total/remaining distance; and all sheet/print settings: dimensions, font, padding, row spacing, grid mode, rotation, header, footer, paper and copies. It does not capture theme, remembered bike dimensions or session Undo/Redo history. New plans use the captured event name with a unique suffix if needed.'));
 const a=el('div',{class:'dialog-actions'});a.append(button('Cancel',()=>$('dialog').close()),button('Update preset',()=>{if(persistPreset('update',{id:p.id}))$('dialog').close();},'primary'),button('Rename preset…',()=>renamePreset(p),'secondary-button'));
 if(p.previous)a.append(button('Restore previous version',()=>confirmPreset('Restore previous preset version?',`Restore “${p.previous.name}” for ${personalPresetLabel(state.presets,p)}? Existing plans stay unchanged. The current version becomes the one recovery revision.`,()=>{if(persistPreset('recover',{id:p.id}))toast('Previous preset version restored.');}),'secondary-button'));
 a.append(button('Delete personal preset',()=>confirmPreset('Delete personal preset?',`Delete “${p.name}” (personal preset ${state.presets.indexOf(p)+1}) and its recovery version? Associated plans are kept and unlinked. Export JSON first.`,()=>{if(persistPreset('delete',{id:p.id})){toast('Personal preset deleted; plans kept.');$('save-preset').focus({preventScroll:true});}}),'danger-button'));d.append(a);a.querySelector('button').focus();
};
function renamePreset(p){
 const d=openDialog('Rename preset');d.append(el('p',{},`Rename ${personalPresetLabel(state.presets,p)}? This changes only the preset name. Its saved template and all existing event names stay unchanged. The previous preset version remains recoverable.`));
 const input=presetNameField(d,{value:p.name}),a=el('div',{class:'dialog-actions'});
 a.append(button('Cancel',()=>$('dialog').close()),button('Rename preset',()=>{if(persistPreset('rename',{id:p.id,name:input.value},input)){$('dialog').close();toast('Preset name saved; event names unchanged.');}},'primary'));d.append(a);input.focus();
}

function renderColumnSettings(){
 columnList.render();const e=event(),note=noteColumn(e);$('show-note').checked=!!note?.visible;
 $('show-note').disabled=!note&&e.columns.length>=LIMITS.columns;
 $('note-help').textContent=!note&&e.columns.length>=LIMITS.columns?'Maximum 8 columns. Remove another column before enabling Note.':'Hide without deleting text. Rename and adjust widths in Column details. Adding a column may cause print overflow.';
}
$('show-note').onchange=()=>{
 try{if(showNoteColumn(event(),$('show-note').checked))commit(true,null,'toggle Note');}catch(err){toast(err.message);renderColumnSettings();}
};
function columnsDialog(){
 const d=openDialog('Columns');d.append(el('p',{},'Widths are relative shares of the strip. Hidden columns stay in JSON backups. Distance/time stays first. Reorder with the list in Layout & print settings or these movement buttons.'));
 const e=event();
 e.columns.forEach((c,i)=>{
  const managed=c.id===e.noteColumnId,row=el('div',{class:'column-config','data-column-id':c.id,role:'group','aria-label':`Column ${c.label}`}),name=el('input',{value:c.label,maxlength:32});
  name.oninput=()=>{c.label=name.value;if(commit(false,name)){row.setAttribute('aria-label',`Column ${c.label}`);renderColumnSettings();}};row.append(labelled('Name',name));
  const type=select(['text','number','distance','symbol'].map(t=>[t,t]),c.type,v=>{
   const populated=['distance','time'].some(mode=>e.rows[mode].some(r=>r.cells[c.id]!==''&&r.cells[c.id]!==0));
   if(populated){toast('Add a new column to change type without losing values.');type.value=c.type;return;}
   c.type=v;for(const mode of ['distance','time'])e.rows[mode].forEach(r=>r.cells[c.id]=v==='number'||v==='distance'?0:'');commit(true,null,'column type');
  });type.disabled=i===0||managed;
  const visibility=check(c.visible,'Show column',v=>{
   if(!v&&e.columns.filter(c=>c.visible).length===1){toast('Keep at least one visible column.');columnsDialog();return;}
   c.visible=v;commit(true,null,'column visibility');
  });visibility.querySelector('input').disabled=managed;
  row.append(labelled('Field type',type),labelled('Width share',numberInput(c.width,5,95,1,(v,input)=>{c.width=v;commit(false,input);})),labelled('Alignment',select(['left','center','right'].map(v=>[v,v]),c.align,v=>{c.align=v;commit(false,null,'column alignment');})),visibility,check(c.bold,'Bold',v=>{c.bold=v;commit(false,null,'column emphasis');}));
  if(managed)row.append(el('p',{class:'wide'},'This is the optional Note column. Rename it here; hide or restore it with Show note column. Its text type and retained content stay protected.'));
  if(i>0){
   const actions=el('div',{class:'actions wide'});
   for(const [text,direction,delta]of [['Move left','left',-1],['Move right','right',1]]){
    const b=button(text,()=>{
     const at=event().columns.findIndex(x=>x.id===c.id);if(!moveColumn(event(),c.id,at+delta)||!commit(true,null,'column reorder'))return;
     columnsDialog();const updated=[...$('dialog-body').querySelectorAll('.column-config')].find(n=>n.dataset.columnId===c.id);
     const target=updated?.querySelector(`[data-column-move="${direction}"]`);(target&&!target.disabled?target:updated?.querySelector('input'))?.focus({preventScroll:true});
     const message=`${c.label} moved to position ${event().columns.findIndex(x=>x.id===c.id)+1} of ${event().columns.length}.`;
     $('column-order-status').textContent=message;$('column-dialog-status').textContent=message;
    });b.dataset.columnMove=direction;b.disabled=direction==='left'?i===1:i===e.columns.length-1;actions.append(b);
   }
   const remove=button('Remove',()=>confirmAction('Remove column?',`“${c.label}” and its values in both modes will be removed.`,()=>{if(removeColumn(event(),c.id))commit(true,null,'remove column');}),'danger-button');
   remove.disabled=!canRemoveColumn(e,c.id);actions.append(remove);row.append(actions);
  }
  d.append(row);
 });
 const actions=el('div',{class:'dialog-actions'}),add=button('Add column',()=>{
  if(e.columns.length>=LIMITS.columns)return;const c=column('New column');e.columns.push(c);for(const mode of ['distance','time'])for(const r of e.rows[mode])r.cells[c.id]='';
  if(commit(true,null,'add column'))columnsDialog();
 },'','plus');add.disabled=e.columns.length>=LIMITS.columns;
 actions.append(add,button('Done',()=>{$('dialog').close();render();},'primary'));d.append(actions);
}
$('column-settings').onclick=columnsDialog;$('column-details').onclick=columnsDialog;
function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=el('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function filename(){return event().name.replace(/[^a-zA-Z0-9_-]/g,'-').replace(/-+/g,'-').slice(0,60)||'stemtape';}
$('export').onclick=()=>{const d=openDialog('Export your plan');if(recoveryBlocked)offerOriginal(d);d.append(el('p',{},'CSV contains the current mode’s visible data columns, plus position and icon. Coloured cues add versioned metadata requiring v0.9.0 or later; grid settings require JSON. JSON backs up hidden content, all events, both modes, presets and preferences.'));d.append(button('CSV · current cue table',()=>{download(exportCSV(event()),'text/csv;charset=utf-8',`${filename()}-${event().mode}.csv`);$('dialog').close();},'export-option','download'),button('JSON · complete backup',()=>{download(serializeState(state),'application/json','stemtape-backup.json');$('dialog').close();},'export-option','save'));d.append(el('p',{},'CSV protects formula-like text for spreadsheets. Use JSON for exact preservation of custom types, formatting and text.'));};
$('import').onclick=()=>{
 const d=openDialog('Import from your device');d.append(el('p',{},'Files and pasted tables stay on this device.'));
 const options=el('div',{class:'import-options'});
 const file=el('section',{class:'import-card','aria-labelledby':'import-file-title'});
 file.append(el('h3',{id:'import-file-title'},'CSV or JSON file'),el('p',{},'CSV creates a new event. The first column must be distance_km, distance_mi or time (h:mm), optionally followed by icon, versioned icon-colour metadata when exported by v0.9.0, then your cue columns.'),el('p',{},'JSON backups are validated before you choose whether to restore. Maximum file and complete-state size: 2,000,000 UTF-8 bytes.'),button('Choose CSV or JSON',()=>$('file-input').click(),'primary','upload'));
 const paste=el('section',{class:'import-card','aria-labelledby':'import-paste-title'});
 paste.append(el('h3',{id:'import-paste-title'},'Spreadsheet table'),el('p',{},'Copy a range including headers from your spreadsheet, then paste it to create a new event.'),button('Paste spreadsheet table',pasteTable));
 options.append(file,paste);d.append(options);
};
$('file-input').onchange=async()=>{const f=$('file-input').files[0];$('file-input').value='';if(!f)return;try{if(f.size>LIMITS.bytes)throw Error('File exceeds 2,000,000 UTF-8 bytes. Keep this original file for recovery; it has not been changed.');const text=await f.text();/* Reading yields: recheck drafts created while the file was loading. */if(hasInvalidEdits())throw Error('Correct or cancel unaccepted edits before importing.');if(f.name.toLowerCase().endsWith('.csv')){const e=importCSV(text);$('dialog').close();if(addEvent(e))toast('CSV imported as a new event.');}else if(f.name.toLowerCase().endsWith('.json')){const candidate=parseState(text),d=openDialog('Restore backup?');d.append(el('p',{},`This replaces your ${state.events.length} current event(s) with ${candidate.events.length} event(s) from the backup, including preferences and presets.`));if(recoveryBlocked)offerOriginal(d);const a=el('div',{class:'dialog-actions'});a.append(button(recoveryBlocked?'Back up temporary in-memory plan':'Back up current data',()=>download(serializeState(state),'application/json','stemtape-before-restore.json')),button('Restore backup',()=>{$('dialog').close();if(replaceLibrary(candidate))toast('Backup restored.');},'primary'));d.append(a);}else throw Error('Choose a .csv or .json file.');}catch(err){const d=openDialog('Import could not be completed');d.append(el('p',{},`${err.message} Your existing plans have not been changed.`));}};
function offerOriginal(d){d.append(el('p',{class:'warning'},'The original saved data is protected. The visible plan is temporary fallback data, not your original. Replacement will overwrite the original; export it first.'),button('Export original recovery data',()=>download(recoveryOriginal??'','application/json','stemtape-recovery.json')));}
function help(){const d=openDialog('Your plan. Your device.');const guidance=el('p',{},'Create your cues, choose a usable stem or top-tube width and length, then print at ');guidance.append(el('strong',{},'Scale 100% / Actual size.'),document.createTextNode(' Fit to page can change physical dimensions. Disable browser print headers and footers. Check the printed 50 mm scale with a ruler.'));d.append(guidance);for(const text of ['Icon colour applies only to the primary cue artwork: fixed named colours fill audited interior regions with dark detail outlines, preserving transparent gaps. Feed zone uses coloured strokes for its open utensils. Default keeps theme-aware screen and monochrome print appearance. Colour stays with each row when its icon changes or is hidden by None. Grid options are None, Row lines (the default), and Full grid, including visible columns and an outer border; the footer stays outside the grid. Both settings are undoable and included in JSON and personal preset revisions. Coloured CSVs use an optional versioned stemtape:column: metadata column for icon-colour v1; older versions reject these coloured CSVs. Monochrome CSVs stay compatible. Grid is not included in CSV. Keep a complete JSON backup before rollback: older apps discard these styling fields. Browser/printer settings and greyscale printers can change or omit colours; always verify an actual-size physical print and its 50 mm scale. Colour is an aid, not the only cue identifier.','Undo and Redo keep up to 20 completed actions per plan in this tab, within an 8 MiB shared snapshot budget (large plans may keep fewer actions). Switching plans keeps separate histories; reloading clears them. History is never saved or exported. Plan creation/deletion, presets, library restore, theme and remembered bike dimensions are excluded. New or duplicated plans start empty; successful library replacement clears history. Correct or explicitly cancel invalid drafts before Undo/Redo. Valid restored changes stay in memory if saving fails; export a backup when Not saved is shown.',
'Event name names this ride plan, not its preset. Event names are unique among saved ride plans; preset names are unique among personal and built-in presets. Both checks trim whitespace and ignore case, preserving chosen capitalization. An event and a preset may share a name. New, duplicated, CSV/spreadsheet-imported and preset-created plans get a unique event name, adding (2), (3), etc. Existing duplicate names and complete JSON restores stay intact and have distinguishable numbered labels. Renaming requires a unique name. A conflicting event-name draft stays visible without changing the last accepted name; correct it or press Escape to cancel. If Undo/Redo would restore a name another plan has taken, the action is blocked with history intact: rename the other plan, then retry.',
'Save as new preset associates this plan with a personal copy. New preset names and preset renames must be unique after trimming and ignoring case, including built-in names. Existing duplicate names and JSON imports are preserved; numbered personal-preset labels distinguish entries without showing IDs. Content updates with an unchanged name and recovery remain available for existing duplicates. Update preset preserves its preset name and captures the current event name, both cue lists, columns, units and all plan layout/print settings. Rename preset is a separate action that leaves saved template contents and existing event names unchanged. Update preset replaces only the associated identity, after confirmation, never another same-name preset or a bundled example. Duplicates retain their association; plan renames do not rename presets. Deleting a personal preset keeps and unlinks its plans. Updating keeps one previous version; Restore previous version swaps it with the current version. These operations require successful storage and are outside plan Undo/Redo. Complete JSON retains identities, associations and recovery; CSV does not. Older versions may discard new metadata or reject new example plans: export JSON before rollback.',
'Tour of Flanders is a supplied example ride plan with no edition/year or official-route verification. Its Location Note is visible. Adjust the sheet if its 19 cues overflow; printing remains blocked until everything fits.',
'The preview is enlarged. If content does not fit, printing is blocked: increase the strip size, simplify text, hide columns or reduce spacing. Font size never shrinks automatically.','Nutrition entries are your own reminders. Distance and elapsed-time modes keep separate cue lists. Switching units converts distances; switching to time does not estimate ride speed.','Changing a distance or elapsed time sorts cues when you leave the field or press Enter. You can then drag cues or use the arrow buttons to keep a manual order until the next position edit. Equal positions keep their relative order.','Outline icons are bundled Lucide graphics. Pasted Unicode emojis use your device’s emoji font and can look different on another device. Test-print custom emojis before your ride.','Your ride plans stay yours. Everything you enter, including imported files, is processed and saved only on this device, in your browser. Your cue data is never uploaded to or stored on our servers. StemTape adds no accounts, analytics, tracking scripts or third-party font requests.','The hosted site at stemtape.cc uses GitHub Pages behind Cloudflare. These providers process hosting requests and connection information such as your IP address. Cloudflare Network Error Logging is disabled; other hosting logs and provider data processing may still apply. Your plan contents remain in your browser.','Browser storage is not encrypted and can be cleared by you or your browser. Each domain has its own data. Export JSON to transfer plans or keep a backup.'])d.append(el('p',{},text));if(recoveryBlocked){offerOriginal(d);d.append(el('p',{class:'warning'},startupWarning),button('Reset saved data',()=>confirmAction('Reset browser data?','The unreadable copy will be replaced. Export the recovery file first.',()=>{if(replaceLibrary(clone(state)))toast('Saved data reset.');}),'danger-button'));}d.append(button('Clear all local StemTape data',()=>confirmAction('Clear local data?','All events, presets, preferences and bike dimensions in this browser will be removed. Export JSON first.',()=>{const candidate=initialState();candidate.active=candidate.events[0].id;if(replaceLibrary(candidate)){try{localStorage.removeItem('stemtape.bike');}catch{}toast('Local StemTape data reset.');}}),'danger-button'));}
$('help').onclick=help;$('privacy').onclick=help;
function preparePrint(){const e=event(),{root,warnings}=makeSheet();$('print-pages').replaceChildren();if(warnings.length)return false;const W=e.layout.paper==='A4'?190:195.9,H=e.layout.paper==='A4'?277:259.4,outerW=e.layout.width+8,outerH=e.layout.length+8;if(outerW>W||outerH+16>H){toast('Strip is too large for this paper. Reduce dimensions or choose A4.');return false;}const css=[...document.styleSheets].find(s=>s.href?.endsWith('styles.css'));if(css){for(let i=css.cssRules.length-1;i>=0;i--)if(css.cssRules[i].type===CSSRule.PAGE_RULE)css.deleteRule(i);css.insertRule(`@page { size: ${e.layout.paper}; margin: 10mm; }`,css.cssRules.length);}for(let copy=0;copy<e.layout.copies;copy++){const page=el('div',{class:'print-page'}),sheet=svg('svg',{xmlns:NS,viewBox:`0 0 ${W} ${outerH+16}`,width:`${W}mm`,height:`${outerH+16}mm`}),c=root.cloneNode(true);for(const[k,v]of Object.entries({x:4,y:4,width:e.layout.width,height:e.layout.length}))c.setAttribute(k,v);sheet.append(c);for(const x of [4,4+e.layout.width])for(const y of [4,4+e.layout.length]){const sx=x===4?-1:1,sy=y===4?-1:1;sheet.append(svg('line',{x1:x+sx,y1:y,x2:x+sx*3,y2:y,stroke:'#000','stroke-width':.2}),svg('line',{x1:x,y1:y+sy,x2:x,y2:y+sy*3,stroke:'#000','stroke-width':.2}));}const y=outerH+6;sheet.append(svg('line',{x1:4,y1:y,x2:54,y2:y,stroke:'#000','stroke-width':.3}));for(const x of [4,54])sheet.append(svg('line',{x1:x,y1:y-1,x2:x,y2:y+1,stroke:'#000','stroke-width':.3}));sheet.append(svg('text',{x:4,y:y+5,'font-family':'StemSans','font-size':2.5,fill:'#000'},'50 mm · Print at 100% / Actual size'));page.append(sheet);$('print-pages').append(page);}return true;}
$('print').onclick=async()=>{await document.fonts.ready;if(preparePrint())window.print();};window.addEventListener('beforeprint',preparePrint);
const columnList=columnControls({list:$('column-order-list'),status:$('column-order-status'),getEvent:event,canEdit:()=>!hasInvalidEdits(),commit:()=>commit(true,null,'column reorder'),feedback:toast});
render();refreshHistory();refreshSaveStatus();if(startupWarning){toast(startupWarning);if(recoveryBlocked)help();}document.fonts.ready.then(renderPreview);

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
  if(moveCue(rows,id,to)){commit(true,null,'row reorder');announceMove(id);}
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
   if(drag.started){const target=[...$('editor-rows').children].indexOf(tr);if(!cancelled&&moveCue(event().rows[event().mode],id,target)){commit(true,null,'row reorder');announceMove(id);}else{renderRows();handleRefocus(id);}}
  };
  const up=e=>{if(e.pointerId===drag.pointer)finish();},cancel=()=>finish(true),escape=e=>{if(e.key==='Escape'){e.preventDefault();finish(true);}};
  handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',cancel);document.addEventListener('keydown',escape);drag.frame=requestAnimationFrame(tick);
 });
}
function handleRefocus(id){$('editor-rows').querySelector(`[data-row-id="${CSS.escape(id)}"] .drag-handle`)?.focus({preventScroll:true});}
