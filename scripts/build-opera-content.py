"""Prepare the gift chapter from the versioned, independently reviewed dossier."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT=Path(__file__).resolve().parents[1]
selection={'room':('OP47','opera-auditorium.jpg'),'duet':('OP08','opera-duet.jpg'),
    'ensemble':('OP01','opera-ensemble.jpg'),'jump':('OP05','opera-jump.jpg'),
    'rhapsody':('OP03','opera-rhapsody.jpg')}
with zipfile.ZipFile(ROOT/'downloads/Informe-Opera-Viena.zip') as archive:
    index=json.loads(archive.read('indice-imagenes.json'))
    by_id={p['id']:p for p in index['images']}
    photos={}
    for key,(id,name) in selection.items():
        photo=by_id[id];data=archive.read(photo['localFile'])
        assert hashlib.sha256(data).hexdigest()==photo['sha256']
        (ROOT/'public/images'/name).write_bytes(data)
        photos[key]={k:photo[k] for k in ['id','title','description','width','height','bytes','sha256','author','license','rightsNote','sourcePage','originalUrl','evidence']}
        photos[key]['src']='/images/'+name
        photos[key]['licenseUrl']=photo.get('licenseUrl')
    reconstruction=json.loads(archive.read('reconstruccion-butacas.json'))
source=json.loads((ROOT/'docs/research/opera/plano-butacas-fuente.json').read_text())
assert source['seatmapVersion']==reconstruction['seatmapVersion']
blocks=[]
for block in source['areas'][0]['blocks']:
    if block['type']!='SEATS':continue
    blocks.append({'id':block['id'],'name':block['name'],'hulls':[
        [[8192-x,8192-y] for x,y in g['points']] for g in block['graphics'] if g.get('hull') and g['type']=='POLYGON']})
seating={'sourcePage':reconstruction['sourcePage'],'sourceVersion':source['seatmapVersion'],
    'sourceSha256':reconstruction['sourceSha256'],'orientation':'Escenario arriba; niveles desplegados como en el mapa de venta.',
    'annotationBounds':reconstruction['annotationBounds'],
    'seats':[[int(s['id'][1:]),s['x'],s['y'],s['blockId']] for s in reconstruction['seats']],
    'blocks':blocks,'selected':[{**s,'x':p['x'],'y':p['y']} for id,s in reconstruction['selectedSeatNumbers'].items() for p in reconstruction['seats'] if p['id']==id]}
assert len(seating['seats'])==1753
content={'prepared':'2026-11-15','reportArchiveSha256':hashlib.sha256((ROOT/'downloads/Informe-Opera-Viena.zip').read_bytes()).hexdigest(),'photos':photos,
    'programmeUrl':'https://www.wiener-staatsoper.at/en/calendar/detail/living-legacies/2027-01-22/',
    'pieces':[
        {'id':'divertimento','name':'Divertimento No. 15','choreographer':'George Balanchine','music':'Wolfgang Amadeus Mozart','year':1956,'photo':'jump','description':'La música se convierte en líneas, encuentros y una ligereza que parece no pesar.'},
        {'id':'golden-hour','name':'Within the Golden Hour','choreographer':'Christopher Wheeldon','music':'Ezio Bosso y Antonio Vivaldi','year':2008,'photo':'duet','description':'Pequeños cuadros de belleza fugaz, inspirados en la luz y los tonos dorados de Klimt.'},
        {'id':'rhapsody','name':'Rhapsody','choreographer':'Frederick Ashton','music':'Sergei Rachmaninov','year':1980,'photo':'rhapsody','description':'Saltos, precisión y lirismo: la brillantez del movimiento al encuentro del piano.'}]}
(ROOT/'src/data/opera-selection.json').write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
(ROOT/'src/data/opera-seating.json').write_text(json.dumps(seating,ensure_ascii=False,separators=(',',':'))+'\n')
module='import data from "./data/opera-selection.json" with { type: "json" };\n\n// Literal paths are also embedded by the standalone exporter.\nconst sources = '+json.dumps({k:'/images/'+v[1] for k,v in selection.items()},indent=2)+';\nexport const operaPhotos=Object.fromEntries(Object.entries(data.photos).map(([key,p])=>[key,{...p,src:sources[key]}]));\nexport const operaProgramme=data.pieces;\nexport const operaProgrammeUrl=data.programmeUrl;\n'
(ROOT/'src/operaContent.js').write_text(module)
print(json.dumps({'photos':len(photos),'bytes':sum(p['bytes'] for p in photos.values()),'seats':len(seating['seats'])}))
