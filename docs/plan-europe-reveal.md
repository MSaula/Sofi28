# Sofi 28 — tarjeta final y mapa de Europa

## Alcance y decisiones

1. Sustituir la última tarjeta por una composición tipográfica: edición «Sofi 28», título grande «Lo próximo» y fecha. No habrá foto ni espacio reservado para ella. Las cinco tarjetas de recuerdos conservan sus imágenes y movimiento.
2. Usar «¿A dónde iremos?» como título de salida; se normaliza la errata «idemos». Mantener la revelación de Viena al llegar y las fases siguientes del mapa urbano.
3. Eliminar la ruta guía discontinua. Solo se ve la parte recorrida del vuelo, con avión y traza derivados de la misma geometría y cámara. No pintar ni destacar la posición final antes de tiempo.
4. Abrir el encuadre para incluir la península ibérica y la latitud de Edimburgo/Copenhague. Adaptar la extensión lateral al tamaño real, manteniendo la proporción cartográfica. Verificar también los países de contexto que entran en el nuevo encuadre.
5. Añadir ciudades y capitales con coordenadas de una fuente geográfica trazable. El usuario concreta: Grecia → Paros; Dolomitas → Cortina d’Ampezzo; Mallorca conserva el nombre de isla. Se puede usar Reikiavik para Islandia, pero no se ampliará el encuadre para que aparezca. Montenegro y País Vasco conservan sus nombres de región/país, sin atribuir ciudades visitadas sin confirmación.
6. Mantener el encuadre pedido sin ampliarlo por Islandia o Lanzarote y sin recuadros para hacerlas aparecer. No desplazar puntos fuera de su posición para hacerlos caber. México, Egipto e Indonesia se mantienen en el cronológico según el alcance anterior.

## Validación prevista

- Datos: coordenadas en orden longitud/latitud, fuentes y revisión de cada localización; cobertura de las ciudades/zonas anteriores y puntos de referencia del nuevo encuadre.
- Geometría: proyección, origen/destino, traza y avión con una sola transformación; muestreo del recorrido, zoom, inversión y giro de pantalla.
- Visual: ciudades legibles, etiquetas sin colisiones relevantes, sin puntos falsamente recolocados y sin anticipar el destino.
- Tarjeta final: ausencia de foto y placeholder, tipografía más grande, ajuste de altura y calendario sin recortes.
- Regresión: flujo completo, accesibilidad, navegación, móviles y exportación offline. Solo actualizar la entrega privada autorizada.

## Seguimiento

- [x] Datos geográficos y encuadre documentados.
- [x] Tarjeta final tipográfica y título de salida.
- [x] Ruta sin anticipación y etiquetas de Europa.
- [x] Pruebas localizadas y revisión visual.
- [x] Validación end to end y offline.
- [x] ZIP privado actualizado y comprobado.


## Causas y correcciones

| Síntoma | Causa | Corrección y aceptación |
| --- | --- | --- |
| Sofi 28 muestra una foto vacía y texto pequeño. | Reutiliza el diseño de recuerdos con placeholder. | Composición exclusiva de edición, título y fecha, sin elemento de imagen; cinco fotos históricas conservadas. Verificación de límites y legibilidad en cuatro tamaños y vista estática. |
| El destino se conoce antes del vuelo. | Ruta futura completa y etiqueta final renderizadas desde el inicio. | Se elimina el trazado guía y se monta la etiqueta de Viena solo al completar la trayectoria. También se corrige el nombre accesible de la escena. |
| Falta contexto al abrir el encuadre. | Encuadre cercano y selección manual de países; faltan Rusia y Bielorrusia. | Proyección proporcional sobre la extensión de referencia 11°O–27°E y 35–57,5°N; incluye países vecinos reales. La dimensión libre se amplía según la proporción del panel. |
| Añadir lugares puede introducir puntos falsos o ciudades homónimas. | Ubicar etiquetas a mano o seleccionar una ciudad solo por nombre. | Coordenadas WGS84 con país e identificador de fuente; marcador siempre en la proyección exacta. Paros/Mallorca se obtienen de su isla, no de la capital del país. |
| Los textos se alejan de su ubicación en móvil. | Reservar toda la trayectoria como obstáculo desplaza rótulos a zonas lejanas; un orden único de colocación penaliza al último. | Comparación acotada de composiciones deterministas; se priorizan los diez lugares compartidos, Edimburgo y Copenhague. Se reducen capitales secundarias en móvil. Solo el texto tiene margen de colocación; el punto nunca cambia. El avión atenúa suavemente los rótulos cercanos mientras pasa. |
| Una nueva proyección puede separar avión y traza. | Modelos geométricos distintos para SVG y marcador, o escalado temporal del lienzo. | Una sola polilínea geográfica entre los aeropuertos; avance por longitud acumulada, cámara compartida y SVG en el tamaño medido del panel. Verificación contra `getPointAtLength` y matrices reales de pantalla, ida y vuelta. |

