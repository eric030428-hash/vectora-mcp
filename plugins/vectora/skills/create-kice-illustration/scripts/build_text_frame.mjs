#!/usr/bin/env node
/** Node CLI adapter for the shared editable text-frame calculation. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildTextFrame, variants} from './production/frames-core.mjs';
export {buildTextFrame, variants};
function main(){
  const args=process.argv.slice(2);
  if(args.includes('--help')){
    console.log('node build_text_frame.mjs --spec request.json --output frame.svg [--force]\nRequired: variant, contentHeightMm. Optional: widthMm (default 108), paddingMm, titleHeightMm (newspapers), headerHeightMm, columns/cardTitleHeightMm/footerHeightMm/portraitMm (noticeboard), asideWidthMm/asideHeightMm (browser).\nCreates an editable SVG background and .layout.json with empty content slots. No source images, text, charts, or portraits are embedded. Dimensions are adjustable construction defaults.');return;
  }
  const value=key=>{const i=args.indexOf(key);return i>=0?args[i+1]:undefined;};
  const input=value('--spec'),output=value('--output');
  if(!input||!output||!output.endsWith('.svg'))throw new Error('Use --spec request.json --output frame.svg; see --help.');
  const sidecar=output.slice(0,-4)+'.layout.json';
  if(!args.includes('--force')&&[output,sidecar].some(p=>fs.existsSync(p)))throw new Error('Output already exists; choose another path or explicitly use --force.');
  const result=buildTextFrame(JSON.parse(fs.readFileSync(input,'utf8')));
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,result.svg+'\n');fs.writeFileSync(sidecar,JSON.stringify(result.layout,null,2)+'\n');
  console.log(JSON.stringify({svg:path.resolve(output),layout:path.resolve(sidecar),widthMm:result.layout.widthMm,heightMm:result.layout.heightMm,status:result.layout.status},null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{main();}catch(error){console.error(error.message);process.exitCode=1;}}
