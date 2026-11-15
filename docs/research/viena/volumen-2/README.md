# Viena, entre calles y mesas — volumen II

[Descargar el estudio HTML y sus índices](https://github.com/MSaula/Sofi28/raw/refs/heads/private-download/downloads/Indice-visual-Viena-II.zip). Requiere acceso al repositorio privado. Descomprime el ZIP y abre **Viena-II-Calles-Cafes-Restaurantes.html**; funciona sin servidor y sin conexión.

El estudio del 15/11/2026 añade **29 fichas y 44 fotografías**: **15 calles y pasajes, 5 cafés de especialidad y 9 restaurantes**. Prioriza el interés estético, la calidad de las imágenes y la relación con los monumentos del primer volumen. El centro, Spittelberg/Neubau, Wieden y el eje del canal–Stadtpark concentran la selección; Chez Bernard amplía la mirada hacia Mariahilf por su interior.

Griechengasse, Ballgasse, Haarhof, Spittelberg y Ferstel aportan calles recogidas; Kohlmarkt y Linke Wienzeile incorporan perspectiva y fachadas. Balthasar, Kaffemik y CaffèCouture representan distintas formas de presentar el café. &flora, Salonplafond, Das LOFT, Chez Bernard, Mochi, TIAN, su Bistro, Motto am Fluss y Steirereck completan las referencias gastronómicas.

Cada ficha contiene descripción, lectura fotográfica, sede o sector, criterio de selección, fuentes y monumentos relacionados del volumen I. El HTML ofrece búsqueda, filtros por concepto, sector y condición de uso, doce primeras miradas editoriales, visor de fotos completas, descarga de originales y exportación CSV/JSON. No es un itinerario ni confirma aperturas para enero de 2027.

Todas las fotos elegidas tienen al menos 1.600 px en su lado largo y mantienen sus bytes recibidos. **21 tienen licencia identificada; 23 son referencias oficiales o de prensa con reutilización futura por confirmar.** Los créditos no identificados se indican expresamente. El conjunto de prensa de Nicky Webb en Balthasar se distingue de las dos fotos web elegidas, cuya autoría específica no se ha confirmado. Las fotos de otras sedes, habitaciones de hotel o variantes ampliadas/recortadas se descartan.

## Archivos

- [Fichas, fotografías, condiciones y fuentes](indice.json).
- [Índice fotográfico CSV](fotografias.csv).
- [Plan, incidencias y validación](plan-y-validacion.md).
- [Resultados de navegador](validacion.json).
- [Preservación del proyecto y extracción de fotos](preservacion-y-extraccion.json).
- [Recibo de entrega privada](entrega.json).
- [Portada de escritorio](portada-escritorio.png), [portada móvil](portada-movil.png), [ficha de &flora](flora-escritorio.png) y [visor móvil](visor-movil.png).

El ZIP incluye el HTML con las 44 imágenes incrustadas, CSV, JSON, créditos e instrucciones. El visor descarga cada imagen con sus bytes originales. El script opcional `Extraer-fotografias.py`, incluido en el ZIP, recupera todas las fotos en una carpeta y comprueba sus hashes; no hace falta ejecutarlo para leer el informe.

La validación cubre nueve grupos de comprobaciones: 75 combinaciones de filtros, las 44 fotos del visor, teclado y foco, descarga de originales, exportaciones, impresión y composición en 1440, 390, 320 y 844 px. No se observan solicitudes HTTP, errores JavaScript ni hallazgos graves/críticos de axe A/AA en los estados comprobados. Se revisan las capturas y las fotos. La prueba corresponde a Chromium emulado.

El volumen I, el código y los archivos públicos de la web del regalo y su ZIP conservan sus huellas anteriores. Esta entrega se añade únicamente a la rama privada de investigación; no se despliega la web principal.
