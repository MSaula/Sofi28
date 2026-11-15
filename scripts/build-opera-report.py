"""Build the separate HTML dossier, original photo index and official plans.

Preparation: source-page snapshots and collect-opera-research.py, see research README.
The output lives under artifacts and is packaged separately from Viena.zip.
"""
from pathlib import Path
import collections
import csv
import hashlib
import html
import json
import re
import shutil
import xml.etree.ElementTree as ET

import fitz

ROOT = Path(__file__).resolve().parents[1]
WORK = Path('/workspace/artifacts/opera-research')
OUT = WORK/'report'
DOCS = ROOT/'docs/research/opera'
PLANS = OUT/'planos'
PLANS.mkdir(parents=True,exist_ok=True)
BASE='https://www.wiener-staatsoper.at'
esc=lambda value:html.escape(str(value),quote=True)

descriptions = {
 'OP01':('Rhapsody · escena de conjunto','Composición horizontal: bailarina en el centro, conjunto al fondo y arquitectura escénica. Buen plano general para presentar la pieza.'),
 'OP02':('Rhapsody · salto y conjunto','Salto de António Casalinho ante el conjunto, según el nombre del archivo. Acción, altura y líneas horizontales.'),
 'OP03':('Rhapsody · pareja, variación de encuadre','Pareja en escena, con tutú claro y vestuario masculino de tonos dorados. Cassandra Trenary y António Casalinho según el archivo.'),
 'OP04':('Rhapsody · elevación','Una elevación de la pareja sobre el fondo azul. Cassandra Trenary y António Casalinho según el archivo. Es un archivo distinto de OP03, no una miniatura del mismo recurso.'),
 'OP05':('Divertimento No. 15 · salto en paralelo','Dos bailarines extienden las piernas en un salto simultáneo sobre fondo azul. Davide Dato y T. Afshar según el nombre oficial del archivo.'),
 'OP06':('Divertimento No. 15 · pareja','Líneas de la pareja y vestuario amarillo sobre fondo azul. N. Butchko y Masayu Kimoto según el nombre del archivo.'),
 'OP07':('Divertimento No. 15 · solista','Figura de Olga Esina en tutú amarillo, aislada en el espacio azul. El nombre de la intérprete procede del archivo oficial.'),
 'OP08':('Within the Golden Hour · dúo','Pareja enlazada con una pierna elevada y fondo cálido oscuro. E. Bottaro y Masayu Kimoto según el archivo.'),
 'OP09':('Within the Golden Hour · conjunto','Composición panorámica de figuras enlazadas y arcos corporales bajo un gran vacío escénico. Imagen especialmente útil para una presentación amplia.'),
 'OP10':('Within the Golden Hour · proximidad','Dúo de M. Young y A. Frola según el archivo: torsos próximos y gesto enlazado sobre azul intenso.'),
 'OP11':('Within the Golden Hour · contrapeso','S. Liz y V. Caixeta según el archivo. La pareja dibuja un contrapeso y una elevación sobre un fondo de luces cálidas y frías.'),
 'OP12':('Auditorio · frente y herradura','Vista amplia de la sala vacía hacia los niveles de palcos: rojo, dorados, curvas y simetría. Referencia de la organización del auditorio; no vista desde una de nuestras plazas.'),
 'OP13':('Auditorio · repetición de butacas','Ritmo de butacas rojas y estructura de los respaldos. Es un detalle del parterre, no una fotografía del palco comprado.'),
 'OP14':('Auditorio · detalle de tapicería','Butacas vistas en proximidad, con profundidad de campo reducida. El desenfoque pertenece a la fotografía original.'),
 'OP15':('Auditorio · butacas y niveles','Relación entre la escala cercana de los asientos y la altura de los palcos. No se identifica con Mittelloge.'),
 'OP16':('Palcos · envolvente de la sala','Balaustradas, dorados y cortinajes vistos de lado. Imagen publicada en la sección genérica Loge del plano oficial.'),
 'OP17':('Palcos · antesala y espejo','Acceso en tonos rojos, espejo oval y butacas al fondo. Documenta el tipo de antesala de los palcos ordinarios.'),
 'OP18':('Palcos · butacas y apertura a la sala','Un palco ordinario vacío visto desde su acceso. No está identificado como la Mittelloge de 36 plazas.'),
 'OP19':('Gustav Mahler Saal · perspectiva larga','Sala luminosa, lámpara central y eje longitudinal. Referencia espacial de una de las zonas de descanso.'),
 'OP20':('Gustav Mahler Saal · mesas','Detalle del servicio de mesas junto a las ventanas. La disposición de restauración corresponde a la foto, no a una reserva nuestra.'),
 'OP21':('Gustav Mahler Saal · luz lateral','La ventana lateral y las superficies claras contrastan con la sala roja del auditorio.'),
 'OP22':('Marmorsaal · perspectiva','Vista amplia de la sala con ventanas, lámparas y mesas. Plano general de un espacio de descanso.'),
 'OP23':('Marmorsaal · mesas y materiales','Vista del servicio de mesas y de las paredes del salón, con superficies claras y reflejos.'),
 'OP24':('Marmorsaal · asiento rojo','Un asiento rojo ondulado y las mesas frente a la ornamentación del salón. Detalle de contraste cromático.'),
 'OP25':('Schwindfoyer · eje longitudinal','Bóvedas pintadas, arañas y dorados. La perspectiva larga permite leer el conjunto del foyer histórico.'),
 'OP26':('Schwindfoyer · dirección opuesta','Otra perspectiva del mismo salón; útil para entender la relación entre la barra central y las puertas.'),
 'OP27':('Schwindfoyer · puertas y pintura','Vista frontal de la ornamentación y las puertas del Schwindfoyer. Una lectura más próxima de los materiales.'),
 'OP28':('Schwindloggia · arcadas','Secuencia de arcos y pavimento geométrico. No se promete el mismo estado de apertura en enero.'),
 'OP29':('Schwindloggia · detalle arquitectónico','Detalle vertical de una puerta, pintura y decoración bajo las bóvedas.'),
 'OP30':('Teesalon · vista longitudinal','El antiguo salón imperial en una vista axial. Espacio especial cuya entrada no se deduce de la compra del ballet.'),
 'OP31':('Teesalon · entrada y alfombra','Detalle de puertas, alfombra roja y ornamentación. Misma sala, otro encuadre.'),
 'OP32':('Teesalon · puerta ornamentada','Encuadre frontal de una puerta y decoración del salón. Referencia de textura y simetría.'),
 'OP33':('Visita guiada · relación con la sala','Un participante y la arquitectura del auditorio. Fotografía de una visita: no documenta un asiento concreto.'),
 'OP34':('Backstage · maquinaria y grupo','Recorrido guiado junto a una gran estructura escénica. Zona técnica, fuera de la visita ordinaria con entrada de ballet.'),
 'OP35':('Mittelloge · rótulo de acceso','La inscripción «Zur Mittelloge» identifica el acceso. Hay visitantes en el encuadre. No muestra por sí sola el interior completo del palco central.'),
 'OP36':('Backstage · circulación técnica','Grupo recorriendo un corredor de servicio. Documento del backstage y de su escala de trabajo, no una zona incluida en nuestras plazas.'),
 'OP37':('Teesalon · versión de la página de visitas','Otra fotografía axial del salón, publicada en el apartado de visitas privadas. No es una acreditación de acceso a ese espacio.'),
 'OP38':('Visita guiada · circulación de invitados','Un grupo transita por un espacio claro de la casa. La página no identifica el punto exacto de este encuadre; se mantiene como referencia contextual.'),
 'OP39':('Escalera histórica · pintura y escultura','Detalle de la decoración monumental, pintura mural y escultura en la zona de escalera. No se presenta como un plano general de toda la escalera.'),
 'OP40':('Auditorio · niveles de palcos','Encuadre elevado de los palcos y las balaustradas. La foto no está vinculada a los asientos 23 o 24.'),
 'OP41':('Fachada frontal desde el Ring','Vista frontal de la Wiener Staatsoper. Imagen local ya documentada en el primer estudio de Viena, conservada sin cambios.'),
 'OP42':('La Staatsoper al amanecer','Perspectiva del exterior al amanecer, con las vías y el Ring en primer plano. Estado de luz y estación propios de la toma, no previsión para enero.'),
 'OP43':('Fachada · arcadas y ornamentación','Detalle de la fachada principal y su sucesión de arcos. Imagen de arquitectura exterior bajo licencia CC0.'),
 'OP44':('Perspectiva desde Kärntnerstraße','Vista diagonal del edificio en relación con su espacio urbano. Imagen diurna de contexto, con transeúntes y circulación.'),
}

