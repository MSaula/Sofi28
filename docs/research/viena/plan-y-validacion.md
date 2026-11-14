# Viena — índice interno de lugares e imágenes

## Alcance

Documento de investigación independiente de la web del regalo. Selección amplia del casco histórico, Ring y zonas próximas de Karlsplatz, Belvedere y Landstraße. El resultado no es un itinerario cerrado para dos días.

Cada ficha debe contener: nombre, zona, categoría, descripción breve, interés visual, encuadre sugerido, consideración relevante para enero, enlaces de contraste y al menos una fotografía real identificada, con autor, licencia, URL y resolución. Se distinguen la información documentada y la selección editorial.

## Criterios de las fotografías

- Fotografías reales del lugar, sin marcas de agua ni alteraciones generativas.
- Buscar una resolución de al menos 1.600 px en su lado largo; no ampliar un archivo pequeño para aparentar calidad.
- Preferir Wikimedia Commons con atribución y licencia identificadas. Inspección visual del archivo descargado, además de sus metadatos.
- Conservar el original recibido y un índice de procedencia e integridad. Cualquier imagen no descargada o no inspeccionada debe figurar como pendiente.
- La estación que muestra una foto no garantiza el aspecto de Viena en enero. Evitar recomendar flores, fuentes activas o mercados navideños como hechos para el 22–24 de enero de 2027.

## Trabajo localizado

- [x] Selección y fichas editoriales.
- [x] Contraste de las fuentes públicas.
- [x] Descarga, metadatos e inspección de las imágenes.
- [x] HTML independiente con búsqueda, filtros y visor.
- [x] Índice reutilizable JSON/CSV y originales.
- [x] Validación de enlaces, recursos, móvil y funcionamiento offline.
- [x] Entrega privada separada del ZIP del regalo.

## Incidencia de acceso

La política observada de esta máquina es restricted con el preset package_managers y sin dominios adicionales. Las solicitudes a Turismo de Viena, Wikipedia y Commons devuelven 403 del túnel del proxy. Tras la comunicación del usuario de haber habilitado toda la red, una segunda solicitud y la lectura de la configuración siguen mostrando la política anterior. El bloqueo no es una falta de fotografías del lugar ni un rechazo de Wikimedia a un archivo concreto.

No se modifican la aplicación del regalo, su ZIP o las ramas de publicación.


## Resolución del acceso

El usuario guardó la configuración el 14/11/2026. La política pasó a unrestricted/enforced y las solicitudes nuevas a Turismo de Viena, Wikipedia y Commons respondieron 200. La recopilación continuó con caché local, consultas agrupadas y respeto a Retry-After cuando hubo límites 429. No se cambió ni publicó la configuración desde este trabajo.

## Selección y hallazgos

32 fichas, 4 zonas, 12 prioridades visuales editoriales y 34 fotografías. Se descartan los logotipos, una pintura de Palais Ferstel, una postal de 1881, un rótulo de calle aislado, una estación de metro que no representa el Stadtpark, vistas de edificios homónimos en Múnich/Bruselas y archivos de resolución insuficiente. El patio del MuseumsQuartier sustituye una vista aérea para que la referencia sea útil a pie.

La página oficial de Café Central anuncia cierre por reforma desde el 16/03/2026 y reapertura prevista para el invierno de 2026. La ficha destaca que la reapertura para enero debe confirmarse; la fotografía del salón es anterior a la reforma. El acceso al pasaje de Palais Ferstel también requiere comprobarse. Hundertwasserhaus y Kunst Haus Wien se documentan como lugares distintos.

Las imágenes se inspeccionan visualmente y se comprueban resolución y SHA-256. No hay marcas de agua visibles ni estiramiento en la presentación. Las copias recibidas no se amplían, recomprimen o retocan; el visor y las tarjetas conservan la proporción. Las fechas y licencias de origen se registran individualmente.

## Validación final

9 grupos de comprobación aprobados: integridad/metadatos; documento offline e incrustación de las 34 fotos; búsqueda y filtros; visor completo/teclado/foco/bloqueo del fondo/descarga de foto; exportaciones JSON/CSV; índice y enlaces internos; composición en 1440, 390, 320 y 844 px; auditoría automatizada de accesibilidad; impresión. Cero solicitudes HTTP y cero errores JavaScript durante la prueba offline.

La primera auditoría detectó contraste 4,37:1 en los números laterales. Se oscurece ese color y se repite la validación completa del informe: sin infracciones graves/críticas de axe en el documento y el visor comprobados. No equivale a certificación completa ni a pruebas en Safari o dispositivos físicos.

El ZIP contiene únicamente el HTML autónomo, JSON, CSV, licencias y LEEME. El HTML de 35,9 MB contiene las fotos; no duplica sus archivos en el ZIP. Cada imagen puede descargarse desde el visor. Se comprueban CRC y coincidencia exacta del HTML empaquetado con el validado.


## Entrega remota verificada

Commit c7273f61ba6c5715d25140cc4d46b3f653f0e9fe en private-download, recuperado desde origin. El ZIP remoto coincide con el local y el HTML con el validado. Las 34 fotografías incrustadas conservan sus hashes. La descarga anónima responde 404. Se comprueban sin cambios el árbol de código de la aplicación, los recursos públicos, Viena.zip, el informe anterior del Airbnb y las ramas main y gh-pages.

[Descargar esta versión](https://github.com/MSaula/Sofi28/raw/c7273f61ba6c5715d25140cc4d46b3f653f0e9fe/downloads/Indice-visual-Viena.zip). Los detalles de integridad se conservan en entrega.json.
