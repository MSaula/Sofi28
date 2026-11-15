# Volumen II — calles, cafés y restaurantes de Viena

## Alcance

Solicitud: ampliar el estudio interno con calles fotogénicas, café de especialidad y restaurantes modernos y cuidados. Priorizar imágenes reales de calidad y su interés estético sobre un itinerario práctico. **No modificar la página del regalo** ni incorporar aún estas fotos a sus marcadores.

La entrega incluye **29 fichas y 44 fotografías**: 15 calles/pasajes, 5 cafés y 9 restaurantes. Cada ficha se relaciona con lugares del volumen I, conservado sin cambios. Se agrupan cinco sectores amplios; no se inventan tiempos ni distancias a pie. Chez Bernard amplía deliberadamente el ámbito hacia Mariahilf por su interior.

## Selección y evidencia

1. Partir del casco histórico, Spittelberg/MuseumsQuartier, Wieden/Naschmarkt y el eje del canal–Stadtpark. Incluir el borde del Ring en Schottentor.
2. Contrastar identidad y sede en las webs oficiales. Distinguir la preparación y procedencia del café de la decoración del local. Documentar la propuesta culinaria y añadir el contraste de la Guía MICHELIN para Mochi, TIAN y Steirereck.
3. Buscar fotografías de espacio, calle y detalle que aporten perspectivas complementarias. Evitar logos, carteles y productos de tienda como sustitutos de una vista general sin explicarlo.
4. Descargar y revisar las imágenes manteniendo sus bytes. Todas las elegidas tienen al menos 1.600 px en su lado largo. El visor respeta la proporción; portada y tarjetas pueden encuadrar la imagen sin alterar el archivo.
5. Registrar fuente, crédito disponible, condición de uso, resolución y SHA-256 por foto. Distinguir **21 imágenes con licencia identificada** de **23 referencias oficiales o de prensa** con reutilización futura sin confirmar.

La calidad de café y cocina se fundamenta en las fuentes indicadas, no en una degustación propia ni en puntuaciones inventadas. Las doce marcas «Primera mirada» son una selección editorial visual.

## Incidencias observadas y decisiones

| Observación | Causa | Solución aplicada y comprobación |
| --- | --- | --- |
| Algunos dominios candidatos no identificaban el negocio o estaban aparcados. | URL inicial desactualizada o incorrecta. | Seguir enlaces oficiales: &flora se confirma desde Hotel Gilbert y undflora.at. Los candidatos sin identidad/foto suficiente no entran en las fichas; no se deduce un cierre. |
| Las variantes de imágenes de MICHELIN devolvían recortes panorámicos o versiones que no probaban un incremento de detalle respecto a la imagen de 1.000 px. | Transformaciones del servicio de imágenes. | Descartarlas de la selección. Mochi se sustituye por su foto de prensa de 7.115 × 4.724 px; TIAN por su biblioteca oficial; Steirereck por Commons. |
| La portada de Mochi mezcla varias marcas y establecimientos. | Web de un grupo con múltiples conceptos. | Elegir la carpeta específica `01_Mochi/Ort` del archivo oficial de prensa 2026 y contrastar Praterstraße 15 en MICHELIN. Se leen rangos del ZIP remoto; no se descarga entero el archivo de 1,58 GB. |
| La web de Chez Bernard mezcla imágenes de restaurante y anuncios de habitaciones del Hotel MOTTO. | Contenidos comerciales compartidos. | Descartar la foto de dormitorio y seleccionar sala y barra; conservar el acceso del restaurante por Schadekgasse 20. |
| La fachada junto al río del conjunto Steirereck podía confundirse con el restaurante principal. | Meierei y Steirereck comparten edificio/conjunto. | Seleccionar la ampliación metálica identificable, revisada a tamaño completo, en lugar de usar solo la fachada de la Meierei. |
| Kaffeefabrik reúne varias sedes en una misma galería. | Página corporativa y bloques 1040/1060/otros. | Seleccionar el bloque de Wieden, Favoritenstraße 4–6; no usar la tostadora o otra sede como si fueran ese local. |
| La foto de Jonas Reindl es un detalle de producto; no prueba una sede concreta. | Archivo corporativo sin identificación de sede en el pie. | Indicar expresamente la limitación. No presentarla como vista general del local de Schottentor. |
| Las fotos elegidas de TIAN Bistro muestran mesa y platos, no un recorrido completo del espacio. | Cobertura y calidad disponible. | Describir esa cobertura de forma explícita y separar el Bistro de TIAN Restaurant. |
| Ferstel aparece abierto y sin obras en fotos de archivo. | Fecha de las fotos distinta del estado actual del conjunto. | Mantener la comprobación de acceso por la reforma anunciada en Café Central. No afirmar que el Studio de CaffèCouture está cerrado. |
| Fotos de terrazas y vegetación muestran otras estaciones. | Referencias visuales de fechas diversas. | Identificar ese contexto; no convertir la imagen en una promesa de funcionamiento/aspecto en enero de 2027. |
| Algunos enlaces de CC0 venían con HTTP. | Metadatos de origen antiguos. | Normalizar la URL de Creative Commons a HTTPS y conservar `sourceLicenseUrl` para trazabilidad. |
| El crédito de Nicky Webb de la prensa de Balthasar no podía trasladarse sin prueba a las fotos web de 2020. | El ZIP de prensa contiene otro conjunto de nombres de archivo. | Contrastar su índice remoto y dejar la autoría de las dos fotos seleccionadas sin confirmar. No extender los permisos editoriales de otro conjunto a estos archivos. |
| El carácter de flecha exterior no se dibujaba correctamente en algunos enlaces. | Cobertura de glifos de la tipografía. | Sustituirlo por SVG decorativo; revisar capturas y repetir la validación de la entrega final. |

