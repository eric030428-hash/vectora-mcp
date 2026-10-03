#!/usr/bin/env python3
"""Select and prepare existing SVG map assets; this is not a geographic projection or app API."""
from pathlib import Path
import argparse,json,xml.etree.ElementTree as ET
LIBRARY=Path(__file__).resolve().parents[1]/'assets/maps/library'

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--list',action='store_true',help='List installed primary template manifests.')
 p.add_argument('--iso',help='Filter templates by a country ISO A3 present in the visible country groups.')
 p.add_argument('--source-kind',choices=['reprojected-geographic-data','processed-downloaded-svg'],help='Filter registered geographic bases versus original-coordinate source variants.')
 p.add_argument('--projection',help='Filter by exact projection name, case insensitive.')
 p.add_argument('--template',help='Exact primary template ID from index.json.')
 p.add_argument('--output',type=Path,help='New working SVG; canonical source may not be overwritten.')
 p.add_argument('--highlight',nargs='*',default=[],help='Fill all country parts under each ISO A3 group with AAA.')
 p.add_argument('--national',choices=['solid','dashed','none'],help='Display policy for the independent national boundary layer.')
 p.add_argument('--admin',choices=['show','hide'],help='Show/hide existing administrative line geometry only.')
 a=p.parse_args();index=json.loads((LIBRARY/'index.json').read_text());rows=index['templates']
 if a.list:
  rows=[{**r,'manifest':str(Path(v['index']).parent/r['manifest'])} for v in index.get('sourceVariantLibraries',[]) for r in json.loads((LIBRARY/v['index']).read_text())['variants']]+rows
 found=[]
 for row in rows:
  if a.template and row['id']!=a.template:continue
  m=json.loads((LIBRARY/row['manifest']).read_text())
  if a.source_kind and m['sourceKind']!=a.source_kind:continue
  if a.iso and a.iso.upper() not in {c.get('iso3') if isinstance(c,dict) else c for c in m['countries']}:continue
  if a.projection and a.projection.lower()!=(m['projection'].get('name') or '').lower():continue
  found.append((row,m))
 if a.list:
  print(json.dumps([{'id':r['id'],'title':m.get('title',m['source'].get('title',m['id'])) if 'source' in m else m.get('title',m['id']),'projection':m['projection']['name'],'extentLonLat':m['projection'].get('extentLonLat'),'targetISO':m.get('targetISO'),'countryCount':len(m['countries']),'sourceKind':m['sourceKind'],'coordinateRegistration':'numeric geographic registration' if m['sourceKind']=='reprojected-geographic-data' else 'original SVG coordinates only','roles':list(m.get('roles',{}))} for r,m in found],ensure_ascii=False,indent=2));return
 if not a.template or not a.output:p.error('Use --list, or provide --template and --output.')
 if len(found)!=1:p.error('Template selection must match exactly one primary manifest.')
 row,m=found[0];source=LIBRARY/row['svg'];out=a.output.resolve()
 if out==source.resolve() or LIBRARY.resolve() in out.parents:p.error('Choose a working output outside the canonical library.')
 if out.exists():p.error('Working output already exists; choose a new name.')
 ET.register_namespace('','http://www.w3.org/2000/svg');root=ET.parse(source).getroot();ids={e.get('id'):e for e in root.iter() if e.get('id')}
 for iso in a.highlight:
  c=next((c for c in m['countries'] if c['iso3']==iso.upper()),None)
  if not c:p.error(f'Country {iso} is not present in this visible template extent.')
  ids[c['id']].set('fill','#AAAAAA')
  for child in ids[c['id']].iter():
   if child.tag.endswith('path'):child.set('fill','#AAAAAA')
 if a.national:
  group=ids[m['svgGroupIds']['national-boundaries']]
  if a.national=='none':group.set('display','none')
  else:
   group.attrib.pop('display',None)
   for e in group:
    if a.national=='solid':e.attrib.pop('stroke-dasharray',None)
    else:e.set('stroke-dasharray','1.4 1.1')
 if a.admin:
  group=ids[m['svgGroupIds']['admin-boundaries']]
  if a.admin=='show':group.attrib.pop('display',None)
  else:group.set('display','none')
 out.parent.mkdir(parents=True,exist_ok=True);ET.ElementTree(root).write(out,encoding='utf-8',xml_declaration=True)
 print(json.dumps({'output':str(out),'source':str(source),'sourceSha256':m['sha256'],'highlightedISO':[x.upper() for x in a.highlight],'nativeValidation':'not performed; import in actual Vectora and save/reopen/export separately'},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
