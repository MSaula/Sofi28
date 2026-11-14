"""Collect/cache OSM geocoding and pedestrian routes for the gift's local map.

Nominatim requests are serial, cached, and at least 1.1 seconds apart.
Routing uses FOSSGIS's explicitly pedestrian OSRM endpoint, never a car profile.
Run `geocode`, review the candidates, then run `routes` and `build`.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import HTTPError
import json, time, sys, math, hashlib, shutil

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/vienna-explorer/sources'
OUT.mkdir(parents=True,exist_ok=True)
UA='Sofi28/1.0 private travel research (+https://github.com/MSaula/Sofi28)'
ORIGIN=[16.39508,48.20926]
QUERIES={
 'stephansdom':'Stephansdom Wien','graben':'Pestsäule Graben Wien',
 'peterskirche':'Peterskirche Wien','kohlmarkt':'Michaelerplatz Wien',
 'hofburg':'Heldenplatz Wien','prunksaal':'Prunksaal Wien','albertina':'Albertina Wien',
 'staatsoper':'Wiener Staatsoper Wien','burggarten':'Palmenhaus Burggarten Wien',
 'maria-theresien':'Maria-Theresien-Platz Wien','kunsthistorisches':'Kunsthistorisches Museum Wien',
 'museumsquartier':'MuseumsQuartier Wien','volksgarten':'Volksgarten Wien',
 'parlament':'Parlament Wien','rathaus':'Rathaus Wien','freyung':'Palais Ferstel Wien',
 'am-hof':'Am Hof Wien','judenplatz':'Judenplatz Wien','ankeruhr':'Ankeruhr Wien',
 'franziskanerplatz':'Franziskanerplatz Wien','karlskirche':'Karlskirche Wien',
 'musikverein':'Musikverein Wien','secession':'Secession Wien','naschmarkt':'Naschmarkt Wien',
 'stadtpark':'Johann Strauss Denkmal Stadtpark Wien','belvedere':'Oberes Belvedere Wien',
 'hundertwasserhaus':'Hundertwasserhaus Wien','kunsthaus':'Kunst Haus Wien',
 'cafe-central':'Cafe Central Wien','cafe-sacher':'Cafe Sacher Wien',
 'demel':'Demel Kohlmarkt Wien','justizpalast':'Justizpalast Wien',
}

def fetch(url,file,body=None):
 if file.exists():return json.loads(file.read_bytes())
 try:
  with urlopen(Request(url,data=body,headers={'User-Agent':UA}),timeout=60) as response:
   data=response.read()
 except HTTPError as e:
  print('HTTP',e.code,e.headers.get('Retry-After'),e.read(300).decode('utf-8','replace'),flush=True)
  raise
 result=json.loads(data);file.write_bytes(data);return result

def distance(a,b):
 k=math.pi/180;la,lb=a[1]*k,b[1]*k;dlat=lb-la;dlon=(b[0]-a[0])*k
 return 6371008.8*2*math.asin(math.sqrt(math.sin(dlat/2)**2+math.cos(la)*math.cos(lb)*math.sin(dlon/2)**2))

def geocode():
 for ident,q in QUERIES.items():
  params={'q':q,'format':'jsonv2','limit':3,'addressdetails':1,'namedetails':1,'polygon_geojson':1,'countrycodes':'at','viewbox':'16.34,48.222,16.405,48.185','bounded':1}
  data=fetch('https://nominatim.openstreetmap.org/search?'+urlencode(params),OUT/(ident+'-geocode.json'))
  print(json.dumps({'id':ident,'candidates':[{'name':p.get('name'),'coordinates':[p['lon'],p['lat']],'kind':p.get('type'),'osm':[p.get('osm_type'),p.get('osm_id')]} for p in data]},ensure_ascii=False),flush=True)
  time.sleep(1.1)

def routes():
 selected=json.loads((OUT/'reviewed-locations.json').read_text())
 for place in selected:
  lon,lat=place['coordinates']
  url=f'https://routing.openstreetmap.de/routed-foot/route/v1/foot/{ORIGIN[0]},{ORIGIN[1]};{lon},{lat}?overview=full&geometries=geojson&steps=false'
  data=fetch(url,OUT/(place['id']+'-walk.json'))
  assert data['code']=='Ok'
  route=data['routes'][0];points=route['geometry']['coordinates']
  print(json.dumps({'id':place['id'],'meters':route['distance'],'minutes':round(route['duration']/60,1),'originGap':round(distance(ORIGIN,points[0]),1),'destinationGap':round(distance([lon,lat],points[-1]),1),'points':len(points)}),flush=True)
  time.sleep(1.1)

def build():
 research=json.loads((ROOT/'docs/research/viena/lugares-y-fuentes.json').read_text())
 locations={p['id']:p for p in json.loads((OUT/'reviewed-locations.json').read_text())}
 photos={p['id']:p for p in research['photos']}
 featured=['belvedere','staatsoper','hofburg','stephansdom','karlskirche']
 short={'belvedere':'Belvedere','staatsoper':'Ópera','hofburg':'Hofburg','stephansdom':'Stephansdom','karlskirche':'Karlskirche','prunksaal':'Prunksaal','maria-theresien':'Maria-Theresien-Platz','kunsthistorisches':'Kunsthistorisches','hundertwasserhaus':'Hundertwasserhaus','stadtpark':'Johann Strauss','burggarten':'Palmenhaus','kohlmarkt':'Michaelerplatz','freyung':'Palais Ferstel'}
 items=[];images=[];validation=[]
 for p in research['places']:
  ident=p['id'];location=locations[ident];response=(OUT/(ident+'-walk.json')).read_bytes();raw=json.loads(response);route=raw['routes'][0]
  points=route['geometry']['coordinates'];origin_gap=distance(ORIGIN,points[0]);destination_gap=distance(location['coordinates'],points[-1])
  measured=sum(distance(a,b) for a,b in zip(points,points[1:]));straight=distance(ORIGIN,location['coordinates'])
  assert origin_gap<20 and destination_gap<90,(ident,origin_gap,destination_gap)
  assert abs(measured-route['distance'])/route['distance']<.025,(ident,measured,route['distance'])
  assert route['distance']+origin_gap+destination_gap>=straight*.98,(ident,straight,route['distance'])
  assert 3<route['distance']/(route['duration']/3600)/1000<5.5
  photo=photos[p['photoIds'][0]];filename='vienna-'+ident+'.jpg'
  original=Path('/workspace/informes/viena-puntos-interes/fotos')/photo['localFile']
  if not original.exists():raise FileNotFoundError('Recover source JPEG from the independent report: '+photo['id'])
  assert hashlib.sha256(original.read_bytes()).hexdigest()==photo['sha256']
  shutil.copyfile(original,ROOT/'public/images'/filename)
  images.append(f'  "{ident}": "/images/{filename}",')
  outline=location.get('geometry');outline=outline if outline and outline['type'] in ['Polygon','MultiPolygon'] and location['osmKind'] not in ['park','pedestrian','marketplace'] else None
  item={'id':ident,'name':'Belvedere Superior' if ident=='belvedere' else p['name'],'shortName':short.get(ident,p['name']),'featured':ident in featured,'featuredOrder':featured.index(ident)+1 if ident in featured else None,
   'categoryLabel':research['categories'][p['category']],'description':p['description'],'coordinates':location['coordinates'],'coordinateSource':{k:v for k,v in location.items() if k not in ['id','coordinates','geometry']},'outline':outline,
   'walk':{'meters':route['distance'],'seconds':route['duration'],'geometry':route['geometry'],'snappedOrigin':points[0],'snappedDestination':points[-1],'originGapMeters':round(origin_gap,2),'destinationGapMeters':round(destination_gap,2),'responseSha256':hashlib.sha256(response).hexdigest()},
   'photo':{k:photo[k] for k in ['id','caption','artist','license','licenseUrl','commonsPage','originalUrl','width','height','sha256']},'officialUrl':p['official'],'statusNote':p.get('statusNote')}
  items.append(item);validation.append({'id':ident,'meters':route['distance'],'seconds':route['duration'],'geometryLengthMeters':round(measured,2),'straightDistanceMeters':round(straight,2),'originGapMeters':round(origin_gap,2),'destinationGapMeters':round(destination_gap,2),'osmType':location['osmType'],'osmId':location['osmId']})
 result={'preparedDate':'2026-11-14','origin':{'coordinates':ORIGIN,'precision':'approximate Airbnb listing point accepted by user'},'source':{'locations':'OpenStreetMap / Nominatim, individually reviewed object names and kinds','license':'ODbL-1.0','copyrightUrl':'https://www.openstreetmap.org/copyright','routes':'FOSSGIS OSRM pedestrian service','routingEndpoint':'https://routing.openstreetmap.de/routed-foot/route/v1/foot/','walkingSpeedObservedKph':4.5,'timing':'Pedestrian service estimate, without visitor stops; rounded in UI','photos':'Independent Vienna visual index, individual credits retained'},'places':items}
 (ROOT/'src/data/vienna-places.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
 code='import data from "./data/vienna-places.json" with { type: "json" };\n\n// Literal paths are embedded by the existing standalone exporter.\nconst photoSources = {\n'+'\n'.join(images)+'\n};\nexport const placesData = data;\nexport const places = data.places.map(place => ({ ...place, image: photoSources[place.id] }));\n'
 (ROOT/'src/viennaPlaces.js').write_text(code)
 (ROOT/'artifacts/vienna-explorer/data-validation.json').write_text(json.dumps(validation,indent=2)+'\n')
 print(json.dumps({'places':len(items),'featured':sum(p['featured'] for p in items),'sourcePhotos':len(images),'dataBytes':(ROOT/'src/data/vienna-places.json').stat().st_size,'maximumDestinationGapMeters':max(p['destinationGapMeters'] for p in validation)}))

if __name__=='__main__':
 mode=sys.argv[1]
 if mode=='geocode':geocode()
 elif mode=='routes':routes()
 elif mode=='build':build()
 else:raise SystemExit('Use geocode or routes')
