// All values are millimetres, matching the existing SVG coordinate system.
// Ink bounds protect emoji/italic overhangs as well as the advance width.
export function footerGeometry(layout,tableBottom,metrics){
 if(!layout.footerEnabled||!layout.footerText?.trim())return null;
 const rotated=layout.rotation===90||layout.rotation===270;
 const width=rotated?layout.length:layout.width,height=rotated?layout.width:layout.length;
 const font=layout.font*25.4/72,advance=metrics.width;
 const left=metrics.actualBoundingBoxLeft??0,right=metrics.actualBoundingBoxRight??advance;
 const ascent=Math.max(font,metrics.actualBoundingBoxAscent||0),descent=Math.max(font*.25,metrics.actualBoundingBoxDescent||0);
 const x=width/2,y=tableBottom+1+ascent,bottom=y+descent,warnings=[];
 if(advance>width-2*layout.padding||x-advance/2-left<layout.padding||x-advance/2+right>width-layout.padding)warnings.push('Footer is too wide. Shorten the footer text or increase the sheet width.');
 if(bottom>height-layout.padding)warnings.push('Footer exceeds the sheet length. Shorten the cue table or increase the sheet length.');
 return {x,y,font,bottom,warnings};
}
