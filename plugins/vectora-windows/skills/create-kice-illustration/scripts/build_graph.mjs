#!/usr/bin/env node
/** Node/fontkit adapter for the shared editable graph builder. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {buildGraphCore, palette} from '../../../src/production/graphs-core.mjs';
const require=createRequire(import.meta.url);
const check=(ok,message)=>{if(!ok)throw new Error(message);};
export {palette};
export function findFont(explicit){
  if(explicit)return explicit;
  const dir=path.join(os.homedir(),'Library/Fonts');
  const file=fs.existsSync(dir)&&fs.readdirSync(dir).find(n=>n.includes('UND')&&n.includes('Regular')&&n.endsWith('.ttf'));
  check(file,'Installed UND Regular font not found. Supply --font; no fallback is used.');
  return path.join(dir,file);
}
function adapter(fontPath){
  let fontkit;
  try { fontkit=require('fontkit'); } catch (error) {
    if(error.code==='MODULE_NOT_FOUND')throw new Error('This optional Node graph helper requires fontkit. Install fontkit in the plugin directory, or use vectora_production(kind: graph) without separate Node dependencies.');
    throw error;
  }
  const font=fontkit.openSync(findFont(fontPath));
  check(font.postscriptName==='UNDv21-Regular','The actual font face must be UNDv21-Regular.');
  return {postscriptName:font.postscriptName,
    normalize(value,substitutions){let text=value;if(text.includes('−')&&!font.hasGlyphForCodePoint(0x2212)){substitutions.push({from:text,to:text.replaceAll('−','-'),reason:'UND lacks U+2212; same numeric sign'});text=text.replaceAll('−','-');}for(const c of text)check(c==='\n'||font.hasGlyphForCodePoint(c.codePointAt(0)),`Unsupported UND glyph ${JSON.stringify(c)} in ${JSON.stringify(text)}`);return text;},
    measure(text,fontPx,trackingPx){return font.layout(text).positions.reduce((sum,p)=>sum+p.xAdvance,0)*fontPx/font.unitsPerEm+Math.max(0,[...text].length-1)*trackingPx;}};
}
export function buildGraph(input,{fontPath}={}){return buildGraphCore(input,{fontAdapter:adapter(fontPath)});}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{
  const args=process.argv.slice(2),get=k=>args[args.indexOf(k)+1];
  if(args.includes('--help')){console.log('node build_graph.mjs --spec input.json --output graph.svg [--font UND-Regular.ttf] [--force]\nSee references/graph-builder.md for the input contract.');process.exit(0);}
  check(args.includes('--spec')&&args.includes('--output'),'Use --spec and --output; see --help.');
  const out=path.resolve(get('--output')),meta=out.replace(/\.svg$/i,'')+'.layout.json';
  check(out.endsWith('.svg'),'Output must end in .svg.');
  check(args.includes('--force')||(!fs.existsSync(out)&&!fs.existsSync(meta)),'Output exists. Choose another name or explicitly use --force.');
  const {svg,report}=buildGraph(JSON.parse(fs.readFileSync(get('--spec'),'utf8')),{fontPath:args.includes('--font')?get('--font'):undefined});
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,svg);fs.writeFileSync(meta,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({svg:out,report:meta,widthMm:report.widthMm,heightMm:report.heightMm,requiresVisualReview:true}));
}catch(error){console.error(error.message);process.exitCode=1;}}
