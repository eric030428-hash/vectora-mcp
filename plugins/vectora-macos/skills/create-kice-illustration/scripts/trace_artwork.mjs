#!/usr/bin/env node
// Convert newly authored grayscale artwork to editable paths; never embeds pixels.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require('canvas');
const tracer=require('imagetracerjs');
const [input,output,...options]=process.argv.slice(2);
const option=(key,fallback)=>{const i=options.indexOf(key);return i<0?fallback:Number(options[i+1]);};
const widthMm=option('--width-mm',30),colors=option('--colors',6),detail=option('--detail',1.2);
const maxPx=option('--max-px',900),minPath=option('--min-path',16);
const inkThreshold=option('--ink',85);
if(!input||!output||!(widthMm>0&&widthMm<=108)||!Number.isInteger(colors)||colors<3||colors>12||!(detail>0&&detail<=5))throw Error('Usage: trace_artwork.mjs input.png output.svg --width-mm 30 [--colors 6] [--detail 1.2]; 3..12 gray levels; detail >0..5 (lower retains finer contours).');
if(fs.existsSync(output))throw Error('Output exists; use a new path to retain earlier artwork.');
if(!(maxPx>=300&&maxPx<=1800&&minPath>=0&&minPath<=100))throw Error('max-px: 300..1800; min-path: 0..100.');
if(!(inkThreshold>=0&&inkThreshold<=160))throw Error('ink: 0 (off) ..160.');
const im=await loadImage(input),scale=Math.min(1,maxPx/Math.max(im.width,im.height));
const w=Math.round(im.width*scale),h=Math.round(im.height*scale),canvas=createCanvas(w,h),ctx=canvas.getContext('2d');
ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(im,0,0,w,h);
const pixels=ctx.getImageData(0,0,w,h);
const luminance=new Uint8Array(w*h);
let left=w,top=h,right=0,bottom=0;
for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const i=4*(y*w+x),g=Math.round(.2126*pixels.data[i]+.7152*pixels.data[i+1]+.0722*pixels.data[i+2]);
 luminance[y*w+x]=g;
 const quantized=Math.round(g/255*(colors-1))*255/(colors-1);
 pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=Math.round(quantized);
 if(g<238){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
}
if(left>right||top>bottom)throw Error('No visible artwork found.');
// Keep a small perimeter; crop affects this drawing only, never the enclosing text/layout.
left=Math.max(0,left-4);top=Math.max(0,top-4);right=Math.min(w-1,right+4);bottom=Math.min(h-1,bottom+4);
ctx.putImageData(pixels,0,0);
const cropped=ctx.getImageData(left,top,right-left+1,bottom-top+1);
const pal=Array.from({length:colors},(_,i)=>{const g=Math.round(255*i/(colors-1));return {r:g,g,b:g,a:255};});
const traced=tracer.imagedataToTracedata(cropped,{pal,colorsampling:0,numberofcolors:colors,colorquantcycles:1,pathomit:minPath,ltres:detail,qtres:detail,roundcoords:2,strokewidth:0,linefilter:false,rightangleenhance:false,blurradius:0,layering:0});
// Hide only the white component spanning the image perimeter, not enclosed white skin.
// Keep layer indexes intact because holechildren refers to indexes in the same layer.
let exteriorWhitePathsRemoved=0;
traced.layers.forEach((layer,index)=>{
 const color=traced.palette[index];if(color.r!==255||color.g!==255||color.b!==255)return;
 for(const p of layer){const b=p.boundingbox;if(!p.isholepath&&b&&b[0]<=0&&b[1]<=0&&b[2]>=cropped.width&&b[3]>=cropped.height){p.isholepath=true;exteriorWhitePathsRemoved++;}}
});
let svg=tracer.getsvgstring(traced,{roundcoords:2,strokewidth:0,scale:1,viewbox:true,desc:false});
// Separate ink from gray fills so fine dark contours are not split into gray seams.
// These are filled vector silhouettes, not strokes inflated by an editor's strokeUniform.
let inkPathCount=0;
if(inkThreshold>0){
 const ink={width:cropped.width,height:cropped.height,data:new Uint8ClampedArray(cropped.data.length)};
 for(let y=0;y<ink.height;y++)for(let x=0;x<ink.width;x++){
  const i=(y*ink.width+x)*4,g=luminance[(top+y)*w+left+x]<inkThreshold?0:255;
  ink.data[i]=ink.data[i+1]=ink.data[i+2]=g;ink.data[i+3]=255;
 }
 const inkOptions={pal:[{r:0,g:0,b:0,a:255},{r:255,g:255,b:255,a:255}],colorsampling:0,numberofcolors:2,colorquantcycles:1,pathomit:Math.min(minPath,6),ltres:Math.min(detail,.6),qtres:Math.min(detail,.6),strokewidth:0,roundcoords:3,rightangleenhance:false,blurradius:0,layering:0};
 const inkTrace=tracer.imagedataToTracedata(ink,inkOptions);
 inkTrace.layers=[inkTrace.layers[0]];inkTrace.palette=[inkTrace.palette[0]];
 const inkPaths=tracer.getsvgstring(inkTrace,inkOptions).match(/<path\b[^>]*>/g)||[];
 inkPathCount=inkPaths.length;svg=svg.replace('</svg>',`<g data-name="ink-contours">${inkPaths.join('')}</g></svg>`);
}
const count=(svg.match(/<path\b/g)||[]).length;
const heightMm=widthMm*cropped.height/cropped.width;
svg=svg.replace(/<svg\b[^>]*>/,`<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm.toFixed(6)}mm" viewBox="0 0 ${cropped.width} ${cropped.height}">`);
fs.writeFileSync(output,svg);
const report={input,output,widthMm,heightMm,pathCount:count,inkPathCount,inkThreshold,exteriorWhitePathsRemoved,grayLevels:colors,sourcePixels:[im.width,im.height],tracePixels:[cropped.width,cropped.height],detail,minPath,maxPx,embeddedRaster:false,needsVisualReview:true,complexityWarning:count>2500?'Many paths: simplify the original detail or increase detail tolerance and recheck small features.':null};
fs.writeFileSync(output.replace(/\.svg$/i,'')+'.trace.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
