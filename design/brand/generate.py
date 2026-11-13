#!/usr/bin/env python3
"""Original Recallo lettering and symbols. Standard library; ImageMagick for PNGs."""
from pathlib import Path
from html import escape as esc
import json, subprocess, math, hashlib

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/brand'
PAPER='#F3F8EF'; INK='#2C3E2D'; DARK='#171D1A'; MOSS='#8A9478'; CLAY='#BA5A5A'
CONCEPTS=[
 dict(id='01',name='Return R',category='Custom monogram',idea='A returning foot gives the R a second destination.',type='Compact grotesk; open e, single-storey a, returning R foot.',geometry='21-unit stem; 19-unit shoulder; open 31-unit counter. The leg returns to a horizontal terminal, rather than ending in a generic diagonal.',limit='The R category is crowded. The returning foot is less apparent at 16px; the master is deliberately simplified there.',small='The 16px cut thickens the counter floor and widens its opening. The returning foot becomes a square hook; no rounded subpixel tip.',scores=[27,18,18,12,14]),
 dict(id='02',name='Held quotation',category='Conversation → memory',idea='Two spoken fragments settle onto a single retained line.',type='Soft humanist lettering; wider apertures and a short-footed R.',geometry='Two offset quotation forms and a retained baseline. The second tail ends above the baseline, leaving an intentional open interval.',limit='Quotation marks are familiar editorial material. Recognition depends on the retained baseline, not on quotation marks alone.',small='The 16px cut removes the second tail curve and opens the gap above the baseline to 2px. Both quote heads remain 4px wide.',scores=[23,16,14,12,13]),
 dict(id='03',name='Retrace',category='Continuity & recall',idea='One path moves forward, turns back and continues.',type='Square-shouldered grotesk; clipped e aperture and firm horizontal rhythm.',geometry='A single filled contour with two opposing right-angle returns. A 20-unit channel separates the passes; no arrowhead, loop or implied playback button.',limit='Can be read as a numeral 2, an abstract S or a route. Its angularity is more technical than conversational and needs the warmer wordmark beside it.',small='The 16px cut uses a 3px band and a minimum 1px channel, aligned to a 16px grid. At 32px it uses the fuller master proportions.',scores=[24,17,15,14,13]),
 dict(id='04',name='Margin ligature',category='Typographic identity',idea='Recallo’s double l becomes a shared editorial margin.',type='Original low-contrast serif lettering, linked l feet and a crisp R leg.',geometry='Two ascenders share a stepped foot. Small head serifs distinguish the stems; the lower rail continues the wordmark’s reading baseline.',limit='The wordmark carries this route. In isolation the symbol may read as II or a small architectural monogram; weaker in a crowded app grid.',small='Serifs widen to full pixels at 16px; the shared foot is 2–3px deep. Use the serif master from 32px upward, not a scaled full wordmark.',scores=[24,16,14,9,12]),
 dict(id='05',name='Binding fold',category='Wildcard / a physical record',idea='A loose strip folds into a bound, retained edge.',type='Expanded lettering with an upright R and broad, quiet rounded counters.',geometry='A vertical spine supports a rising flap and a separated lower fold. The diagonal seam is structural and remains open in one color.',limit='A folded-strip reading needs introduction; some viewers may see a flag or K. Avoid adding more folds or trying to hide another letter.',small='The 16px cut makes the fold seam at least 1px, widens the spine to 4px and squares the lower flap. No decorative crease line is used.',scores=[24,17,15,11,13]),
]

