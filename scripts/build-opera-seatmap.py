"""Reconstruct every seated position from the official venue's public geometry.

Source coordinates are retained, with the same 180-degree orientation as the
season PDF. Standing-room submaps are not relabelled as seats in the main hall.
"""
from pathlib import Path
import hashlib
import html
import json


def build(work, output):
    source_file = work/'public-seatmap.json'
    source = json.loads(source_file.read_text())
    mapping = json.loads((work/'mapping-jan22.json').read_text())
    assert source['seatmapVersion'] == mapping['seatmapVersion']
    area = next(a for a in source['areas'] if a['id'] == 0)
    dimension = area['dimension']
    seats, blocks = [], []
    for block in area['blocks']:
        if block['type'] != 'SEATS':
            continue
        block_seats = []
        for row in block['rows']:
            for group in row['seats']:
                value = None
                for step in group:
                    value = list(step) if value is None else [a+b for a,b in zip(value,step)]
                    seat = dict(id='s'+str(value[0]), blockId=block['id'], block=block['name'],
                        sourceX=value[1], sourceY=value[2], x=dimension-value[1], y=dimension-value[2])
                    block_seats.append(seat)
        seats.extend(block_seats)
        hulls = [g['points'] for g in block['graphics'] if g.get('hull') and g['type']=='POLYGON']
        blocks.append(dict(id=block['id'],name=block['name'],seats=len(block_seats),hulls=hulls))
    assert len(seats) == area['individualSeats'] == len({s['id'] for s in seats}) == 1753
    assert sum(s['blockId']==489 for s in seats) == 36
    selected = {s['id']:s for s in seats if s['id'] in ['s500','s501']}
    assert selected['s500']['x'] > selected['s501']['x']
    assert selected['s500']['y'] == selected['s501']['y'] == 5595
    assert abs(selected['s500']['x']-selected['s501']['x']) == 96
    # The annotation must fit entirely in the empty space between the stalls
    # and the central box. Counting SVG nodes alone would miss hidden seats.
    callout = dict(x=3065,y=4290,width=2100,height=510)
    occluded = [s['id'] for s in seats if
        callout['x']-25<s['x']<callout['x']+callout['width']+25 and
        callout['y']-25<s['y']<callout['y']+callout['height']+25]
    assert not occluded,occluded
    manifest = dict(sourcePage='https://tickets.wiener-staatsoper.at/webshop/webticket/seatmap?eventId=16677',
        seatmapId=source['seatmapId'],seatmapVersion=source['seatmapVersion'],
        sourceSha256=hashlib.sha256(source_file.read_bytes()).hexdigest(),
        mappingJan22Sha256=hashlib.sha256((work/'mapping-jan22.json').read_bytes()).hexdigest(),
        sourceAndPerformanceVersionsMatch=True,mainArea=0,seatedPositions=len(seats),blocks=len(blocks),
        transform={'x':'8192 - sourceX','y':'8192 - sourceY','orientation':'Stage at the top, matching the season PDF'},
        selectedSeatNumbers={'s500':{'row':'3','seat':'23'},'s501':{'row':'3','seat':'24'}},
        annotationBounds=callout,positionsOccludedByAnnotation=0,
        limitations=['Levels are unfolded as in the official seating diagram, not a measured architectural floor plan.',
            'Standing-room areas 1–3 are separate source submaps and are not drawn as seated positions.',
            'Layout only: colours do not indicate availability, prices or a physical capacity calculation.'],seats=seats)
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="400 450 7800 7800" role="img" aria-labelledby="title description">',
        '<title id="title">Mapa completo de butacas: Mittelloge, fila 3, asientos 23 y 24</title>',
        '<desc id="description">Reconstrucción de las 1753 posiciones sentadas del área principal del catálogo oficial. Escenario arriba, parterre en el centro, niveles de palcos y balcón y galería alrededor. Mittelloge se destaca en dorado; nuestras dos butacas, en azul.</desc>',
        '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 6 3 0 6" fill="none" stroke="#075fae" stroke-width="1.2"/></marker></defs>',
        '<rect x="400" y="450" width="7800" height="7800" fill="#fff"/>',
        '<g font-family="Arial,Helvetica,sans-serif" text-anchor="middle" fill="#343b40">',
        '<rect x="2915" y="850" width="2400" height="280" rx="65" fill="#252d33"/>',
        '<text x="4115" y="1045" fill="#fff" font-size="175" letter-spacing="20">ESCENARIO</text>',
        '<text x="4115" y="1700" fill="#676b6e" font-size="125" letter-spacing="14">FOSO DE ORQUESTA</text>',
        '<text x="4115" y="1975" font-size="135" letter-spacing="15">PARTERRE</text>',
        '<text x="4115" y="6760" font-size="125" letter-spacing="14">BALCÓN</text>',
        '<text x="4115" y="7920" font-size="135" letter-spacing="15">GALERÍA</text>',
        '<text transform="translate(610 3470) rotate(-90)" font-size="125" letter-spacing="10">PALCOS · PARTERRE / 1.er / 2.º NIVEL</text></g>']
    for block in blocks:
        for hull in block['hulls']:
            points = ' '.join(f'{dimension-x},{dimension-y}' for x,y in hull)
            svg.append(f'<polygon points="{points}" fill="'+('#faf0de' if block['id']==489 else '#f5f4f0')+'" stroke="#d9d7cf" stroke-width="6"/>')
    for seat in seats:
        chosen = seat['id'] in selected
        fill = '#075fae' if chosen else '#927037' if seat['blockId']==489 else '#969da3'
        svg.append(f'<circle class="'+('seat-selected' if chosen else 'seat')+f'" data-seat-id="{seat["id"]}" data-block-id="{seat["blockId"]}" cx="{seat["x"]}" cy="{seat["y"]}" r="25" fill="{fill}"><title>'+html.escape(seat['block']+' · '+(f'fila 3, asiento {23 if seat["id"]=="s500" else 24}' if chosen else 'posición '+seat['id']))+'</title></circle>')
    svg += ['<rect x="3630" y="5352" width="970" height="390" rx="70" fill="none" stroke="#075fae" stroke-width="15"/>',
        '<path d="M4115 4800V5315" stroke="#075fae" stroke-width="16" fill="none" marker-end="url(#arrow)"/>',
        '<rect x="3065" y="4290" width="2100" height="510" rx="70" fill="#eaf2fa" stroke="#bed4e9" stroke-width="8"/>',
        '<g font-family="Arial,Helvetica,sans-serif" text-anchor="middle" fill="#075396"><text x="4115" y="4440" font-size="100" letter-spacing="10">VUESTRAS BUTACAS</text><text x="4115" y="4625" font-size="170" font-weight="bold">MITTELLOGE</text><text x="4115" y="4760" font-size="135">Fila 3 · asientos 23 + 24</text></g>','</svg>']
    output.mkdir(parents=True,exist_ok=True)
    (output/'planos/mapa-completo-reconstruido.svg').write_text(''.join(svg))
    (output/'reconstruccion-butacas.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    return manifest


if __name__=='__main__':
    w=Path('/workspace/artifacts/opera-research')
    result=build(w,w/'report')
    print(json.dumps({k:result[k] for k in ['seatmapVersion','seatedPositions','blocks']},ensure_ascii=False))
