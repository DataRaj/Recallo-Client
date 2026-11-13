#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
import xml.etree.ElementTree as ET
import json,struct,subprocess,hashlib
ROOT=Path(__file__).resolve().parents[2];out=ROOT/'public/brand'
def contrast(a,b):
 def lum(h):
  v=[int(h[i:i+2],16)/255 for i in (1,3,5)];v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v]
  return sum(x*w for x,w in zip(v,[.2126,.7152,.0722]))
 x,y=sorted([lum(a),lum(b)]);return round((y+.05)/(x+.05),2)
logo_names=['primary','symbol','favicon','favicon-16','favicon-32','favicon-dark','app-icon','app-icon-light','light','dark','monochrome','wordmark','symbol-dark']
result={'method':'SVG XML and outline audit; exact PNG dimensions; raster alpha bounds; measured sRGB contrast. Recognition and similarity remain visual judgments.','concepts':[],'contrast':{'forest_on_paper':contrast('#2C3E2D','#F3F8EF'),'paper_on_charcoal':contrast('#F3F8EF','#171D1A'),'clay_on_paper':contrast('#BA5A5A','#F3F8EF'),'moss_on_paper':contrast('#8A9478','#F3F8EF')}}
for p in sorted(out.glob('concept-*')):
 item={'id':p.name,'outlineOnly':True,'renders':[]}
 for name in logo_names:
  root=ET.parse(p/f'{name}.svg').getroot()
  for node in root.iter():
   tag=node.tag.rsplit('}',1)[-1]
   assert tag not in ['image','text','script','foreignObject','filter'],(p,name,tag)
   assert not any(k.endswith('href') for k in node.attrib),(p,name,'reference')
 for s in [16,24,32,64,512]:
  for prefix in ['symbol','symbol-dark']:
   file=p/f'{prefix}-{s}.png';data=file.read_bytes();w,h=struct.unpack('>II',data[16:24]);assert (w,h)==(s,s)
   rgba=subprocess.check_output(['magick',str(file),'-depth','8','RGBA:-']);pixels=[i for i in range(w*h) if rgba[i*4+3]>=128]
   assert pixels
   box=[min(i%w for i in pixels),min(i//w for i in pixels),max(i%w for i in pixels),max(i//w for i in pixels)]
   assert box[0]>0 and box[1]>0 and box[2]<w-1 and box[3]<h-1,(file,box)
   item['renders'].append({'file':file.name,'dimensions':[w,h],'alphaBounds':box,'unclipped':True})
 result['concepts'].append(item)
result['existingIconsUnchanged']={}
for name in ['favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png']:
 current=(ROOT/'public'/name).read_bytes();original=subprocess.check_output(['git','show',f'HEAD:public/{name}'],cwd=ROOT)
 result['existingIconsUnchanged'][name]=hashlib.sha256(current).digest()==hashlib.sha256(original).digest()
 assert result['existingIconsUnchanged'][name]
(out/'validation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'concepts':len(result['concepts']),'nativeRendersChecked':sum(len(x['renders']) for x in result['concepts']),'contrast':result['contrast'],'iconsUnchanged':all(result['existingIconsUnchanged'].values())}))
