"""Prepare genuine Stadt Wien map layers; no external calls at page runtime."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlencode
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,math,hashlib

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'artifacts/vienna-explorer/sources';CACHE.mkdir(parents=True,exist_ok=True)
BBOX=[16.333,48.181,16.419,48.226]
LAYERS={'blocks':'BAUBLOCKOGD','green':'OEFFGRUENFLOGD','water':'FMZKGEWOGD'}

def simplify(points,tolerance=1.2):
 if len(points)<5:return [[round(p[0],7),round(p[1],7)] for p in points]
 sx=111320*math.cos(math.radians(48.2));sy=111320
 def sq(p,a,b):
  dx=(b[0]-a[0])*sx;dy=(b[1]-a[1])*sy
  t=max(0,min(1,((p[0]-a[0])*sx*dx+(p[1]-a[1])*sy*dy)/(dx*dx+dy*dy))) if dx or dy else 0
  return ((p[0]-a[0])*sx-t*dx)**2+((p[1]-a[1])*sy-t*dy)**2
 keep={0,len(points)-1};stack=[(0,len(points)-1)]
 while stack:
  a,b=stack.pop()
  if b-a<2:continue
  i=max(range(a+1,b),key=lambda i:sq(points[i],points[a],points[b]))
  if sq(points[i],points[a],points[b])>tolerance*tolerance:keep.add(i);stack.extend([(a,i),(i,b)])
 result=[[round(points[i][0],7),round(points[i][1],7)] for i in sorted(keep)]
 return result if len(result)>=4 else [[round(p[0],7),round(p[1],7)] for p in points]

def geometry(g):
 if g['type']=='Polygon':return {'type':'Polygon','coordinates':[simplify(r) for r in g['coordinates']]}
 if g['type']=='MultiPolygon':return {'type':'MultiPolygon','coordinates':[[simplify(r) for r in p] for p in g['coordinates']]}
 return None

def collect(item):
 kind,name=item
 params={'service':'WFS','version':'2.0.0','request':'GetFeature','typeNames':'ogdwien:'+name,'srsName':'EPSG:4326','bbox':','.join(map(str,BBOX))+',EPSG:4326','outputFormat':'application/json','count':20000}
 url='https://data.wien.gv.at/daten/geo?'+urlencode(params);file=CACHE/('context-'+kind+'.json')
 if not file.exists():
  with urlopen(Request(url,headers={'User-Agent':'Sofi28/1.0 private city research'}),timeout=120) as r:file.write_bytes(r.read())
 raw=file.read_bytes();data=json.loads(raw)
 assert data['numberReturned']>0 and data['numberReturned']==data['numberMatched'],(kind,data.get('numberMatched'),data.get('numberReturned'))
 features=[]
 for f in data['features']:
  g=geometry(f['geometry'])
  if g:features.append({'type':'Feature','id':f['id'],'properties':{'layer':kind},'geometry':g})
 print(kind,len(features),len(raw),flush=True)
 return features,{'layer':kind,'dataset':name,'requestUrl':url,'timestamp':data['timeStamp'],'features':len(features),'sha256':hashlib.sha256(raw).hexdigest()}

if __name__=='__main__':
 features=[];sources=[]
 with ThreadPoolExecutor(max_workers=2) as pool:
  for future in as_completed([pool.submit(collect,i) for i in LAYERS.items()]):
   f,s=future.result();features.extend(f);sources.append(s)
 out={'type':'FeatureCollection','bbox':BBOX,'source':{'name':'Stadt Wien — ViennaGIS Open Government Data','url':'https://data.wien.gv.at/','copyright':'Datenquelle: Stadt Wien – data.wien.gv.at','license':'CC BY 3.0 AT','licenseUrl':'https://creativecommons.org/licenses/by/3.0/at/deed.en','processing':'Original polygons, simplified by at most 1.2m and rounded to 7 decimals; blocks are urban blocks, not inferred building footprints.','layers':sources},'features':features}
 path=ROOT/'src/data/vienna-context.json';path.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
 print('output',len(features),path.stat().st_size,flush=True)
