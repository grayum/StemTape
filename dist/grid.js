// Millimetres, like the shared SVG layout. Boundaries are drawn once, not per cell.
export const GRID_MODES=['none','rows','full'];
export const GRID_STROKE=.15;
// Shared left/right inset inside each configured column, in every grid mode.
export const CELL_PADDING=.8;
export function validateGrid(mode){if(!GRID_MODES.includes(mode))throw Error('Invalid grid mode. Choose None, Row lines or Full grid.');return mode;}
export const gridMode=layout=>layout.grid??(layout.lines===false?'none':'rows');
export function setGridMode(layout,mode){validateGrid(mode);if(gridMode(layout)===mode)return false;layout.grid=mode;return true;}
export function gridGeometry({left,right,top,bottom,widths,rowEnds}){
 const inset=GRID_STROKE/2,l=left+inset,r=right-inset;
 const horizontal=[top+inset,...rowEnds],vertical=[l];let x=left;
 for(const width of widths.slice(0,-1)){x+=width;vertical.push(x);}vertical.push(r);
 return {path:[...horizontal.map(y=>`M${l} ${y}H${r}`),...vertical.map(x=>`M${x} ${top+inset}V${bottom}`)].join(' '),inkBottom:bottom+inset};
}
