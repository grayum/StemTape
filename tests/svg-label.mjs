import assert from 'node:assert/strict';

// SVG textContent has no line separators. A word wrap may consume one ASCII
// space; a hard wrap inside a word consumes none. Restore only an expected
// boundary space, never normalize whitespace inside a rendered line.
export function assertWrappedLabel(lines,expected,diagnostic=''){
 assert.ok(lines.length>0&&lines.every(line=>typeof line==='string'&&line.length>0),`Missing SVG label lines. ${diagnostic}`);
 let actual='';
 for(const [index,line]of lines.entries()){
  if(index>0&&expected[actual.length]===' '&&!expected.startsWith(line,actual.length))actual+=' ';
  actual+=line;
 }
 assert.equal(actual,expected,`SVG lines: ${JSON.stringify(lines)}. ${diagnostic}`);
}
