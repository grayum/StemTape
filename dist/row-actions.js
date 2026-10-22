import {clone,uid,LIMITS} from './core.js';
// Pure plan mutation. The app's existing commit validates the whole-library byte
// budget and rolls back atomically before rendering/history if it cannot fit.
export function duplicateRow(plan,id){
 const rows=plan.rows[plan.mode],at=rows.findIndex(row=>row.id===id);
 if(at<0)throw Error('The cue to duplicate no longer exists.');
 if(rows.length>=LIMITS.rows)throw Error('Maximum 200 cues per mode. Remove a cue before duplicating.');
 const row=clone(rows[at]);row.id=uid();rows.splice(at+1,0,row);return row;
}
