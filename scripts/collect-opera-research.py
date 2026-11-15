"""Collect public source photographs for the independent opera research report.

Uses requests, BeautifulSoup and Pillow in a temporary research virtualenv.
No website application files are written. Received image bytes are preserved.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import concurrent.futures
import hashlib
import io
import json
import re
import shutil

import requests
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = Path('/workspace/artifacts/opera-research')
OUT = WORK / 'report'
ASSETS = OUT / 'fotos'
ASSETS.mkdir(parents=True, exist_ok=True)
BASE = 'https://www.wiener-staatsoper.at'


def original(src):
    return BASE + '/files/' + src.split('/files/', 1)[1]


def images(page):
    soup = BeautifulSoup((WORK / (page + '.html')).read_text(), 'html.parser')
    return list(dict.fromkeys(original(i.get('data-src') or i['src'])
        for i in soup.select('main img[src]') if '/files/' in i['src'] and '.jpg' in i['src'].lower()))


inventory = []


def add(url, category, title, description, source, author=None, license=None, **extra):
    if any(p['originalUrl'] == url for p in inventory):
        return
    inventory.append(dict(id=f'OP{len(inventory)+1:02}', category=category,
        title=title, description=description, sourcePage=source, originalUrl=url,
        author=author or 'Autor no identificado en la ficha consultada',
        license=license or 'Sin licencia abierta declarada; referencia documental',
        rightsNote='La descarga pública no acredita permiso de reutilización. Revisar las condiciones antes de publicar.'
            if not license else 'Respetar atribución y condiciones de la licencia indicada.', **extra))


for url in images('living'):
    if '/Living_Legacies/' not in url:
        continue
    name = unquote(Path(urlsplit(url).path).stem)
    piece = 'Divertimento No. 15' if 'Balanchine' in name else 'Within the Golden Hour' if 'Wheeldon' in name else 'Rhapsody'
    add(url, 'ballet', piece, 'Fotografía oficial de la producción vienesa. Los intérpretes de esta imagen no confirman el reparto del 22/01/2027.',
        BASE+'/en/calendar/detail/living-legacies/2027-01-22/', 'Ashley Taylor', piece=piece,
        evidence='production-official', creditEvidence='Nombre del fotógrafo en el archivo oficial')

rooms = {
    'Sitzplaetze': ('auditorio', 'Auditorio', 4),
    'Loge': ('palcos', 'Interior de palco', 3),
    'Mahler': ('interiores', 'Gustav Mahler Saal', 3),
    'Marmorsaal': ('interiores', 'Marmorsaal', 3),
    'Schwindfoyer': ('interiores', 'Schwindfoyer', 3),
    'Schwindloggia': ('interiores', 'Schwindloggia', 2),
    'Teesalon': ('interiores', 'Teesalon', 3),
}
for folder, (category, title, limit) in rooms.items():
    urls = [u for u in images('building') if '/'+folder+'/' in u][:limit]
    for n, url in enumerate(urls, 1):
        author = 'Andreas Jakwerth' if 'Jakwerth' in url else None
        add(url, category, title + f' · {n}',
            'Publicado en la sección oficial de este espacio. Referencia de arquitectura e interior; no corresponde a un asiento concreto.',
            BASE+'/en/building-plan/', author, evidence='room-official', room=title)

guided = images('guided')
for url in guided:
    if any(s in url for s in ['guided-tours-4.jpg', 'guided-tours-29.jpg', 'guided-tours-25.jpg',
        '2024-10-11_interior-8.jpg', '2024-10-11_interior-20.jpg',
        'neu-Architektur_150Jahre_Buch_2018_123536.jpg']):
        title = 'Acceso «Zur Mittelloge»' if 'tours-4.' in url else 'Arquitectura y recorrido de la casa'
        add(url, 'interiores', title, 'Fotografía de las visitas oficiales. El espacio y el encuadre se describen tras la revisión visual.',
            BASE+'/en/guided-tours/', 'Michael Pöhn' if 'WSO_Poehn' in url else None, evidence='tour-official')
    if '/Backstagefuehrung/' in url and any(s in url for s in ['000208','000098','000172']):
        add(url, 'backstage', 'Detrás del escenario',
            'Referencia del recorrido técnico. No forma parte del acceso normal con una entrada de ballet.',
            BASE+'/en/guided-tours/', evidence='backstage-official')

legacy = json.loads((ROOT/'src/data/vienna-places.json').read_text())
photo = next(p['photo'] for p in legacy['places'] if p['id']=='staatsoper')
add(photo['originalUrl'].split('?')[0], 'exteriores', 'Fachada frontal desde el Ring',
    photo['caption'], photo['commonsPage'], photo['artist'], photo['license'],
    licenseUrl=photo['licenseUrl'], evidence='commons', reuseFile=str(ROOT/'public/images/vienna-staatsoper.jpg'))
commons = json.loads((WORK/'commons.json').read_text())
for p in commons['query']['pages'].values():
    if not any(s in p['title'] for s in ['Morgengrauen','facade.jpg','Kärntnerstraße 3.jpg']):
        continue
    info = p['imageinfo'][0]; meta = info['extmetadata']
    clean = lambda k: re.sub('<[^>]+>', '', meta.get(k,{}).get('value',''))
    add(info['url'].split('?')[0], 'exteriores',
        'La Staatsoper al amanecer' if 'Morgengrauen' in p['title'] else 'Detalle de la fachada' if 'facade' in p['title'] else 'Perspectiva desde Kärntnerstraße',
        clean('ImageDescription'), info['descriptionurl'], clean('Artist'), clean('LicenseShortName'),
        licenseUrl=clean('LicenseUrl'), evidence='commons')

for seat in json.loads((WORK/'target-seats.json').read_text()):
    add(seat['view']['url'], 'vistas', 'Mittelloge · fila 3 · asiento '+seat['seatNumber'],
        'Vista oficial vinculada individualmente a este asiento por el simulador. Sala vacía y escenografía de referencia: no es una foto de Living Legacies ni garantiza ausencia de espectadores delante.',
        'https://tickets.wiener-staatsoper.at/webshop/webticket/seatmap?eventId=16677',
        'Wiener Staatsoper / Eventim; fotógrafo no indicado', evidence='seat-exact-official',
        seatId=seat['id'], row=seat['row'], seatNumber=seat['seatNumber'], block=seat['block'],
        viewIndex=seat['viewIndex'], priceCategory=3)


def fetch(p):
    ext = Path(urlsplit(p['originalUrl']).path).suffix.lower()
    name = re.sub(r'[^a-z0-9]+','-',p['title'].lower()).strip('-')
    dest = ASSETS/(p['id']+'-'+name+ext)
    if not dest.exists():
        if p.get('reuseFile'):
            shutil.copyfile(p['reuseFile'],dest)
        else:
            response = requests.get(p['originalUrl'],timeout=60,
                headers={'User-Agent':'Sofi28-Research/1.0 (private travel research)'})
            response.raise_for_status(); dest.write_bytes(response.content)
    data = dest.read_bytes()
    im = Image.open(io.BytesIO(data)); im.load()
    p.update(localFile='fotos/'+dest.name, width=im.width, height=im.height,
        bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), mime=Image.MIME[im.format],
        orientation='horizontal' if im.width>im.height else 'vertical' if im.height>im.width else 'cuadrada')
    p.pop('reuseFile',None)
    return p


if __name__=='__main__':
    good=[];bad=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        futures={pool.submit(fetch,p):p for p in inventory}
        for f in concurrent.futures.as_completed(futures):
            try: good.append(f.result())
            except Exception as e: bad.append({'id':futures[f]['id'],'url':futures[f]['originalUrl'],'error':str(e)})
    good.sort(key=lambda p:p['id'])
    (WORK/'photos.json').write_text(json.dumps(good,ensure_ascii=False,indent=2)+'\n')
    (WORK/'photo-errors.json').write_text(json.dumps(bad,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'photos':len(good),'bytes':sum(p['bytes'] for p in good),'errors':bad},ensure_ascii=False))