# Every component of the logo is a filled outline. No font embedding, masks or strokes.
def path(d,color):return f'<path fill="{color}" fill-rule="evenodd" d="{d}"/>'
def symbol(n,color=INK,small=False):
 if small:
  ds={
   1:['M2 14V2H8C11 2 13 3.5 13 6C13 8 12 9 10 10L13 12H14V15H11L7 10H5V14Z M5 4V7.5H8C9.5 7.5 10 7 10 6C10 4.5 9 4 8 4Z'],
   2:['M2 2H6V6C6 8 5 9.5 4 11H14V14H2V10C3.5 9 4 8 4 6H2Z','M10 2H14V6C14 8 13 9 11 9H9V7C10.5 7 12 6.5 12 6H10Z'],
   3:['M2 2H14V9H7V11H14V14H3V6H11V5H2Z'],
   4:['M2 2H6V11H8V14H2V12H3V4H2Z','M8 2H12V11H14V14H7V12H9V4H8Z'],
   5:['M2 2H6V7L14 3V7L6 11V14H2Z','M8 12L14 9V14H8Z']
  }[n]
  return ''.join(path(d,color) for d in ds)
 ds={
  1:['M18 116V14H65C94 14 110 28 110 49C110 65 102 77 86 82L105 101H114V118H90L58 84H39V116Z M39 33V65H64C80 65 89 60 89 49C89 38 80 33 64 33Z'],
  2:['M18 18H54V50C54 70 45 82 32 94H110V114H18V80C30 72 34 64 34 54H18Z','M74 18H110V50C110 65 103 76 91 82H71V64C83 62 90 58 90 54H74Z'],
  3:['M18 16H110V78H48V94H110V114H28V58H90V36H18Z'],
  4:['M18 14H46V91C46 96 49 98 55 98H65V114H18V101H27V28H18Z','M64 14H91V91C91 96 94 98 100 98H112V114H57V101H72V28H64Z'],
  5:['M20 16H52V60L108 30V64L52 94V114H20Z','M64 97L108 73V112H64Z']
 }[n]
 return ''.join(path(d,color) for d in ds)

def glyphs(n):
 # Cap height 100, x-height 72, curved bowls overshoot to 102.
 t={1:14,2:12,3:16,4:13,5:13}[n]
 R=f'M0 100V0H35C59 0 72 13 72 32C72 47 64 57 51 61L76 100H58L34 64H{t}V100Z M{t} 13V51H33C49 51 57 45 57 32C57 19 49 13 33 13Z'
 if n==1:R=f'M0 100V0H35C59 0 72 13 72 32C72 47 64 57 51 61L68 85H78V100H59L34 64H{t}V100Z M{t} 13V51H33C49 51 57 45 57 32C57 19 49 13 33 13Z'
 e=f'M67 69H{t}C16 82 24 89 37 89C47 89 53 86 59 80L67 90C59 98 49 102 36 102C13 102 0 87 0 64C0 42 14 27 35 27C55 27 67 41 67 62Z M{t} 57H53C51 45 45 39 35 39C24 39 17 46 {t} 57Z'
 c=f'M65 40L53 50C49 43 43 40 35 40C22 40 {t} 49 {t} 64C{t} 80 22 89 35 89C43 89 49 85 53 78L65 87C58 97 48 102 34 102C13 102 0 87 0 64C0 42 14 27 35 27C48 27 59 32 65 40Z'
 a=f'M52 100V91C46 98 38 102 28 102C10 102 0 89 0 65C0 42 12 27 30 27C40 27 47 31 52 38V29H66V100Z M{t} 65C{t} 80 21 89 32 89C44 89 52 79 52 65C52 50 44 40 32 40C21 40 {t} 49 {t} 65Z'
 l=f'M0 0H{t}V80C{t} 86 17 89 23 89H28V100H20C6 100 0 93 0 80Z'
 o=f'M0 64C0 42 14 27 35 27C56 27 70 42 70 64C70 87 56 102 35 102C14 102 0 87 0 64Z M{t} 64C{t} 80 22 89 35 89C48 89 {70-t} 80 {70-t} 64C{70-t} 49 48 40 35 40C22 40 {t} 49 {t} 64Z'
 if n==3:
  o='M22 27H48C62 27 70 37 70 51V78C70 93 62 102 48 102H22C8 102 0 93 0 78V51C0 37 8 27 22 27Z M25 41C18 41 16 44 16 51V78C16 85 18 88 25 88H45C52 88 54 85 54 78V51C54 44 52 41 45 41Z'
  l='M0 0H16V85H29V100H0Z'
 if n==4:
  # Reduced horizontal weight and serifed verticals distinguish the editorial route.
  R='M-5 0H36C60 0 73 12 73 30C73 46 65 55 50 60L72 94L80 97V101H58L33 62H15V95L24 98V102H-5V98L2 95V7L-5 4Z M15 9V53H32C50 53 59 45 59 30C59 16 50 9 34 9Z'
  l='M-5 0H15V90C15 95 18 97 25 97H32V104H-5V98H2V9L-5 6Z'
  o='M0 64C0 41 14 27 35 27C56 27 70 41 70 64C70 87 56 102 35 102C14 102 0 87 0 64Z M13 64C13 85 21 94 35 94C49 94 57 85 57 64C57 44 49 35 35 35C21 35 13 44 13 64Z'
  a='M6 37C14 28 23 24 35 24C56 24 67 35 67 54V88C67 95 69 97 75 97V102H56L54 92C47 99 39 103 27 103C10 103 0 92 0 77C0 62 12 52 33 52H53V49C53 37 47 32 34 32C23 32 17 38 14 46Z M53 60H34C20 60 13 66 13 77C13 89 20 96 31 96C44 96 53 85 53 71Z'
  c='M65 37L57 52H52C48 40 42 35 32 35C18 35 13 46 13 64C13 84 21 94 35 94C45 94 53 89 60 80L67 86C60 97 49 103 34 103C13 103 0 87 0 64C0 41 14 27 35 27C47 27 57 31 65 37Z'
 return [R,e,c,a,l,l,o]

