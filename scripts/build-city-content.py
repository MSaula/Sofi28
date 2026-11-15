"""Prepare the editorial city selection from the two versioned research indexes.

Existing landmark photographs are reused. New photographs are recovered from
the Volume II archive without resizing or recompressing the received files.
"""
from pathlib import Path
import base64,hashlib,json,re,zipfile

ROOT=Path(__file__).resolve().parents[1]
LANDMARKS=[
 ('belvedere','Belvedere Superior','Un palacio para la primera mirada. Fachadas barrocas, jardines y una Viena que impresiona.'),
 ('hofburg','Hofburg','Plazas inmensas y fachadas imperiales. Caminar un poco más despacio por Heldenplatz.'),
 ('karlskirche','Karlskirche','Una cúpula, dos columnas y una silueta que se queda contigo. La Viena barroca, al sur del centro.'),
 ('stephansdom','Stephansdom','El corazón del casco antiguo. Rodear la catedral y encontrar una perspectiva distinta en cada esquina.'),
 ('prunksaal','Prunksaal','Libros, madera y una bóveda que obliga a levantar la mirada. La gran sala de la Biblioteca Nacional.'),
 ('staatsoper','Wiener Staatsoper','Nuestra noche especial empieza aquí. Antes del ballet, una de las grandes fachadas del Ring.'),
 ('albertina','Albertina','Arte, una terraza y otra mirada al centro. Un lugar para detenerse entre la Ópera y el Hofburg.'),
 ('kunsthistorisches','Kunsthistorisches Museum','Una escalinata monumental y salas para perder la noción del tiempo. También hay ciudad por descubrir a cubierto.'),
 ('museumsquartier','MuseumsQuartier','Patios, museos y una Viena más contemporánea. El punto de partida para entrar en las calles de Neubau.'),
 ('volksgarten','Volksgarten','Un paseo entre el Hofburg y el Ring. En enero, los jardines tendrán otro paisaje y el mismo aire de pausa.'),
 ('stadtpark','Stadtpark','El verde de la ciudad y el dorado de Johann Strauß. Un paseo junto al Wienfluss, sin necesidad de un plan.'),
 ('hundertwasserhaus','Hundertwasserhaus','Color, curvas y fachadas que rompen las reglas. Una Viena inesperada, cerca de nuestro apartamento.'),
]
NEW=[
 ('griechengasse','street','Griechengasse','Adoquines, faroles y un paso estrecho. El centro de Viena a una escala más íntima.'),
 ('ballgasse','street','Ballgasse','Una pequeña curva y la luz de los faroles. La belleza de doblar una esquina sin saber qué viene después.'),
 ('spittelberggasse','street','Spittelberggasse','Casas bajas, puertas y faroles. Otro ritmo a pocos pasos de los grandes museos.'),
 ('gutenberggasse','street','Gutenberggasse','Dejar que los adoquines marquen el camino. Una calle de Spittelberg hecha para pasear sin prisa.'),
 ('linke-wienzeile','street','Linke Wienzeile','Flores de cerámica y detalles dorados. Las fachadas de Otto Wagner convierten el paseo en un estampado.'),
 ('ferstel-pasaje','street','Ferstelpassage','Una calle bajo las arcadas. Mirar hacia la cubierta y descubrir un pequeño mundo dentro del centro.'),
 ('kohlmarkt-calle','street','Kohlmarkt','La cúpula de Michaelerplatz al fondo. Una de esas perspectivas que hacen que una calle parezca una escena.'),
 ('balthasar','coffee','Balthasar','Una barra de café, texturas minerales y un buen motivo para parar en Praterstraße.'),
 ('kaffemik','coffee','Kaffemik','Una fachada abierta al barrio y café de especialidad. La pausa contemporánea de Neubau.'),
 ('caffe-couture','coffee','CaffèCouture','Una barra sobria en el pasaje de Palais Ferstel. Café de especialidad en pleno centro histórico.'),
 ('kaffeefabrik','coffee','Kaffeefabrik','Café de origen y una taza con identidad propia. Una pequeña pausa en Wieden, junto a Karlsplatz.'),
 ('flora','table','&flora','Mesas de terrazzo, asientos de color y vegetación. Una mesa contemporánea junto al MuseumsQuartier.'),
 ('motto-am-fluss','table','Motto am Fluss','Una sala cálida junto al Donaukanal. Dejar que la conversación y la sobremesa se alarguen.'),
 ('salonplafond','table','Salonplafond','Un gran salón dentro del MAK. Techos trabajados y un ambiente actual para sentarse a la mesa.'),
 ('das-loft','table','Das LOFT','La ciudad entra por los ventanales. En la planta 18, el techo de color y el skyline comparten protagonismo.'),
 ('chez-bernard','table','Chez Bernard','Lámparas, plantas y luz dorada, arriba del Hotel MOTTO. Una de esas salas que ya cuentan una historia.'),
 ('tian','table','TIAN','Bóvedas claras y una forma distinta de mirar la cocina vegetal. Un interior elegante cerca del Stadtpark.'),
]

