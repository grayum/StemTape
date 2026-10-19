// Fixed audited palette: the same sRGB values on screen and paper. Never use data as CSS.
export const ICON_COLOURS=Object.freeze([
 {id:'default',name:'Default / monochrome',value:null},
 {id:'blue',name:'Blue',value:'#2676c9'},
 {id:'orange',name:'Orange',value:'#b96a13'},
 {id:'green',name:'Green',value:'#278548'},
 {id:'red',name:'Red',value:'#c54040'},
 {id:'purple',name:'Purple',value:'#8b57b5'}
].map(Object.freeze));
export function validateIconColour(id){if(!ICON_COLOURS.some(c=>c.id===id))throw Error('Invalid cue icon colour. Choose a named palette colour.');return id;}
export const iconColour=id=>ICON_COLOURS.find(c=>c.id===(id??'default'))||ICON_COLOURS[0];
export function setIconColour(row,id){validateIconColour(id);if((row.iconColour??'default')===id)return false;if(id==='default')delete row.iconColour;else row.iconColour=id;return true;}