photos=json.loads((WORK/'photos.json').read_text())
for p in photos:
    p['title'],p['description']=descriptions[p['id']]
    if p['category']=='ballet':
        p['description']+=' Fotografía oficial anterior a la función del 22/01/2027; no confirma su reparto.'
    p['status']='downloaded'
    p['qualityNote']='Lado largo de '+str(max(p['width'],p['height']))+' px; archivo recibido sin retoque ni recompresión.'
    p['reviewedVisually']=True
    p['sha256Verified']=True

seats=json.loads((WORK/'target-seats.json').read_text())
assert len(seats)==2 and {(s['row'],s['seatNumber'],s['id']) for s in seats}=={('3','23','s500'),('3','24','s501')}
for n,s in enumerate(seats,45):
    assert s['priceCategoryId']=='p3'
    photos.append(dict(id=f'OP{n}',category='vistas',title='Mittelloge · fila 3 · asiento '+s['seatNumber'],
        description='Vista enlazada individualmente por el simulador oficial. No descargada: la conexión al CDN devuelve 503 en este entorno. No se atribuye a esta imagen una resolución que no se ha medido.',
        status='linked-download-unavailable',localFile=None,width=None,height=None,bytes=None,sha256=None,
        author='Wiener Staatsoper / Eventim; fotógrafo no indicado',license='Sin licencia abierta declarada',
        rightsNote='Vínculo verificado; imagen no examinada. Condiciones de reutilización por confirmar.',
        originalUrl=s['view']['url'],sourcePage='https://tickets.wiener-staatsoper.at/webshop/webticket/seatmap?eventId=16677',
        evidence='seat-exact-official',seatId=s['id'],row=s['row'],seatNumber=s['seatNumber'],viewIndex=s['viewIndex'],
        reviewedVisually=False,sha256Verified=False))
