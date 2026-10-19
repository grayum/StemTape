import {ICONS} from './icons.js';

// Audited interior layers, beneath the unchanged outlines. Open detail strokes are
// never implicitly filled. These local silhouettes describe actual enclosed parts.
const path=(d,transform)=>['path',{d,...(transform?{transform}:{})}];
const copy=(name,index)=>ICONS[name][index];
const INTERIORS={
 banana:[copy('banana',1)], // Fruit/peel body; the open peel detail stays on top.
 bottle:[path('M10 4V2h4v2Z'),copy('bottle',1),path('M8 7c0 1-2 1.8-2 3 0 1 1.3 1.6 1.3 2.6S6 14 6 15v5q0 2 2 2h8q2 0 2-2v-5c0-1-1.3-1.4-1.3-2.4S18 11 18 10c0-1.2-2-2-2-3Z')],
 bar:[path('M8 11V3.5Q8 2 9.5 2h5Q16 2 16 3.5V11Z'),path('M8 13.5V21q0 1 1 1h6q1 0 1-1v-5.5L14 14H8Z'),copy('bar',2)],
 gel:[copy('gel',0)],
 smile:[copy('smile',0)],
 mountain:[copy('mountain',0)],
 flag:[path('M4 4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528Z')],
 coffee:[path('M4 8h12a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1Z')], // Handle and steam stay open.
 warning:[path(ICONS.warning[0][1].d+'Z')],
 cobbles:ICONS.cobbles.slice(1), // Separate stones, never the open road edges/gaps.
 ricecake:[copy('ricecake',0)],
 can:[path('M5 4v16c0 2.7 14 2.7 14 0V4Z'),copy('can',0)],
 neutral:[path('M4 3c5-3 10 3 16 0v12c-6 3-11-3-16 0Z')],
 litter:[path('M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z')]
};
export const STROKE_ONLY_CUES=Object.freeze(['feed']); // Open utensils have no useful enclosed body.
export const COLOURED_OUTLINE='#202426';
export function iconArtwork(name,coloured=false){
 const base=ICONS[name]||[];
 if(!coloured||!INTERIORS[name])return base;
 const fills=INTERIORS[name].map(([tag,attrs])=>[tag,{...attrs,fill:'currentColor',stroke:'none','data-icon-fill':''}]);
 const outlines=base.map(([tag,attrs])=>[tag,{...attrs,stroke:attrs.stroke==='none'?'none':COLOURED_OUTLINE,...(attrs.fill==='currentColor'?{fill:COLOURED_OUTLINE}:{} )}]);
 return [...fills,...outlines];
}
