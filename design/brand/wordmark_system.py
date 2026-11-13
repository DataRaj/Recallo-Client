#!/usr/bin/env python3
"""Recallo: original, full-name lettering and reusable brand exports."""
from pathlib import Path
from html import escape
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'public/brand/wordmark-system'
INK='#243C36'; PAPER='#FAF5EC'; CLAY='#B74830'; PEACH='#F1D4BF'; SAGE='#D6E2D6'; NIGHT='#152A26'; REVERSE='#F29374'
# Cap height 120; x-height 85; 2-unit overshoot. Stroke rhythm 17–19 units.
GLYPHS=[
('R',0,'M0 120V0H45C76 0 92 15 92 39C92 58 82 71 65 76L95 120H72L44 79H19V120Z M19 17V62H43C63 62 73 54 73 39C73 24 63 17 43 17Z'),
('e',103,'M80 84H18C20 100 30 108 44 108C56 108 64 104 71 97L81 110C71 119 59 123 43 123C16 123 0 106 0 79C0 52 16 35 42 35C67 35 81 52 81 77Z M18 70H63C61 56 54 50 42 50C30 50 21 57 18 70Z'),
('c',193,'M78 49L66 62C60 54 53 51 44 51C28 51 18 62 18 79C18 97 28 108 44 108C54 108 61 104 67 96L79 108C70 118 59 123 43 123C17 123 0 105 0 79C0 53 17 35 43 35C58 35 70 40 78 49Z'),
('a',281,'M5 46C15 39 28 35 43 35C68 35 81 47 81 69V120H64L63 110C56 119 46 123 32 123C12 123 0 112 0 95C0 77 14 66 38 66H63C62 55 55 50 42 50C30 50 21 54 13 59Z M63 80H40C25 80 18 85 18 94C18 104 24 109 35 109C51 109 63 99 63 85Z'),
('ll',374,'M0 0H18V104H27V120H0Z M36 0H54V104H62V120H36Z'),
('o',443,'M0 79C0 52 17 35 43 35C69 35 86 52 86 79C86 106 69 123 43 123C17 123 0 106 0 79Z M18 79C18 98 27 108 43 108C59 108 68 98 68 79C68 61 59 50 43 50C27 50 18 61 18 79Z')]

def paths(ink=INK,accent=CLAY):
 return ''.join(f'<path fill="{accent if c=="ll" else ink}" fill-rule="evenodd" transform="translate({x} 0)" d="{d}"/>' for c,x,d in GLYPHS)
