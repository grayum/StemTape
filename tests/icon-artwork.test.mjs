import test from 'node:test';
import assert from 'node:assert/strict';
test('audited colour interiors preserve original geometry and open-symbol exceptions',async()=>{
 const {iconArtwork,STROKE_ONLY_CUES,COLOURED_OUTLINE}=await import('../dist/icon-fills.js');const {ICONS}=await import('../dist/icons.js');const {SYMBOLS}=await import('../dist/core.js');
 const original=JSON.stringify(ICONS);
 assert.deepEqual(STROKE_ONLY_CUES,['feed']);
 for(const key of SYMBOLS.filter(Boolean)){
  assert.deepEqual(iconArtwork(key),ICONS[key]);const coloured=iconArtwork(key,true),fills=coloured.filter(([,a])=>Object.hasOwn(a,'data-icon-fill'));
  if(key==='feed'){assert.deepEqual(coloured,ICONS.feed);continue;}
  assert.ok(fills.length,key);assert.ok(fills.every(([tag,a])=>['path','rect','circle','ellipse'].includes(tag)&&a.fill==='currentColor'&&a.stroke==='none'),key);
  const outlines=coloured.slice(fills.length);assert.equal(outlines.length,ICONS[key].length);
  outlines.forEach(([tag,a],i)=>{assert.equal(tag,ICONS[key][i][0]);for(const [attr,v]of Object.entries(ICONS[key][i][1]))if(!['fill','stroke'].includes(attr))assert.equal(a[attr],v,`${key} ${attr}`);assert.ok(a.stroke==='none'||a.stroke===COLOURED_OUTLINE);});
 }
 assert.equal(JSON.stringify(ICONS),original);assert.ok(iconArtwork('bottle',true).every(([,a])=>!Object.hasOwn(a,'transform')));for(const key of ['bar','gel'])for(const coloured of [false,true])assert.ok(iconArtwork(key,coloured).every(([,a])=>!Object.hasOwn(a,'transform')));assert.equal(iconArtwork('coffee',true).filter(([,a])=>Object.hasOwn(a,'data-icon-fill')).length,1);assert.equal(iconArtwork('cobbles',true).filter(([,a])=>Object.hasOwn(a,'data-icon-fill')).length,8);
});