Dos problemas adicionales detectados en las comprobaciones localizadas:

- En 320 px, el nuevo título grande excedía su columna. Se reduce el margen interior de la tarjeta en pantallas estrechas, manteniendo 32 px de título, fecha separada y cero recortes. La prueba mide contenido y contenedor reales, además de su posición.
- La atenuación del avión podía ocultar Mallorca desde la salida, antes de empezar el movimiento. Se reserva el símbolo de origen al distribuir etiquetas y se abre/cierra la atenuación con ventanas suaves durante el vuelo. Las diez referencias compartidas tienen opacidad completa al inicio. Los rótulos de salida y llegada también se desvanecen continuamente durante el zoom, sin umbrales binarios.

La inspección de capturas del recorrido completo encontró un problema que las primeras comprobaciones geométricas no detectaban: durante la disolución, el tramo aéreo seguía pintándose encima de las primeras calles de Viena. La causa era aplicar la opacidad general del mapa a toda la capa, sin cerrar antes sus elementos de vuelo. Ahora traza, rótulos y avión se retiran suavemente antes de que domine el plano urbano, y el título del panel acompaña la fase de ciudad. Una regresión comprueba que desde `p=.68` la traza está a cero y el panel identifica «VIENA · CENTRO». También se reserva el símbolo de llegada en la distribución para que el avión no tape Cortina al finalizar el vuelo.

## Datos y procedencia

- **Natural Earth, dominio público:** límites 1:50m desde `world-atlas`, con simplificación topológica existente. Ciudades de `ne_10m_populated_places_simple.geojson`, revisión `ca96624a56bd078437bca8184e78163e5039ad19`; SHA-256 `fd3fa867a320cbd5c5b6bb5bc550afeec2939fb2cef688e508007282a55ac42f`. La selección usa nombre **y país** para excluir homónimos de EE. UU./Canadá.
- **GeoNames, CC BY 4.0:** distribución `geonamescache 3.0.2` (leída como datos, sin ejecutar su código); SHA-256 del wheel `b830e8942f2d58c7e68782dcf4dff2ffe8c4104a35ee881ed1ad4023cefcdba4`. Cortina d’Ampezzo: registro **3177952**, 12.13903°E, 46.5369°N.
- Paros y Mallorca: centroides de sus polígonos reales en Grecia/España. Montenegro: referencia del país. País Vasco: referencia regional derivada de sus tres capitales provinciales (GeoNames 3104499, 3110044, 3128026); no se afirma haber visitado esas ciudades.
- `src/data/europe-places.json` conserva 27 referencias con fuente/país/identificador. Reikiavik está disponible como referencia pero queda fuera del encuadre; no se añade un recuadro ni se amplía por Islandia o Lanzarote. Los diez lugares anteriores dentro del marco son Niza, Londres, Roma, Florencia, Lisboa, Cortina, Mallorca, Paros, Montenegro y País Vasco.
- Reproducción: `node scripts/build-europe-data.mjs` y `node scripts/build-europe-places.mjs /ruta/al/natural-earth.geojson /ruta/a/geonames-selected.json`. El segundo JSON es un array de los cuatro registros indicados de `geonamescache/data/cities5000.json` del wheel, conservando sus campos originales. El constructor comprueba el hash de Natural Earth y conserva los identificadores de GeoNames.
- Las fuentes y la distinción entre punto urbano/referencia regional están disponibles en «Datos y precisión». La conexión aérea es ilustrativa y no representa una ruta de vuelo contratada. El mapa de Viena y la precisión aproximada del alojamiento conservan su fuente y comportamiento.