def wordmark(n,color=INK):
 widths=[78,68,66,77 if n==4 else 68,32 if n==4 else 28,32 if n==4 else 28,70];tracking={1:8,2:10,3:8,4:8,5:12}[n]
 parts=[];x=0
 for idx,d in enumerate(glyphs(n)):
  parts.append(f'<g transform="translate({x} 0)">{path(d,color)}</g>')
  x+=widths[idx]+tracking
 # Shared double-l foot, not a generic font ligature.
 if n==4:
  start=sum(widths[:4])+tracking*4
  parts.append(path(f'M{start+4} 98H{start+64}V104H{start+4}Z',color))
 sx={1:1,2:1.015,3:.94,4:1,5:1.09}[n]
 return f'<g transform="scale({sx} 1)">{"".join(parts)}</g>',(x-tracking)*sx

def pixel32(n,color=INK):
 import re
 raw=symbol(n,color)
 def fix(m):
  return 'd="'+re.sub(r'-?\d+(?:\.\d+)?',lambda v:str(round(float(v[0])/4)),m[1])+'"'
 return re.sub(r'd="([^"]+)"',fix,raw)

def svg(body,w,h,title,bg=None,desc=''):
 bgmark=f'<path fill="{bg}" d="M0 0H{w}V{h}H0Z"/>' if bg else ''
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{esc(title)}"><title>{esc(title)}</title><desc>{esc(desc)}</desc>{bgmark}{body}</svg>\n'

def lockup(n,color=INK,x=0,y=0,width=650):
 wm,ww=wordmark(n,color)
 scale=width/(180+ww)
 return f'<g transform="translate({x} {y}) scale({scale})"><g transform="translate(0 -4)">{symbol(n,color)}</g><g transform="translate(180 8)">{wm}</g></g>'

def text(x,y,s,size=16,color=INK,weight=400):
 return f'<text x="{x}" y="{y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{esc(str(s))}</text>'
