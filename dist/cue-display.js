// Presentation is interpreted only for the stable primary cue-column ID.
export const cueDisplay=column=>column.cueDisplay??'icon-text';
export function validateCueDisplay(value){if(!['icon-text','icon-only'].includes(value))throw Error('Invalid cue display.');return value;}
// Development-preview widthMode metadata is deliberately discarded by validation.
// It never enables plan-wide fitting or changes retained column shares.
export function sheetColumnWidths(columns,inner,natural,fit=false){
 const sum=columns.reduce((n,c)=>n+c.width,0);
 return fit&&natural.reduce((a,b)=>a+b,0)<=inner?natural.slice():columns.map(c=>inner*c.width/sum);
}
