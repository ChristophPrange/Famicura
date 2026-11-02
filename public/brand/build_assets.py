from pathlib import Path
import subprocess
from PIL import Image

ROOT = Path(__file__).parent

DEFS = '''<defs>
  <linearGradient id="novalis-crown" x1="438" y1="40" x2="588" y2="468" gradientUnits="userSpaceOnUse">
    <stop stop-color="#F5900C"/>
    <stop offset=".30" stop-color="#FFA40E"/>
    <stop offset=".68" stop-color="#FF7A05"/>
    <stop offset="1" stop-color="#D53500"/>
  </linearGradient>
  <linearGradient id="novalis-inner-left" x1="115" y1="284" x2="470" y2="825" gradientUnits="userSpaceOnUse">
    <stop stop-color="#CD3600"/>
    <stop offset=".13" stop-color="#FF6D00"/>
    <stop offset=".51" stop-color="#FF9604"/>
    <stop offset="1" stop-color="#F58400"/>
  </linearGradient>
  <linearGradient id="novalis-inner-right" x1="885" y1="284" x2="530" y2="825" gradientUnits="userSpaceOnUse">
    <stop stop-color="#CD3600"/>
    <stop offset=".13" stop-color="#FF6D00"/>
    <stop offset=".51" stop-color="#FF9604"/>
    <stop offset="1" stop-color="#F58400"/>
  </linearGradient>
  <linearGradient id="novalis-outer-left" x1="25" y1="435" x2="420" y2="845" gradientUnits="userSpaceOnUse">
    <stop stop-color="#DC7900"/>
    <stop offset=".23" stop-color="#EE8F00"/>
    <stop offset=".66" stop-color="#DD4D00"/>
    <stop offset="1" stop-color="#B52C00"/>
  </linearGradient>
  <linearGradient id="novalis-outer-right" x1="975" y1="435" x2="580" y2="845" gradientUnits="userSpaceOnUse">
    <stop stop-color="#DC7900"/>
    <stop offset=".23" stop-color="#EE8F00"/>
    <stop offset=".66" stop-color="#DD4D00"/>
    <stop offset="1" stop-color="#B52C00"/>
  </linearGradient>
</defs>'''

CROWN = 'M 500 6 C 419 85 340 181 294 309 C 343 335 381 367 422 409 C 462 450 493 463 535 446 C 578 428 604 382 706 309 C 660 181 581 85 500 6 Z M 580 335 A 80 80 0 1 0 420 335 A 80 80 0 1 0 580 335 Z'
LEFT_INNER = 'M 91 273 C 207 265 336 361 397 520 C 439 630 460 747 477 831 C 368 785 291 688 240 573 C 188 458 151 360 91 279 C 88 275 88 274 91 273 Z'
RIGHT_INNER = 'M 909 273 C 793 265 664 361 603 520 C 561 630 540 747 523 831 C 632 785 709 688 760 573 C 812 458 849 360 909 279 C 912 275 912 274 909 273 Z'
LEFT_OUTER = 'M 5 434 C 51 433 111 455 151 484 C 184 613 266 749 430 838 C 202 855 12 714 5 434 Z'
RIGHT_OUTER = 'M 995 434 C 949 433 889 455 849 484 C 816 613 734 749 570 838 C 798 855 988 714 995 434 Z'

def emblem(mono=False):
    colors = ['currentColor']*5 if mono else ['url(#novalis-crown)','url(#novalis-inner-left)','url(#novalis-inner-right)','url(#novalis-outer-left)','url(#novalis-outer-right)']
    paths = [CROWN, LEFT_INNER, RIGHT_INNER, LEFT_OUTER, RIGHT_OUTER]
    return '\n'.join(f'<path d="{d}" fill="{fill}" fill-rule="evenodd"/>' for d,fill in zip(paths,colors))