def svg(body,w,h,title,bg=None):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(title)}"><title>{escape(title)}</title>'+ (f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else '')+body+'</svg>\n'
def wm(x,y,w=529,ink=INK,accent=CLAY):return f'<g transform="translate({x} {y}) scale({w/529})">{paths(ink,accent)}</g>'
def txt(x,y,t,size=18,c=INK):return f'<text x="{x}" y="{y}" fill="{c}" font-family="DejaVu Sans,Arial,sans-serif" font-size="{size}">{escape(t)}</text>'
def box(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>'
def write(n,body,w,h,bg=None):
 p=OUT/f'{n}.svg';p.write_text(svg(body,w,h,'Recallo / '+n,bg));return p
OUT.mkdir(parents=True,exist_ok=True)
for name,fg,accent,bg in [('primary',INK,CLAY,None),('dark',PAPER,REVERSE,None),('monochrome',INK,INK,None),('white','#FFFFFF','#FFFFFF',None),('terracotta',CLAY,CLAY,None),('on-paper',INK,CLAY,PAPER),('on-dark',PAPER,REVERSE,NIGHT)]:
 write(name,wm(18,18),565,159,bg)
# Compact mark extracted from the full name, never prepended to the full wordmark.
mark='M0 0H18V104H27V120H0Z M36 0H54V104H62V120H36Z'
for size in [16,32]:
 # At 16px: two 3px stems, 3px gap, 3px retained baseline. At 32px twice those pixel values.
 d='M2 2H5V11H7V14H2Z M9 2H12V11H14V14H9Z';s=size/16
 write(f'favicon-{size}',f'<g transform="scale({s})"><path fill="{CLAY}" d="{d}"/></g>',size,size)
write('favicon',f'<style>@media(prefers-color-scheme:dark){{path{{fill:{REVERSE}}}}}</style><path fill="{CLAY}" d="M2 2H5V11H7V14H2Z M9 2H12V11H14V14H9Z"/>',16,16)
write('app-icon',f'<rect width="512" height="512" rx="112" fill="{CLAY}"/><path fill="{PAPER}" transform="translate(163 76) scale(3)" d="{mark}"/>',512,512)
# Editorial identity sheet: name first, repeatable color and layout rules second.
b=txt(64,60,'RECALLO / WORDMARK SYSTEM',14)+txt(1050,60,'REVISION 02',14)
b+=wm(105,140,1070)+txt(106,445,'Have the conversation. Keep the context.',31)
b+=txt(64,550,'01 / THE NAME IS THE IDENTITY',14)+txt(64,590,'Seven letters. One retained line.',30)
b+=txt(64,627,'The paired l letters repeat the same cut foot and aligned baseline.',18)
b+=txt(64,657,'Their terracotta rhythm makes the name recognizable without an extra badge.',18)
b+=box(64,705,595,240,NIGHT)+wm(102,776,515,PAPER,REVERSE)
b+=box(681,705,595,240,PEACH)+wm(719,776,515,CLAY,CLAY)
b+=txt(64,1000,'02 / COLOR HAS A JOB',14)
colors=[('Deep ink',INK),('Terracotta',CLAY),('Warm paper',PAPER),('Soft sage',SAGE),('Peach',PEACH),('Night',NIGHT)]
for i,(label,c) in enumerate(colors):
 x=64+i*204;b+=box(x,1040,184,110,c)+txt(x,1180,label,16)+txt(x,1207,c,14)
b+=txt(64,1280,'03 / ONE DRAWING, DIFFERENT CONDITIONS',14)
b+=wm(64,1328,529)+wm(723,1345,280)+wm(1080,1360,140)
b+=txt(64,1500,'Primary / large communication',16)+txt(723,1500,'Navigation / 140px minimum',16)
b+=txt(64,1580,'04 / LETTERING DETAILS',14)
b+=txt(64,1625,'R: open counter, confident diagonal leg. e / c: shared aperture and curve rhythm.',18)
b+=txt(64,1660,'a: double-storey construction for reading clarity. ll: paired cut feet. o: full closed counter.',18)
b+=txt(64,1715,'No stretched type. No detached R badge. No seven-color lettering. No glow or shadow.',18)
write('identity-board',b,1340,1780,PAPER)
# Product-context sheet uses only complete wordmarks at normal placements.
b=txt(64,64,'RECALLO / APPLICATION PLACEMENTS',15)
b+=box(64,110,1212,100,'#FFFFFF')+wm(92,141,146)+txt(690,168,'Product',16)+txt(815,168,'Join a meeting',16)+box(1014,133,230,52,CLAY)+txt(1040,166,'Create a room',18,'#FFFFFF')
b+=box(64,248,1212,650,NIGHT)+wm(94,282,154,PAPER,REVERSE)+txt(950,310,'Launch planning',17,PAPER)
b+=box(94,360,830,410,'#304A42')+txt(145,432,'Launch review',37,PAPER)+txt(145,480,'Timeline / outstanding dependencies',21,PAPER)
b+=box(145,555,718,2,'#76958B')+txt(145,620,'Decision: move the review to Thursday.',25,PAPER)
b+=box(950,360,294,194,'#3D594F')+txt(990,465,'Alex Morgan',23,PAPER)+box(950,576,294,194,'#3D594F')+txt(990,681,'Priya Shah',23,PAPER)
b+=txt(106,845,'Microphone     Camera     Share screen     Chat',20,PAPER)
b+=box(64,940,585,440,'#FFFFFF')+wm(98,975,155)+txt(98,1080,'Welcome back.',31)+txt(98,1122,'Return to your conversations.',18)+box(98,1160,517,57,PAPER)+txt(118,1196,'Email address',17)+box(98,1244,517,53,CLAY)+txt(118,1278,'Sign in',18,'#FFFFFF')
b+=box(681,940,595,440,SAGE)+wm(718,975,155)+txt(718,1080,'Launch planning',31)+txt(718,1130,'DECISION',13)+txt(718,1175,'Move the review to Thursday.',23)+txt(718,1240,'NEXT ACTION',13)+txt(718,1284,'Priya to share the revised draft.',22)
b+=txt(64,1440,'Illustrative placement studies / not captured application screenshots.',16)
write('placements',b,1340,1490,PAPER)
# Share-card export with a deliberate safe area and a complete-name signature.
b=wm(78,70,280)+txt(78,300,'Have the conversation.',57)+txt(78,372,'Keep the context.',57)
b+=box(78,438,1044,2,CLAY)+txt(78,512,'Browser-based meetings / useful context afterward',23)
write('social-banner',b,1200,630,PAPER)
# React geometry derives from the exact same paths as the exports.
component='''import type { SVGProps } from 'react';

/** Full-name identity. Use currentColor for the ink and a theme-aware accent. */
export function RecalloWordmark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-2 -2 533 127" width="142" height="34" role="img" aria-label="Recallo" className={className} {...props}>
'''
for c,x,d in GLYPHS:component+=f'      <path fill={"\"var(--recallo-logo-accent, #B74830)\"" if c=="ll" else "\"currentColor\""} fillRule="evenodd" transform="translate({x} 0)" d="{d}" />\n'
component+='    </svg>\n  );\n}\n'
(ROOT/'src/components/recallo-wordmark.tsx').write_text(component)
for p in OUT.glob('*.svg'):
 if p.stem=='favicon':continue
 subprocess.run(['magick','-background','none',str(p),str(p.with_suffix('.png'))],check=True)
(OUT/'tokens.json').write_text(json.dumps({'name':'Recallo / Paired Line','colors':{'ink':INK,'paper':PAPER,'terracotta':CLAY,'peach':PEACH,'sage':SAGE,'night':NIGHT,'accentOnDark':REVERSE},'wordmark':{'minimumWidth':140,'clearSpace':'18/529 of displayed wordmark width','masterCapHeight':120,'xHeight':85}},indent=2)+'\n')
print('Full-name system, two presentation boards, PNGs and shared React geometry generated.')