if __name__=='__main__':
 legacy=json.loads((ROOT/'src/data/vienna-places.json').read_text());by_id={p['id']:p for p in legacy['places']}
 with zipfile.ZipFile(ROOT/'downloads/Indice-visual-Viena-II.zip') as z:
  study=json.loads(z.read('Viena-II-Lugares-y-fuentes.json'))
  html=z.read('Viena-II-Calles-Cafes-Restaurantes.html').decode()
 assets={m[1]:base64.b64decode(m[3]) for m in re.finditer(r'data-photo="([^"]+)"[^>]*>\s*<img src="data:([^;]+);base64,([^"]+)"',html)}
 sources={s['id']:s for s in study['sources']};studied={p['id']:p for p in study['places']};photos={p['id']:p for p in study['photos']}
 result=[];paths={}
 for id,name,description in LANDMARKS:
  original=by_id[id];photo=original['photo']
  result.append(dict(id=id,name=name,kind='landmark',description=description,detail=original['description'],location=original['categoryLabel'],imageKey='map:'+id,mapPlaceId=id,photo={**photo,'sourcePage':photo['commonsPage'],'alt':photo['caption'],'rights':'licensed','localFile':'vienna-'+id+'.jpg'}))
 for sid,kind,name,description in NEW:
  entry=studied[sid];pid=entry['photoIds'][1 if sid in ['kaffeefabrik','das-loft'] else 0];photo=photos[pid]
  content=assets[pid];assert hashlib.sha256(content).hexdigest()==photo['sha256']
  id='kohlmarkt' if sid=='kohlmarkt-calle' else sid
  suffix=Path(photo['localFile']).suffix;filename='city-'+id+suffix
  (ROOT/'public/images'/filename).write_bytes(content);paths[id]='/images/'+filename
  result.append(dict(id=id,name=name,kind=kind,description=description,detail=entry['description'],location=entry['address'],note=entry.get('note'),imageKey=id,mapPlaceId='kohlmarkt' if id=='kohlmarkt' else None,sources=[sources[s]['url'] for s in entry['sources']],photo={key:value for key,value in photo.items() if key in ['id','alt','caption','artist','credit','publisher','license','licenseUrl','rights','rightsNote','sourcePage','downloadUrl','width','height','sha256']},researchVolume=2))
 assert len(result)==29 and len({p['id'] for p in result})==29
 data={'preparedDate':'2026-11-15','description':'Selección editorial de los dos estudios de Viena. Las ideas no son reservas ni un itinerario obligatorio. El mapa conserva sus 32 lugares previamente validados.','places':result}
 (ROOT/'src/data/city-selections.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 module='import data from "./data/city-selections.json" with { type: "json" };\nimport { places } from "./viennaPlaces.js";\n\n// Literal paths are embedded by the existing standalone exporter.\nconst photos = '+json.dumps(paths,ensure_ascii=False,indent=2)+';\n\nexport const cityKinds = {\n  landmark: "Lo imprescindible",\n  street: "Calles y pasajes",\n  coffee: "Un buen café",\n  table: "A la mesa",\n};\n\nexport const cityPlaces = data.places.map((place) => ({\n  ...place,\n  image: place.imageKey.startsWith("map:")\n    ? places.find((p) => p.id === place.mapPlaceId).image\n    : photos[place.imageKey],\n}));\nexport const cityById = Object.fromEntries(cityPlaces.map((p) => [p.id, p]));\n'
 (ROOT/'src/cityContent.js').write_text(module)
 print(json.dumps({'places':len(result),'newPhotos':len(paths),'newPhotoBytes':sum(len(assets[studied[sid]['photoIds'][1 if sid in ['kaffeefabrik','das-loft'] else 0]]) for sid,*_ in NEW)},ensure_ascii=False))