def svg(width,height,box,body,defs=DEFS,title='NOVALIS'):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="{box}" role="img" aria-labelledby="novalis-title">
<title id="novalis-title">{title}</title>
{defs}
{body}
</svg>\n'''

symbol = svg(1000,860,'0 0 1000 860',emblem(),title='NOVALIS – helfende Hände und eine Person als Pflanzenemblem')
(ROOT/'novalis-symbol.svg').write_text(symbol)
(ROOT/'novalis-symbol-mono.svg').write_text(svg(1000,860,'0 0 1000 860','<g color="#A94418">'+emblem(True)+'</g>',defs='',title='NOVALIS – einfarbiges Emblem'))

# Bespoke geometric lettering, drawn as paths: no font dependency or raster embedding.
wordpaths = '''<g fill="none" stroke="#735339" stroke-width="9" stroke-linejoin="miter" stroke-linecap="butt">
<path d="M 350 230 V 93 M 350 93 L 447 230 M 447 230 V 93"/>
<path d="M 589 161.5 C 589 119.5 565 93 531 93 C 497 93 473 119.5 473 161.5 C 473 203.5 497 230 531 230 C 565 230 589 203.5 589 161.5 Z"/>
<path d="M 617 93 L 672 230 L 727 93"/>
<path d="M 755 230 L 811 93 L 867 230 M 774 187 H 848"/>
<path d="M 905 93 V 230 H 1000"/>
<path d="M 1042 93 V 230"/>
<path d="M 1186 109 C 1165 93 1139 88 1117 98 C 1095 108 1089 129 1103 145 C 1119 162 1154 164 1175 180 C 1196 197 1184 224 1161 230 C 1135 237 1109 228 1092 214"/>
</g>'''
wordmark=svg(1250,310,'0 0 1250 310','<g transform="translate(8 37) scale(.28)">'+emblem()+'</g>\n'+wordpaths,title='NOVALIS')
(ROOT/'novalis-wordmark.svg').write_text(wordmark)

# Platform icon is deliberately opaque; exported emblem and wordmark stay transparent.
icon=svg(512,512,'0 0 512 512','<rect width="512" height="512" rx="108" fill="#F7F0E6"/><g transform="translate(58 83) scale(.396)">'+emblem()+'</g>',title='NOVALIS App-Icon')
(ROOT/'novalis-app-icon.svg').write_text(icon)
for size,name in [(192,'icon-192.png'),(512,'icon-512.png'),(180,'apple-touch-icon.png')]:
    subprocess.run(['inkscape',str(ROOT/'novalis-app-icon.svg'),'--export-type=png',f'--export-filename={ROOT/name}',f'--export-width={size}',f'--export-height={size}'],check=True,capture_output=True)
subprocess.run(['inkscape',str(ROOT/'novalis-symbol.svg'),'--export-type=png',f'--export-filename={ROOT/"novalis-symbol-preview.png"}','--export-width=1000'],check=True,capture_output=True)
subprocess.run(['inkscape',str(ROOT/'novalis-wordmark.svg'),'--export-type=png',f'--export-filename={ROOT/"novalis-wordmark-preview.png"}','--export-width=1500'],check=True,capture_output=True)

im=Image.open(ROOT/'novalis-symbol-preview.png').convert('RGBA')
assert im.getpixel((500,335))[3] == 0, 'Crown circle must be transparent'
assert im.getpixel((0,0))[3] == 0, 'Logo background must be transparent'
for name in ['novalis-symbol.svg','novalis-wordmark.svg','novalis-symbol-mono.svg']:
    text=(ROOT/name).read_text()
    assert '<image' not in text and 'base64' not in text

(ROOT/'ASSETS.md').write_text('''# NOVALIS Markenassets

Das Emblem ist eine manuell gezeichnete Vektorrekonstruktion der beiden bereitgestellten PNG-Referenzen. Alle fünf Blätter sowie die zentrale runde Aussparung sind SVG-Pfade; Logo und Wortmarke besitzen einen transparenten Hintergrund. Die Aussparung wird über eine echte Even-odd-Pfadfüllung erzeugt. Es sind keine Rasterbilder eingebettet.

Die geometrische NOVALIS-Wortmarke ist eigens als Pfade gezeichnet und nähert die mitgelieferte Wortmarke optisch an. Sie benötigt keine Schriftdatei und behauptet keine Identität mit einer unbekannten Originalschrift.

`novalis-app-icon.svg`, `icon-192.png`, `icon-512.png` und `apple-touch-icon.png` besitzen als plattformspezifische Icons bewusst einen beigen Hintergrund. Die transparenten SVG-Masterdateien werden davon nicht verändert.

Die Bezeichnung NOVALIS stammt aus der Nutzerreferenz; eine markenrechtliche Verfügbarkeit wird hierdurch nicht bestätigt.
''')
print('Generated and alpha-validated',len(list(ROOT.iterdir())),'assets/files')