def rect(x,y,w,h,color,rx=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{color}"/>'
def label_lines(lines,x,y,size=17,color=INK,gap=27):return ''.join(text(x,y+i*gap,line,size,color) for i,line in enumerate(lines))
def wrap(s,n=80):
 import textwrap
 return textwrap.wrap(s,n)
def line(x,y,w,color='#CCD5C7'):return f'<path d="M{x} {y}h{w}" stroke="{color}"/>'

def icon(n,bg=INK,fg=PAPER):
 # Different silhouettes have different visual mass, not different canvas sizes.
 scales={1:3.10,2:3.16,3:3.17,4:3.18,5:3.2}
 s=scales[n];x=(512-128*s)/2;y=(512-128*s)/2-3
 return rect(0,0,512,512,bg,104)+f'<g transform="translate({x:.2f} {y:.2f}) scale({s})">{symbol(n,fg)}</g>'

def mockups(n):
 b=text(56,60,f'{n:02d} / {CONCEPTS[n-1]["name"]} — placement studies',30,INK,600)
 b+=text(56,92,'Illustrative application data. Brand placement only; these are not product screenshots.',15)
 b+=rect(56,124,1328,164,'#FFFFFF',12)+lockup(n,INK,80,150,190)
 b+=text(785,170,'Product',15)+text(890,170,'Join a meeting',15)+rect(1070,142,270,48,INK,6)+text(1110,173,'Create a room',16,PAPER,600)
 b+=text(80,250,'Website navigation · light reading surface',16)
 # Browser tabs: actual 16px drawings, not scaled-up approximations.
 b+=rect(56,320,1328,125,'#E3E9DF',12)
 for i,name in enumerate(['Recallo · Launch planning','Recallo · Meeting insights','Recallo · Workspace']):
  x=76+i*418;b+=rect(x,340,400,42,'#FFFFFF',8)
  b+=f'<g transform="translate({x+16} 352)">{symbol(n,INK,True)}</g>'+text(x+44,368,name,14)
 b+=rect(76,396,1280,32,PAPER,5)+text(92,418,'recallo.example / meeting / launch-planning',14)
 b+=rect(56,480,860,548,DARK,12)
 b+=lockup(n,PAPER,80,498,155)+text(590,530,'Launch planning · 12:48',14,PAPER)
 # Faithful meeting primitives: shared screen, participant tiles and controls.
 b+=rect(80,560,596,345,'#29332D',8)+rect(104,584,548,297,PAPER,4)
 b+=text(130,625,'Launch review',24,INK,600)+text(130,661,'Timeline / remaining dependencies',16)
 for y,w in [(699,450),(725,375),(751,410)]:b+=rect(130,y,w,7,'#CDD8C7',3)
 b+=rect(130,802,246,32,'#E1EBD9',4)+text(142,824,'Draft review · Thursday',14)
 for i,(initial,name) in enumerate([('AM','Alex Morgan'),('PS','Priya Shah')]):
  y=560+i*178;b+=rect(692,y,200,165,'#354237',8)+text(755,y+86,initial,30,PAPER,600)+text(707,y+147,name,12,PAPER)
 for i,s in enumerate(['Mic','Camera','Share','Chat','Leave']):
  x=80+i*163;b+=rect(x,938,147,44,'#9D4545' if i==4 else '#354237',6)+text(x+30,966,s,13,PAPER)
 b+=text(80,1009,'Meeting room · symbol stays identifiable beside dense controls',13,PAPER)
 b+=rect(944,480,440,548,'#FFFFFF',12)+lockup(n,INK,970,500,155)
 b+=text(970,580,'AFTER THE MEETING',11,INK,600)+text(970,625,'Launch planning',24,INK,600)
 b+=text(970,675,'Decision',14,INK,600)+label_lines(['Move the launch review','to Thursday.'],970,708,18)
 b+=line(970,764,382)+text(970,802,'Next action',14,INK,600)+label_lines(['Priya to share the revised draft','before the review.'],970,835,17)
 b+=text(970,990,'Example summary · illustrative content',12)
 # Current-app palette compatibility, separate from the forest identity study.
 b+=rect(56,1060,1328,118,'#F8F4EA',8)+lockup(n,'#1B1E1B',80,1087,200)
 b+=rect(1080,1092,260,44,'#ED5A3A',6)+text(1110,1120,'Create a room',16,'#1B1E1B',600)
 b+=text(330,1122,'Compatibility with the current ivory / vermilion application palette',16)
 return svg(b,1440,1224,f'Recallo {CONCEPTS[n-1]["name"]} context mockups',PAPER)

def sheet(c):
 n=int(c['id']);b=text(56,66,f'{c["id"]} / {c["name"]}',36,INK,600)+text(56,103,c['category'],16)
 b+=text(56,145,c['idea'],22)
 b+=rect(56,184,1328,220,'#E6EEDF',12)+lockup(n,INK,210,204,1020)
 b+=rect(56,428,650,180,DARK,12)+lockup(n,PAPER,84,467,570)
 b+=rect(730,428,654,180,'#FFFFFF',12)+lockup(n,'#000000',758,467,570)
 b+=text(76,642,'SMALL-SIZE SYSTEM / native pixel sizes',13,INK,600)
 xx=80
 for sz in [16,24,32,64]:
  b+=f'<g transform="translate({xx} 674) scale({sz/(16 if sz==16 else 32 if sz==32 else 128)})">{pixel32(n) if sz==32 else symbol(n,INK,sz==16)}</g>'
  b+=text(xx,774,f'{sz}px',14);xx+=120
 b+=text(56,840,'Construction & lettering',22,INK,600)
 b+=label_lines(wrap(c['geometry'],54),56,877,17)
 b+=label_lines(wrap(c['type'],54),56,1000,17)
 b+=text(56,1092,'Optical cut',22,INK,600)+label_lines(wrap(c['small'],54),56,1127,17)
 b+=text(56,1270,'Where it gives ground',22,INK,600)+label_lines(wrap(c['limit'],54),56,1307,17)
 b+=f'<g transform="translate(800 714)">{icon(n)}</g>'
 b+=text(800,1264,'Application icon / actual 512 × 512 drawing',16)
 b+=text(800,1310,'Clear space: at least one stem-width.',16)
 b+=text(800,1340,'Full lockup minimum: 140px wide.',16)
 b+=text(800,1370,'Below 140px: standalone symbol, not the wordmark.',16)
 b+=line(56,1450,1328)+text(56,1492,'Editorial score — not a user-research or trademark result',15)
 b+=text(1130,1493,f'{sum(c["scores"])} / 100',32,INK,600)
 return svg(b,1440,1540,f'Recallo {c["name"]} identity sheet',PAPER)

def board():
 b=text(64,78,'Recallo',48,INK,600)+text(64,118,'Five ways to keep the context.',24)
 b+=text(1050,75,'IDENTITY STUDY / 12 NOV 2026',13,INK,600)
 b+=text(1050,105,'Original vector lettering · one-color first',13)
 b+=line(64,148,1472)+text(64,182,'DIRECTION',11,INK,600)+text(350,182,'PRIMARY SIGNATURE',11,INK,600)+text(1060,182,'SYMBOL',11,INK,600)+text(1230,182,'16 / 32',11,INK,600)+text(1440,182,'SCORE',11,INK,600)
 for i,c in enumerate(CONCEPTS):
  y=210+i*177;n=i+1
  b+=text(64,y+31,f'{c["id"]}  {c["name"]}',20,INK,600)+text(64,y+62,c['category'],13)
  b+=lockup(n,INK,350,y+10,635)
  b+=f'<g transform="translate(1050 {y+10}) scale(.75)">{symbol(n)}</g>'
  b+=f'<g transform="translate(1236 {y+38})">{symbol(n,INK,True)}</g>'
  b+=f'<g transform="translate(1285 {y+30}) ">{pixel32(n)}</g>'
  b+=text(1440,y+67,sum(c['scores']),32,INK,600)
  b+=line(64,y+145,1472)
 b+=text(64,1140,'SHORTLIST   01 / RETURN R       03 / RETRACE',20,INK,600)
 b+=text(64,1181,'Scores reflect design judgment using the supplied weights. No trademark clearance or recognition study performed.',14)
 return svg(b,1600,1220,'Recallo five-concept comparison board',PAPER)

def render(src,dst,w=None,h=None):
 args=['magick','-background','none',str(src)]
 if w and h:args+=['-resize',f'{w}x{h}!']
 args+=['PNG32:'+str(dst)]
 subprocess.run(args,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)

def generate():
 OUT.mkdir(exist_ok=True)
 for c in CONCEPTS:
  n=int(c['id']);p=OUT/f'concept-{c["id"]}';p.mkdir(exist_ok=True)
  desc=c['idea']+' Original filled vector artwork; candidate, not an adopted identity.'
  arts={
   'primary.svg':svg(lockup(n,INK,24,22,670),720,176,'Recallo '+c['name'],desc=desc),
   'light.svg':svg(lockup(n,INK,24,22,670),720,176,'Recallo '+c['name']+' on paper',PAPER,desc),
   'dark.svg':svg(lockup(n,PAPER,29,23,660),720,176,'Recallo '+c['name']+' reversed',DARK,desc),
   'monochrome.svg':svg(lockup(n,'#000000',24,22,670),720,176,'Recallo '+c['name']+' monochrome',desc=desc),
   'symbol.svg':svg(symbol(n),128,128,'Recallo '+c['name']+' symbol',desc=desc),
   'symbol-dark.svg':svg(symbol(n,PAPER),128,128,'Recallo '+c['name']+' light symbol',desc=desc),
   'favicon.svg':svg(symbol(n,INK,True),16,16,'Recallo '+c['name']+' 16px optical favicon',desc=c['small']),
   'favicon-16.svg':svg(symbol(n,INK,True),16,16,'Recallo '+c['name']+' 16px favicon',desc=c['small']),
   'favicon-32.svg':svg(pixel32(n),32,32,'Recallo '+c['name']+' 32px favicon',desc=c['small']),
   'favicon-dark.svg':svg(symbol(n,PAPER,True),16,16,'Recallo '+c['name']+' reversed 16px favicon',desc=c['small']),
   'app-icon.svg':svg(icon(n),512,512,'Recallo '+c['name']+' app icon',desc=desc),
   'app-icon-light.svg':svg(icon(n,PAPER,INK),512,512,'Recallo '+c['name']+' light app icon',desc=desc),
   'wordmark.svg':svg('<g transform="translate(6 2)">'+wordmark(n)[0]+'</g>',round(wordmark(n)[1])+12,112,'Recallo '+c['name']+' original lettering',desc=c['type']),
   'identity-sheet.svg':sheet(c),
   'mockups.svg':mockups(n),
  }
  for name,art in arts.items():(p/name).write_text(art)
  for name in ['primary','light','dark','monochrome','app-icon','identity-sheet','mockups']:
   render(p/f'{name}.svg',p/f'{name}.png')
  for size in [16,24,32,64,512]:
   source=p/('favicon.svg' if size==16 else 'favicon-32.svg' if size==32 else 'symbol.svg')
   render(source,p/f'symbol-{size}.png',size,size)
  # Inspect reverse and pure silhouette at the same native sizes.
  for size in [16,24,32,64,512]:
   render(p/('favicon-dark.svg' if size==16 else 'symbol-dark.svg'),p/f'symbol-dark-{size}.png',size,size)
  render(p/'favicon-16.svg',p/'favicon-16.png',16,16)
  render(p/'favicon-32.svg',p/'favicon-32.png',32,32)
  c['total']=sum(c['scores'])
 (OUT/'comparison-board.svg').write_text(board())
 render(OUT/'comparison-board.svg',OUT/'comparison-board.png')
 (OUT/'concepts.json').write_text(json.dumps(CONCEPTS,indent=2)+'\n')
 print('Generated five vector kits, identity sheets, mockups and native PNG size ladders.')

if __name__=='__main__':generate()
