"""Clip and simplify real OSM street geometry. No invented roads or waterways.

Usage: python3 scripts/build-vienna-data.py /path/to/equalstreetnames-vienna
The source is a data-only checkout; no code from it is executed.
"""
import json
import math
from pathlib import Path
import subprocess
import sys

SOURCE = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parents[1]
BBOX = [16.35, 48.175, 16.415, 48.245]
STREET = "Untere Weißgerberstraße"
MAJOR = {"Opernring", "Burgring", "Dr.-Karl-Renner-Ring", "Universitätsring", "Schottenring", "Schubertring", "Parkring", "Stubenring", "Franz-Josefs-Kai", "Praterstraße", "Taborstraße", "Landstraßer Hauptstraße", "Wiedner Hauptstraße", "Lassallestraße", "Praterstern", "Rennweg"}

def clip(a, b):
    # Liang–Barsky: preserve the source line, clipping only at the bounding box.
    dx,dy=b[0]-a[0],b[1]-a[1];lo,hi=0,1
    for p,q in [(-dx,a[0]-BBOX[0]),(dx,BBOX[2]-a[0]),(-dy,a[1]-BBOX[1]),(dy,BBOX[3]-a[1])]:
        if p==0:
            if q<0:return None
        else:
            t=q/p
            if p<0:lo=max(lo,t)
            else:hi=min(hi,t)
            if lo>hi:return None
    return [[round(a[0]+lo*dx,7),round(a[1]+lo*dy,7)],[round(a[0]+hi*dx,7),round(a[1]+hi*dy,7)]]

def distance(a,b):
    k=math.pi/180
    return 6371000*2*math.asin(math.sqrt(math.sin((b[1]-a[1])*k/2)**2+math.cos(a[1]*k)*math.cos(b[1]*k)*math.sin((b[0]-a[0])*k/2)**2))

def simplify(points, tolerance=1.5):
    # Screen-independent cartographic generalization: at most 1.5m deviation.
    # Way endpoints are retained; this is display geometry, not routing data.
    if len(points)<3:return points
    def square_distance(p,a,b):
        sx=111320*math.cos(math.radians(48.21));sy=111320
        dx=(b[0]-a[0])*sx;dy=(b[1]-a[1])*sy
        t=max(0,min(1,((p[0]-a[0])*sx*dx+(p[1]-a[1])*sy*dy)/(dx*dx+dy*dy))) if dx or dy else 0
        return ((p[0]-a[0])*sx-t*dx)**2+((p[1]-a[1])*sy-t*dy)**2
    keep={0,len(points)-1};stack=[(0,len(points)-1)]
    while stack:
        start,end=stack.pop()
        if end-start<2:continue
        index=max(range(start+1,end),key=lambda i:square_distance(points[i],points[start],points[end]))
        if square_distance(points[index],points[start],points[end])>tolerance*tolerance:
            keep.add(index);stack.extend([(start,index),(index,end)])
    return [points[i] for i in sorted(keep)]

def main():
    source=json.loads((SOURCE/'data/ways.geojson').read_text())
    features=[];reference=[]
    for f in source['features']:
        name=f['properties'].get('name') or ''
        if f['geometry']['type']!='LineString':continue
        points=f['geometry']['coordinates']
        if name==STREET:reference.append(points)
        runs=[];run=[]
        for a,b in zip(points,points[1:]):
            segment=clip(a,b)
            if not segment:
                if len(run)>1:runs.append(run)
                run=[];continue
            if run and run[-1]!=segment[0]:
                if len(run)>1:runs.append(run)
                run=[]
            if not run:run.append(segment[0])
            if run[-1]!=segment[1]:run.append(segment[1])
        if len(run)>1:runs.append(run)
        for run in runs:
            features.append({'type':'Feature','properties':{'name':name,'class':'reference' if name==STREET else 'major' if name in MAJOR else 'street'},'geometry':{'type':'LineString','coordinates':run}})
    # The user supplied a possibly inexact address, not a verified building point.
    # Use the real street's length midpoint, explicitly at street-level precision.
    reference=sorted(reference,key=lambda line:max(p[1] for p in line),reverse=True)
    chain=[]
    for line in reference:
        line=line if line[0][1]>line[-1][1] else list(reversed(line))
        if chain and distance(chain[-1],line[0])>10:raise ValueError('Reference street is not a connected chain')
        chain.extend(line if not chain else line[1:])
    total=sum(distance(a,b) for a,b in zip(chain,chain[1:]));remaining=total/2;point=None
    for a,b in zip(chain,chain[1:]):
        d=distance(a,b)
        if remaining<=d:
            t=remaining/d;point=[round(a[0]+t*(b[0]-a[0]),7),round(a[1]+t*(b[1]-a[1]),7)];break
        remaining-=d
    commit=subprocess.check_output(['git','-C',str(SOURCE),'rev-parse','HEAD'],text=True).strip()
    grouped={}
    for f in features:
        key=(f['properties']['name'],f['properties']['class'])
        grouped.setdefault(key,[]).append(simplify(f['geometry']['coordinates']))
    compact=[{'type':'Feature','properties':{'name':name,'class':kind},'geometry':{'type':'MultiLineString','coordinates':lines}} for (name,kind),lines in grouped.items()]
    result={'type':'FeatureCollection','bbox':BBOX,'source':{'name':'OpenStreetMap contributors / EqualStreetNames Vienna','url':'https://github.com/EqualStreetNames/equalstreetnames-vienna','commit':commit,'snapshot':'2026-10-02','license':'ODbL-1.0','licenseUrl':'https://opendatacommons.org/licenses/odbl/1-0/','copyrightUrl':'https://www.openstreetmap.org/copyright','processing':'Clipped and grouped by name; line simplification at most 1.5m deviation; no invented streets or waterways.'},'reference':{'street':STREET,'coordinates':point,'precision':'street midpoint, not building geocoding','uncertaintyMeters':math.ceil(total/2)},'features':compact}
    out=ROOT/'src/data/vienna-streets.json';out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
    print(json.dumps({'streetGroups':len(compact),'sourceSegments':len(features),'reference':result['reference'],'bytes':out.stat().st_size},ensure_ascii=False))

if __name__=='__main__':main()