assert len(photos)==46 and sum(bool(p['localFile']) for p in photos)==44

# Preserve the original seven SVG plans, removing only active handlers.
ET.register_namespace('','http://www.w3.org/2000/svg')
ET.register_namespace('xlink','http://www.w3.org/1999/xlink')
raw=(WORK/'building.html').read_text()
svgs=[s for s in re.findall(r'<svg\b.*?</svg>',raw,re.S) if '0 0 1242 716.95' in s]
assert len(svgs)==7
for n,svg in enumerate(svgs):
    element=ET.fromstring(svg)
    for parent in element.iter():
        for child in list(parent):
            if child.tag.split('}')[-1] in ['script','foreignObject']:parent.remove(child)
        for key in list(parent.attrib):
            if key.lower().startswith('on'):del parent.attrib[key]
    element.set('width','1242');element.set('height','716.95')
    ET.ElementTree(element).write(PLANS/f'planta-{n}.svg',encoding='utf-8',xml_declaration=True)

# Seat positions are measured directly from the original season PDF paths.
pdf=fitz.open(WORK/'seating-pdf.pdf');page=pdf[0]
row={}
for shape in page.get_drawings():
    r=shape['rect'];fill=shape.get('fill')
    if 480<r.x0<590 and 720<r.y0<738 and 9<r.width<11 and fill and abs(fill[1]-.684993)<.0001:
        row[round((r.x0+r.x1)/2,3)]=round((r.y0+r.y1)/2,3)