## Resultado de la validación final

- `npm run validate`: **22 pruebas unitarias + 28 de navegador + 1 offline = 51 aprobadas**, con compilaciones de producción y HTML autónomo.
- Comprobaciones del mapa en 1440×1000, 390×844, 320×700 y 1000×650: diez lugares anteriores y Edimburgo/Copenhague presentes, coordenadas conservadas, cajas de texto reales sin solaparse, destino oculto antes de llegada y ausencia de trazado guía. Avión a menos de 1 px del extremo real de la ruta SVG, incluyendo zoom y retroceso.
- Continuidad de rótulos comprobada al despegar, llegar y acercarse a Viena. La traza es invisible antes de entrar en el plano urbano; la nueva tarjeta final conserva 32 px de título sin recortes y no contiene imagen, SVG ni placeholder.
- Recorrido completo adicional con rueda: escritorio, móvil, horizontal y movimiento reducido; **96 capturas**, final alcanzado en los cuatro casos, cero errores JavaScript y cero muestras de overflow horizontal, incluidos retroceso y rotación.
- Exportación abierta con el navegador sin conexión, sin servidor ni peticiones HTTP. Las cinco fotografías incrustadas coinciden byte a byte con los originales. El ZIP contiene únicamente `Viena.html` y `LEEME.txt`, y su HTML coincide con el probado.
- Se han revisado también la carta, timeline, alojamiento, ballet, resumen, descargas de calendario/datos y accesibilidad. La cartografía urbana y la referencia aproximada del alojamiento conservan su validación previa.
- Alcance de las pruebas: Chromium con tamaños emulados; no se han probado Safari ni dispositivos físicos. Los tiempos de tareas de la simulación se conservan como diagnóstico, sin presentarlos como una medición de fluidez en otros equipos.

## Evidencias

- [Mapa anterior en móvil](qa/europe-before-mobile.png).
- [Mapa nuevo en escritorio](qa/europe-reveal-desktop.png) y [móvil](qa/europe-reveal-mobile.png).
- [Llegada a Viena](qa/europe-arrival-mobile.png) y [transición al mapa urbano sin traza aérea](qa/europe-city-transition.png).
- [Tarjeta final](qa/sofi28-final-card.png) y [composición a 320 px](qa/sofi28-final-card-narrow.png).
- [Registro del flujo](qa/europe-reveal-flow.json). Capturas originales en `artifacts/europe-map/final-flow/`.
- [Recibo de la entrega privada](qa/timeline-photo-delivery.json).


## Entrega privada verificada

- Código, evidencias y ZIP subidos a `private-download`, commit `9723b9476eeef92e16c22fa68b9d989aff61235a`. [Descargar esta versión](https://github.com/MSaula/Sofi28/raw/9723b9476eeef92e16c22fa68b9d989aff61235a/downloads/Viena.zip).
- El ZIP recuperado de GitHub coincide byte a byte con el local y contiene el HTML final validado (SHA-256 `f627bb45749f045cd241955f905fdfeb1c08ff9ce58d7204aa9442efeb7adbf0`). Las cinco fotografías remotas conservan sus hashes originales.
- La descarga sin credenciales responde **404**. El acceso sigue dependiendo de una cuenta autorizada en el repositorio.
- `main` permanece en `66e6acd5e8f016ff52ae78eee758054b26b1a0d6` y `gh-pages` en `a276f224e4072e3f60879ed3cc6025304c551322`. No se ha actualizado la vista pública ni la configuración del entorno.
