#!/usr/bin/env python3
"""Audit live SVG text against the user's installed UND font; emits JSON evidence."""
import argparse,base64,binascii,json,sys,unicodedata
from pathlib import Path
import xml.etree.ElementTree as ET
from fontTools.ttLib import TTFont
FAMILY='UND폰트v2.1'
def audit(path,font,require_pure_vector=False):
 root=ET.parse(path).getroot();issues=[];texts=[];raster=0
 def walk(e,style):
  nonlocal raster
  tag=e.tag.split('}')[-1];style={**style,**{k:v for k,v in e.attrib.items() if k in ['font-family','font-weight','font-style']}}
  style.update(dict(part.split(':',1) for part in e.get('style','').split(';') if ':' in part));style={k.strip():v.strip() for k,v in style.items()}
  if tag in ['foreignObject','script']:issues.append('Forbidden element: '+tag)
  if tag=='image':
   raster+=1
   href=e.get('href',e.get('{http://www.w3.org/1999/xlink}href',''))
   if not href:issues.append('Image has no source')
   if require_pure_vector:issues.append('Raster image in pure-vector request')
  for key,value in e.attrib.items():
   if key.endswith('href') and not value.startswith('#'):
    if tag=='image' and value.startswith(('data:image/png;base64,','data:image/jpeg;base64,')):
     try:
      header,payload=value.split(',',1);raw=base64.b64decode(payload,validate=True)
      signature=b'\x89PNG\r\n\x1a\n' if 'image/png' in header else b'\xff\xd8\xff'
      if not raw.startswith(signature):issues.append('Invalid embedded image signature')
     except (ValueError,binascii.Error):issues.append('Invalid embedded image encoding')
    else:issues.append('External or unsupported resource: '+value[:100])
   if 'url(' in value and 'url(#' not in value:issues.append('External resource: '+value[:100])
  if tag in ['text','tspan']:
   value=e.text or ''
   if value.strip():
    texts.append(value);family=unicodedata.normalize('NFC',style.get('font-family','').strip(" \"'"))
    if family!=FAMILY:issues.append('Wrong font: '+family+' — '+value[:35])
    if style.get('font-weight','normal') not in ['normal','400']:issues.append('Unsupported UND weight: '+style['font-weight'])
  for child in e:walk(child,style)
 walk(root,{})
 ttf=TTFont(font);cmap=ttf.getBestCmap();chars=set(''.join(texts));missing=sorted(ch for ch in chars if not ch.isspace() and ord(ch) not in cmap)
 if missing:issues.append('Missing glyphs: '+repr(''.join(missing)))
 return {'file':str(path),'font':FAMILY,'fontFileName':font.name,'textRuns':len(texts),'uniqueCharacters':len(chars),'vectorPaths':sum(1 for e in root.iter() if e.tag.endswith('}path')),'rasterImages':raster,'artworkMode':'hybrid' if raster else 'vector','requirePureVector':require_pure_vector,'missingGlyphs':missing,'issues':issues,'passed':not issues,'visualReviewRequired':True}
def main():
 p=argparse.ArgumentParser();p.add_argument('svg',nargs='+',type=Path);p.add_argument('--font',type=Path);p.add_argument('--output',type=Path);p.add_argument('--require-pure-vector',action='store_true',help='Reject raster only when the user requires pure vector artwork');a=p.parse_args()
 font=a.font or next((x for x in (Path.home()/'Library/Fonts').glob('*Regular.ttf') if 'UND' in x.name),None)
 if not font or not font.exists():raise SystemExit('Installed UND regular font not found; no fallback was used.')
 results=[audit(f,font,a.require_pure_vector) for f in a.svg];s=json.dumps(results,ensure_ascii=False,indent=2)
 if a.output:a.output.write_text(s)
 print(s);return 0 if all(r['passed'] for r in results) else 1
if __name__=='__main__':sys.exit(main())
