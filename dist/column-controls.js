import {cueHeader} from './core.js';
import {moveColumn} from './columns.js';

// Only the list moves during a gesture. Model/storage changes happen once, on a valid drop.
export function columnControls({list,status,getEvent,canEdit,commit,feedback}){
 let drag=null;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const focus=(id,part='handle')=>{
  const item=[...list.children].find(n=>n.dataset.columnId===id);
  const requested=item?.querySelector(`[data-column-action="${part}"]`);
  (requested&&!requested.disabled?requested:item?.querySelector('[data-column-action="handle"]'))?.focus({preventScroll:true});
 };
 function move(id,target,part='handle'){
  if(!canEdit()){feedback('Correct or cancel the invalid entry before moving columns.');return false;}
  if(!moveColumn(getEvent(),id,target))return false;
  const accepted=commit();focus(id,part);
  if(accepted){const e=getEvent(),at=e.columns.findIndex(c=>c.id===id);status.textContent=`${e.columns[at].label} moved to position ${at+1} of ${e.columns.length}.`;}
  return accepted;
 }
 function attach(handle,item,id){
  handle.addEventListener('keydown',ev=>{
   if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(ev.key))return;
   ev.preventDefault();const cols=getEvent().columns,at=cols.findIndex(c=>c.id===id);
   move(id,ev.key==='Home'?1:ev.key==='End'?cols.length-1:at+(['ArrowLeft','ArrowUp'].includes(ev.key)?-1:1));
  });
  handle.addEventListener('pointerdown',ev=>{
   if(ev.button!==0||!ev.isPrimary||drag||!canEdit())return;
   ev.preventDefault();handle.focus({preventScroll:true});
   const gesture={id,plan:getEvent().id,pointer:ev.pointerId,startY:ev.clientY,x:ev.clientX,y:ev.clientY,started:false,frame:0};drag=gesture;
   handle.setPointerCapture(ev.pointerId);
   const hit=()=>{
    const target=document.elementFromPoint(gesture.x,gesture.y)?.closest('.column-order-item');
    if(!target||target.parentElement!==list||target===item)return;
    const box=target.getBoundingClientRect();
    list.insertBefore(item,target===list.firstElementChild?target.nextSibling:gesture.y<box.top+box.height/2?target:target.nextSibling);
    handle.setPointerCapture(gesture.pointer);
   };
   const tick=()=>{
    if(drag!==gesture)return;
    if(gesture.started){const edge=60,delta=gesture.y<edge?-10:gesture.y>innerHeight-edge?10:0;if(delta)window.scrollBy(0,delta);hit();}
    gesture.frame=requestAnimationFrame(tick);
   };
   const pointerMove=ev=>{
    if(ev.pointerId!==gesture.pointer)return;gesture.x=ev.clientX;gesture.y=ev.clientY;
    if(!gesture.started&&Math.abs(gesture.y-gesture.startY)>5){gesture.started=true;item.classList.add('dragging');}
    if(gesture.started){ev.preventDefault();hit();}
   };
   const cleanup=()=>{
    if(drag!==gesture)return;drag=null;cancelAnimationFrame(gesture.frame);item.classList.remove('dragging');
    handle.removeEventListener('pointermove',pointerMove);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',cancel);handle.removeEventListener('lostpointercapture',cancel);document.removeEventListener('keydown',escape);
    if(handle.hasPointerCapture(gesture.pointer))handle.releasePointerCapture(gesture.pointer);
   };
   const finish=(cancelled=false)=>{
    if(drag!==gesture)return;const target=[...list.children].indexOf(item);cleanup();
    if(cancelled||getEvent().id!==gesture.plan||!gesture.started||!move(id,target)){
     render();focus(id);if(cancelled)status.textContent='Column movement cancelled.';
    }
   };
   const up=ev=>{if(ev.pointerId===gesture.pointer)finish();},cancel=()=>finish(true),escape=ev=>{if(ev.key==='Escape'){ev.preventDefault();finish(true);}};
   gesture.cleanup=cleanup;
   handle.addEventListener('pointermove',pointerMove);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',cancel);document.addEventListener('keydown',escape);
   gesture.frame=requestAnimationFrame(tick);
  });
 }
 function render(){
  // Mode/event changes abandon an unfinished gesture without persisting its preview order.
  drag?.cleanup();list.replaceChildren();const e=getEvent();
  e.columns.forEach((c,i)=>{
   const item=node('li',undefined,'column-order-item');item.dataset.columnId=c.id;
   const name=node('span',i===0?cueHeader(e,c):c.label,'column-order-name');name.id=`column-order-name-${i}`;
   if(i===0)item.append(node('span','Fixed first','column-fixed'));else{
    const handle=node('button','⠿','column-drag-handle');handle.type='button';handle.dataset.columnAction='handle';
    handle.setAttribute('aria-label',`Reorder column ${c.label}`);handle.setAttribute('aria-describedby','columns-help');attach(handle,item,c.id);item.append(handle);
   }
   const label=node('span',undefined,'column-order-label');label.append(name);if(!c.visible)label.append(node('span','Hidden','column-hidden'));item.append(label);
   if(i>0)for(const [text,direction,delta]of [['Move left','left',-1],['Move right','right',1]]){
    const b=node('button',text,'column-move-button');b.type='button';b.dataset.columnAction=direction;b.setAttribute('aria-describedby',name.id);
    b.disabled=direction==='left'?i===1:i===e.columns.length-1;
    b.onclick=()=>move(c.id,getEvent().columns.findIndex(x=>x.id===c.id)+delta,direction);item.append(b);
   }
   list.append(item);
  });
 }
 return {render,focus};
}
