"""Package an already tested offline build. This script never publishes anything."""
from pathlib import Path
import base64
import hashlib
import json
import re
import zipfile

root = Path(__file__).resolve().parents[1]
source = root / 'dist-standalone/index.html'
assert source.exists(), 'Run npm run test:standalone first.'
assert source.stat().st_mtime >= max(p.stat().st_mtime for p in (root/'src').rglob('*') if p.is_file()), 'Rebuild and retest after changing source.'
html = source.read_bytes()
sha = lambda data: hashlib.sha256(data).hexdigest()
originals = {sha(p.read_bytes()) for p in (root/'public/images').iterdir() if p.suffix.lower() in ('.jpg','.jpeg','.png','.webp','.avif')}
embedded = {sha(base64.b64decode(value)) for value in re.findall(rb'data:image/(?:jpeg|png|webp|avif);base64,([A-Za-z0-9+/=]+)',html)}
assert len(originals) == 64 and embedded == originals, 'Every original photo must survive the export unchanged.'
baseline = json.loads((root/'docs/qa/opera-cinema-baseline.json').read_text())
for name, expected in baseline['trackedPublic'].items():
    assert sha((root/name).read_bytes()) == expected, name
for name, expected in baseline['researchArchives'].items():
    assert sha((root/name).read_bytes()) == expected, name
archive = root/'downloads/Viena.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as bundle:
    bundle.writestr('Viena.html',html)
    bundle.writestr('LEEME.txt','''Sofi 28 — Viena

Descomprime todos los archivos y abre Viena.html en tu navegador de escritorio.
La experiencia, las fotografías y los mapas funcionan sin conexión.
Los enlaces a fuentes externas necesitan Internet al pulsarlos.

Esta entrega contiene fotos personales y se comparte desde el repositorio privado.
No contiene entradas, códigos QR ni datos de admisión.

La vista del auditorio es una fotografía desde Mittelloge; la fila y el asiento
de la cámara no están documentados. El plano sí señala nuestras plazas.
''')
    bundle.writestr('LICENCIA-Instrument-Serif.txt',(root/'public/licenses/InstrumentSerif-OFL.txt').read_bytes())
    bundle.writestr('LICENCIA-Inter.txt',(root/'node_modules/@fontsource-variable/inter/LICENSE').read_bytes())
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert bundle.read('Viena.html') == html
receipt = {'htmlBytes':len(html),'htmlSha256':sha(html),'zipBytes':archive.stat().st_size,
    'zipSha256':sha(archive.read_bytes()),'embeddedOriginalPhotos':len(embedded),
    'originalPhotoSha256':sorted(originals),'preservedPublicFiles':len(baseline['trackedPublic']),
    'preservedResearchArchives':len(baseline['researchArchives']),'zipCrcVerified':True}
(root/'docs/qa/opera-cinema-package.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({key:value for key,value in receipt.items() if key!='originalPhotoSha256'}))