assert len(row)==9,row
positions={str(28-n):{'x':x,'y':row[x]} for n,x in enumerate(sorted(row))}
assert abs(positions['23']['x']-550.365)<.01 and abs(positions['24']['x']-539.282)<.01
svg=page.get_svg_image(text_as_path=True)
svg=re.sub(r'(<svg\b[^>]*>)',r'\1<rect x="0" y="0" width="1080" height="1350" fill="white"/>',svg,count=1)
annotation='<g id="asientos-23-24" aria-label="Fila 3, asientos 23 y 24">'
for number in ['23','24']:
    p=positions[number]
    annotation+=f'<circle cx="{p["x"]}" cy="{p["y"]}" r="5.9" fill="none" stroke="#075fae" stroke-width="1.4"><title>Mittelloge, fila 3, asiento {number}</title></circle>'
annotation+='</g>'
svg=svg.replace('</svg>',annotation+'</svg>')
(PLANS/'sala-marcada.svg').write_text(svg)
focus=re.sub(r'<svg\b[^>]*>', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="840" viewBox="480 690 120 84">',svg,count=1)
(PLANS/'mittelloge-marcada.svg').write_text(focus)
shutil.copyfile(WORK/'seating-pdf.pdf',PLANS/'Saalplan-2026_27-DE.pdf')

block=json.loads((WORK/'mittelloge-official.json').read_text())['info']
layout=[{'id':key,'row':s['row'],'seatNumber':s['seatNumber'],'priceCategory':s['priceCategoryId'],'viewIndex':s.get('viewIndex')}
    for key,s in block['seatInfos'].items() if re.fullmatch(r's\d+',key)]
assert len(layout)==36
evidence={'date':'2026-11-15','sourcePage':'https://tickets.wiener-staatsoper.at/webshop/webticket/seatmap?eventId=16677',
    'eventDate':'2027-01-22','block':block['b_name'],'blockId':block['b_id'],'sector':block['sector'],
    'blockSeatCount':len(layout),'rows':dict(collections.Counter(s['row'] for s in layout)),
    'selectedSeats':seats,'publicBlockLayout':layout,'pdfRow3Circles':positions,
    'pdfSource':BASE+'/files/Kalender-Tickets/Ticketinfos/Saalplan-2026_27-DE.pdf',
    'pdfSha256':hashlib.sha256((WORK/'seating-pdf.pdf').read_bytes()).hexdigest(),
    'viewDownloadStatus':'Connection to static.eventim.com returns HTTP 503 upstream remote reset; images not downloaded or visually verified.',
    'method':'Read-only public block metadata from the official shop; no purchase, seat reservation or cart submission.'}
(OUT/'evidencia-asientos.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')

sources=[
 ('S1','Producción y función: Living Legacies, 22/01/2027',BASE+'/en/calendar/detail/living-legacies/2027-01-22/','living.html','200','Programa, créditos, duraciones, contexto y galería oficial.'),
 ('S2','Plano interactivo del edificio',BASE+'/en/building-plan/','building.html','200','Siete niveles, espacios, servicios y fotografías por sala.'),
 ('S3','Visitas guiadas',BASE+'/en/guided-tours/','guided.html','200','Recorridos, acceso a espacios especiales y fotografía de acceso a Mittelloge.'),
 ('S4','Historia del edificio',BASE+'/en/history/','history.html','200','Arquitectos, inauguración, nazismo, guerra y reconstrucción.'),
 ('S5','Información práctica',BASE+'/en/practical-info/','practical-real.html','200','Puntualidad, guardarropa, vestimenta y fotografía.'),
 ('S6','Wiener Staatsballett',BASE+'/en/staatsballett/about-us/','about-ballet.html','200','Compañía, sedes y dirección de Alessandra Ferri.'),
 ('S7','Plano oficial de asientos 2026/27',BASE+'/files/Kalender-Tickets/Ticketinfos/Saalplan-2026_27-DE.pdf','seating-pdf.pdf','200','Plano real, numeración y leyenda de categorías.'),
 ('S8','Tienda oficial: función del 22 de enero','https://tickets.wiener-staatsoper.at/webshop/webticket/seatmap?eventId=16677','mittelloge-official.json','200','Datos públicos de Mittelloge y vínculo individual de las imágenes APNR500/APNR501.'),
 ('S9','Información sobre entradas',BASE+'/en/ticket-info/','info.html','200','Leyenda y enlace al PDF de temporada.'),
 ('S10','Índice de fotografías exteriores en Commons','https://commons.wikimedia.org/','commons.json','200','Créditos y licencias por fotografía; las páginas de archivo se enlazan individualmente.'),
 ('S11','Programa digital externo','https://issuu.com/wienerstaatsoper/docs/programme_booklet_living_legacies_','programme.html','403','Enlazado por la Ópera, pero no leído en este entorno.'),
]
source_data=[]
for id,title,url,file,status,note in sources:
    source_data.append(dict(id=id,title=title,url=url,status=status,note=note,consulted='2026-11-15',sha256=hashlib.sha256((WORK/file).read_bytes()).hexdigest()))
catalog={'date':'2026-11-15','timezone':'Europe/Madrid','localPhotos':44,'linkedUnavailableViews':2,
    'mainWebsiteModified':False,'sources':source_data,'images':photos,
    'plans':{'buildingSvg':7,'officialPdf':'planos/Saalplan-2026_27-DE.pdf','annotatedSeatPlans':['planos/sala-marcada.svg','planos/mittelloge-marcada.svg']}}
(OUT/'indice-imagenes.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
(OUT/'fuentes.json').write_text(json.dumps(source_data,ensure_ascii=False,indent=2)+'\n')
fields=['id','category','title','status','localFile','width','height','bytes','orientation','author','license','licenseUrl','sourcePage','originalUrl','sha256','description','evidence','seatId','row','seatNumber','reviewedVisually']
with (OUT/'indice-imagenes.csv').open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(photos)
for name in ['indice-imagenes.json','evidencia-asientos.json','fuentes.json']:
    shutil.copyfile(OUT/name,DOCS/name)

by_id={p['id']:p for p in photos}
labels={'ballet':'Living Legacies','vistas':'Vistas de asientos','palcos':'Palcos','auditorio':'Auditorio','interiores':'Salones y acceso','exteriores':'Exteriores','backstage':'Backstage'}
def image(id):
    p=by_id[id]
    priority='loading="eager" fetchpriority="high"' if id=='OP01' else 'loading="lazy"'
    return f'<img src="{esc(p["localFile"])}" alt="{esc(p["description"])}" width="{p["width"]}" height="{p["height"]}" {priority} decoding="async">'
def figure(id):
    p=by_id[id]
    return f'<figure><button class="image-button" data-photo="{id}" aria-label="Ampliar {esc(p["title"])}">{image(id)}</button><figcaption>{id} · {esc(p["title"])}</figcaption></figure>'
cards=[]
for p in photos:
    id=p['id'];local=bool(p['localFile'])
    visual=f'<button class="image-button" data-photo="{id}" aria-label="Ampliar {esc(p["title"])}">{image(id)}</button>' if local else '<div class="pending-visual"><strong>23 + 24</strong><span>Vínculo oficial verificado.<br>Descarga pendiente · CDN 503.</span></div>'
    meta=f'{p["width"]} × {p["height"]} px · {p["orientation"]}' if local else 'Sin archivo local · resolución no comprobada'
    cards.append(f'<article class="photo-card" data-id="{id}" data-category="{p["category"]}">{visual}<div class="photo-tag">{id} / {esc(labels[p["category"]])}</div><h3>{esc(p["title"])}</h3><p>{esc(p["description"])}</p><div class="photo-meta">{esc(meta)}<br>{esc(p["author"])} · {esc(p["license"])}</div><a class="photo-source" href="{esc(p["sourcePage"] if local else p["originalUrl"])}" target="_blank" rel="noopener">{"Fuente" if local else "Abrir vista oficial"} ↗</a></article>')
seat_links=[]
for p in photos[-2:]:
    seat_links.append(f'<article><span class="status-label">Vínculo exacto · archivo pendiente</span><h3>{esc(p["title"])}</h3><p>El catálogo oficial relaciona {esc(p["seatId"])} con la fotografía {esc("APNR"+p["seatId"][1:])}. La vista está identificada, pero no se ha descargado ni examinado. No se garantiza que el enlace funcione desde todas las redes.</p><a href="{esc(p["originalUrl"])}" target="_blank" rel="noopener">Abrir la vista en el CDN oficial ↗</a></article>')
floors=['Planta baja','Palcos de parterre','Primer nivel','Segundo nivel','Balcón','Galería','Galería superior']
tokens={'CSS':(DOCS/'informe.css').read_text(),'JS':(DOCS/'informe.js').read_text(),'PHOTO_COUNT':'44',
    'PHOTO_DATA':json.dumps(photos,ensure_ascii=False).replace('<','\\u003c'),
    'ROOM_TRIPTYCH':''.join(figure(id) for id in ['OP25','OP19','OP12']),
    'BOX_PHOTOS':''.join(figure(id) for id in ['OP16','OP17','OP18','OP35']),
    'PHOTO_CARDS':'\n'.join(cards),'SEAT_LINKS':'\n'.join(seat_links),
    'FILTER_BUTTONS':'<button data-filter="all" aria-pressed="true">Todo · 46</button>'+''.join(f'<button data-filter="{k}" aria-pressed="false">{esc(v)} · {sum(p["category"]==k for p in photos)}</button>' for k,v in labels.items()),
    'FLOOR_BUTTONS':''.join(f'<button data-floor="{n}" aria-pressed="{str(n==0).lower()}">{n+1:02} / {esc(name)}</button>' for n,name in enumerate(floors)),
    'SOURCES':'<ol class="sources">'+''.join(f'<li><strong>[{s["id"]}] {esc(s["title"])}</strong><a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["url"])}</a><small>Consulta {s["consulted"]} · HTTP {s["status"]} · {esc(s["note"])}</small></li>' for s in source_data)+'</ol>'}
for id in ['OP01','OP05','OP09','OP02']:tokens['PHOTO_'+id]=image(id)
template=(DOCS/'informe-base.html').read_text()
for key,value in tokens.items():template=template.replace('{{'+key+'}}',value)
assert not re.search(r'{{\w+}}',template)
# SVG icons remain clear with the limited fonts available in the QA browser.
icon=lambda path: '<svg class="inline-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="'+path+'"/></svg>'
for character,path in [('↗','M3 9 9 3M3 3h6v6'),('↓','M6 1v8M3 6l3 3 3-3M2 11h8'),('←','M10 6H2m4-4L2 6l4 4'),('→','M2 6h8M6 2l4 4-4 4')]:
    template=template.replace(character,icon(path))
(OUT/'Informe-Opera-Viena.html').write_text(template)
(OUT/'LEEME.txt').write_text('''Wiener Staatsoper · Living Legacies — Informe de investigación

Descomprime toda la carpeta y abre Informe-Opera-Viena.html en un navegador.
No muevas el HTML fuera de su carpeta: utiliza fotos/ y planos/.
El informe, las 44 fotos descargadas, los planos, filtros y ampliaciones funcionan offline.
Los enlaces a fuentes y a las dos vistas pendientes requieren Internet.

Incluye 11 imágenes oficiales de la producción y material arquitectónico real.
Las vistas de fila 3, 23 y 24 están identificadas individualmente, pero su CDN
devuelve 503 en este entorno: no se incluyen como fotografías descargadas.
Las imágenes genéricas de palcos no se presentan como el interior exacto de Mittelloge.
El reparto de bailarines para el 22/01/2027 no figura en la ficha consultada.

Cada archivo fotográfico recibido conserva sus bytes; los derechos se indican en el índice.
La página del regalo y Viena.zip no se han modificado. Esta es una investigación separada.
''')
print(json.dumps({'photos':44,'linkedViews':2,'photoBytes':sum(p.get('bytes') or 0 for p in photos),'plans':10,'htmlBytes':len(template.encode()),'output':str(OUT)},ensure_ascii=False))