## Interfaz y navegación

HTML independiente, con fotografías y fuente incrustadas; funciona sin servidor y sin Internet. Portada con dos conceptos, índice lateral en PC, fichas con una imagen dominante y perspectivas adicionales, búsqueda tolerante a acentos/ß, filtros por concepto, sector y condición de uso, primera mirada, visor con teclado, descarga del archivo original y exportaciones CSV/JSON.

En pantallas pequeñas la barra de filtros deja de ser fija para no ocupar la lectura. El catálogo mantiene las 44 referencias y permite abrir una foto incluso si su ficha está fuera del filtro actual. La navegación por fotos respeta la selección activa y muestra por archivo el crédito y la condición de uso.

## Validación final

Se ejecutan nueve grupos de comprobaciones en Chromium con emulación 1440×1000, 390×844, 320×700 y 844×390:

- Integridad de 44 archivos y de sus copias incrustadas; dimensiones, créditos, condición de uso y relación entre sede/foto/ficha.
- Carga completa del HTML sin conexión; ninguna solicitud HTTP ni error JavaScript.
- Búsqueda, conceptos y 75 combinaciones de sector/tipo/condición de uso; prioridades, vacío y restablecimiento.
- Secuencia de las 44 fotos, enlaces, licencia visible solo cuando existe, teclado, vuelta al inicio, cierre, foco y bloqueo de desplazamiento del fondo.
- Descarga de una imagen con licencia y de la foto de prensa de Mochi de 11 MB; coincidencia de SHA-256 con las fuentes recibidas.
- Exportación JSON igual a los datos entregados y CSV idéntico byte por byte al archivo incluido en el ZIP.
- Accesos de capítulos, sectores, portada y catálogo.
- Composición y ausencia de desbordamiento horizontal, con direcciones y notas largas; revisión visual de las capturas.
- Axe A/AA sin hallazgos graves/críticos en documento y visor, e impresión que conserva las fichas seleccionadas.

El extractor opcional se ejecuta en una carpeta temporal y recupera las 44 fotos con sus hashes intactos. La emulación comprobada es Chromium; no se afirma una prueba en Safari o en dispositivos físicos.

## Preservación y entrega

Antes de introducir los archivos del estudio, el árbol de trabajo estaba limpio. Se comparan las huellas del código, `public`, el ZIP del regalo y el ZIP del volumen I con el estado inicial. La entrega se añade solo a `docs/research/viena` y `downloads/Indice-visual-Viena-II.zip`, en la rama privada `private-download`. No se ejecuta despliegue ni se cambian las ramas `main` o `gh-pages`.

El recibo de entrega registra el ZIP, su SHA-256, el commit de los archivos, la descarga autenticada y la comprobación de que un acceso anónimo no recupera el archivo privado. `validacion.json` y `preservacion-y-extraccion.json` contienen los resultados verificables.
