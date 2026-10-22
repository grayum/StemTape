// Fixed data values only; never accept imported CSS.
export const ALIGNMENTS=Object.freeze([['auto','Auto'],['left','Left'],['center','Centre'],['right','Right']]);
export function validateAlignment(value){
 if(!ALIGNMENTS.some(([id])=>id===value))throw Error('Invalid alignment.');return value;
}
export function effectiveAlignment(column){return column.align==='auto'?(column.type==='distance'||column.type==='number'?'right':'left'):validateAlignment(column.align);}
// Align the complete icon/text block inside the existing padded cell. Multiline
// text retains its own alignment inside that block; icons never drift to an edge.
export function alignedCell({left,width,padding,reserve,textWidth,alignment}){
 const block=reserve+textWidth,available=width-2*padding;
 const start=left+padding+(alignment==='right'?available-block:alignment==='center'?(available-block)/2:0);
 return {iconX:start,textX:start+reserve+(alignment==='right'?textWidth:alignment==='center'?textWidth/2:0),anchor:alignment==='right'?'end':alignment==='center'?'middle':'start'};
}
