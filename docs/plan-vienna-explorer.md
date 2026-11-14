# Viena — mapa de descubrimiento del regalo

## Objetivo y composición

Convertir el mapa en una entrada a la ciudad, conservando la llegada cinematográfica y el recorrido normal de la página. El catálogo de investigación tiene 32 lugares y 34 fotografías; se incorpora una fotografía representativa por lugar.

Cinco hitos tienen icono y rótulo protagonistas: Belvedere Superior, Wiener Staatsoper, Hofburg/Heldenplatz, Stephansdom y Karlskirche. Los secundarios usan puntos discretos; sus nombres aparecen al señalar o enfocar. Una lista buscable garantiza acceso a todos, incluidos lugares muy próximos. Las coordenadas no se desplazan para encajar rótulos.

El apartamento tiene un símbolo propio, capa superior y espacio reservado para su nombre. La vista amplia de exploración separa mapa y ficha en escritorio, evitando que la tarjeta tape la ubicación. El mapa ofrece zoom y arrastre deliberados; la rueda conserva el comportamiento normal del relato fuera del visor.

Al seleccionar un lugar: foto real, nombre, descripción breve, metros y minutos a pie desde el punto del apartamento. Se destaca únicamente ese recorrido; la selección se conserva sincronizada entre mapa, lista, foto y métricas. La imagen y el trazado deben quedar disponibles sin conexión.

## Fuentes y precisión

- El origen sigue siendo el punto público de Airbnb aceptado por el usuario, 48.20926, 16.39508. La plataforma lo clasifica como aproximado.
- Contrastar los 32 puntos con OpenStreetMap/Nominatim, especialmente las referencias generales del informe. Belvedere debe señalar el palacio Superior que aparece en su foto; no el centro genérico del complejo. Ópera y Secession carecen de coordenada en la ficha previa y requieren una fuente nueva.
- Usar un enrutador peatonal real y conservar sus respuestas. No transformar distancias en línea recta ni la geometría simplificada de calles en un supuesto recorrido a pie.
- Presentar metros redondeados y minutos orientativos. Registrar extremos ajustados a la red, diferencias con el punto geográfico, fecha y método; revisar desviaciones excesivas y trazados discontinuos.
- Fotos originales del índice con procedencia, autor, licencia y hash. Mantener las advertencias relevantes de Café Central y Palais Ferstel.
- Cartografía y rutas preparadas localmente: ninguna petición automática a servicios de mapas durante la experiencia.

## Cambios localizados y aceptación

- [x] Puntos geográficos, fuentes y fotografías.
- [x] Rutas peatonales, extremos y métricas contrastadas.
- [x] Modelo cartográfico, jerarquía y colocación de rótulos.
- [x] Visor de escritorio, ficha y lista; adaptación móvil/teclado.
- [x] Integración con la escena existente sin anticipar Viena.
- [x] Pruebas locales de datos, geometría y selección.
- [x] Revisión visual y end to end: scroll, retroceso, rotación, visor y versión offline.
- [x] Entrega privada verificada, sin desplegar la rama pública.

## Criterios de validación

Todas las coordenadas corresponden a los lugares nombrados. Las cinco referencias principales y el apartamento están visibles al abrir la vista general, sin rótulos superpuestos. Ninguna tarjeta oculta el apartamento. Los 32 lugares son accesibles por lista y teclado; la selección cambia conjuntamente fotografía, texto, ruta y métricas. Escape, cierre y retorno de foco funcionan; el documento del fondo permanece estable al explorar.

La carta, la cronología, el vuelo, el apartamento, el ballet y el resumen mantienen su flujo. La versión autónoma conserva fotos, mapa, interacción y rutas sin HTTP. No se presenta la precisión de la ruta como dirección verificada de la reserva.


## Decisiones UX implementadas

- La escena cinematográfica conserva su encuadre y su scroll nativo. Los puntos que caben en ella son seleccionables; la vista amplia reúne los 32 y permite explorar sin competir con el scroll fijado del relato. El botón solo está disponible al completar la revelación del alojamiento. Los marcadores inactivos no reciben foco ni eventos del puntero.
- En PC, el mapa y la ficha ocupan columnas separadas. El apartamento es azul, con halo y rótulo propio; los cinco hitos tienen discos claros, icono y nombres cortos. Los 27 secundarios son puntos pequeños con nombre al señalar/enfocar. Las etiquetas se colocan sin mover las coordenadas. Los hitos y el apartamento se ven juntos al abrir la vista general.
- La rueda no dispara zoom. El usuario arrastra, utiliza +/− o el teclado; «Vista general» recupera el conjunto y «Ver recorrido» encuadra origen y destino. Un zoom o arrastre manual puede sacar puntos del encuadre, como en un mapa convencional; los controles de encuadre permiten recuperarlos.
- La lista buscable resuelve los lugares muy próximos sin saturar el mapa con 32 rótulos. Cada ficha mantiene foto real, descripción y métricas derivadas de la misma selección. Las fotos se solicitan al servidor local cuando se necesitan; la exportación contiene las 32 sin pérdida de sus originales.
- La cámara interpola una sola transformación numérica compartida por cartografía, ruta y puntos. Cambiar de lugar cancela el movimiento anterior. En movimiento reducido los cambios son inmediatos.
- En móvil, el mapa queda encima de la ficha en vez de taparla. Al cerrar después de cambiar orientación, se restaura el mapa del relato y un control válido, incluso si el botón original cambió de versión responsive.

## Problemas observados y resolución

| Problema | Causa y corrección | Validación |
| --- | --- | --- |
| Belvedere señalaba el conjunto genérico; otras fichas carecían de coordenadas. | Se revisan los objetos de OSM. Belvedere Superior es way 5887599; Ópera, way 8097595; Secession, way 25371168, no la boca de metro del mismo nombre. | IDs y coordenadas fijados en datos y pruebas; objetos públicos enlazados. |
| Una búsqueda de Kunst Haus Wien devolvía otra galería. | Se descarta ese resultado. KunstHausWien es way 342113776 en Untere Weißgerberstraße. | Coordenada este >16.39 y objeto verificado. |
| El informe representaba el Stadtpark en general, no el monumento fotografiado. | Se usa el objeto Johann Strauß, node 262932599. Hofburg se referencia en Neue Burg y Palmenhaus en el edificio del Burggarten. | Comprobación de nombre/tipo y geometría de cada candidato. |
| Las distancias en línea recta no describen un paseo. | Rutas del endpoint routed-foot de FOSSGIS/OSRM, guardadas antes de la visita. | Las 32 longitudes se comparan con sus polilíneas y sus extremos. Origen ajustado a 8.8 m; máximo ajuste de destino 60.71 m. |
| Un trazo animado podía parecer incompleto al hacer zoom. | pathLength normalizado y non-scaling-stroke no conservaban el avance visual bajo escala. La línea azul usa grosor inverso a la escala y la misma transformación que el mapa. | Se comprueba que puntos al 20/50/80/95% pertenecen al trazo pintado en las 32 rutas y durante cambios de zoom. |
| Cerrar tras girar a una pantalla baja podía devolver al lector fuera del mapa. | Cambian las alturas de los capítulos y el botón original puede desmontarse. Se restaura la versión actual del mapa y su foco; en horizontal se alinea la parte inferior del panel para que el control siga visible. | PC→móvil→320px→horizontal→cierre→PC. |
| Una prueba comparaba una ruta del visor con un marcador de la escena de fondo. | El selector global encontraba el primer mapa. Se acota al SVG de la ruta y se comprueba la transformación real. | Comparación de los extremos dentro de la misma instancia, sin confundir las cámaras. |

La licencia se contrastó con ows:Fees de las capacidades WFS: el servicio anuncia CC BY 3.0 AT. No se sustituye por una suposición de CC BY 4.0. Las capas conservan IDs y hashes de sus respuestas.

Una ejecución de pruebas en paralelo desde dos procesos independientes compartía test-results y borraba trazas del otro proceso. La validación final ejecuta navegador y standalone en secuencia; ese fallo de infraestructura no se trata como un defecto de la aplicación.


## Resultado final

**80 pruebas únicas aprobadas:** 33 unitarias, 37 regresiones previas de navegador, 9 del mapa y 1 de exportación offline. La suite completa inicial pasó 79; después se incorporó y pasó la regresión adicional de selección por proximidad, y se repitieron las nueve pruebas del mapa y la exportación sobre las fuentes finales. Las dos compilaciones de producción se reconstruyeron.

La selección mediante puntero también se resuelve por la coordenada más próxima en la escena y en el visor: los círculos de interacción de puntos cercanos no desvían un clic hacia el vecino que se haya dibujado encima. El nombre al mover el puntero sigue el mismo criterio. La regresión pulsa Palais Ferstel y Café Central en tamaños estrechos. El teclado selecciona el punto enfocado.

Se completa el recorrido de rueda en escritorio 1440×1000, móvil 390×844, horizontal 844×390 y movimiento reducido. Los cuatro llegan al final sin errores JavaScript ni overflow horizontal, también tras retroceso y rotación; 120 estados capturados. La revisión adicional incluye 320×700 y 1000×650.

El visor y todas las fotos/rutas funcionan sin HTTP en el documento autónomo. Las pruebas comparan los 32 JPEG incrustados con sus originales y conservan las cinco fotos personales y las cinco del apartamento. El HTML final pesa aproximadamente 40.1 MB sin comprimir; el ZIP aproximadamente 28.7 MB. No se reducen ni retocan las fotos para ocultar ese coste. El build normal sirve cada foto cuando se necesita.

Axe no detecta infracciones graves/críticas en la vista general, la ficha seleccionada ni la lista. Las pruebas usan Chromium y viewports emulados; no equivalen a una certificación de accesibilidad, 60 fps garantizados o revisión en Safari/dispositivos físicos. Se conserva el aviso de bundle grande por los datos cartográficos locales.

- [Resumen de las verificaciones](qa/vienna-explorer-review.json).
- [Rutas: distancias, tiempos, extremos y contraste geométrico](qa/vienna-walk-validation.json).
- [Vista general de escritorio](qa/vienna-explorer-desktop-overview.png).
- [Ficha y recorrido al Belvedere](qa/vienna-explorer-desktop-belvedere.png).
- [Recorrido cercano a Kunst Haus Wien](qa/vienna-explorer-desktop-kunsthaus.png).
- [Versión móvil](qa/vienna-explorer-mobile-belvedere.png).
- [Integración en la historia](qa/vienna-explorer-desktop-story.png).

Los informes independientes del Airbnb y del índice visual de Viena conservan sus archivos anteriores. La entrega actualiza solo la web del regalo y su ZIP privado.


## Entrega privada verificada

Commit 9dcdaa6c57d651e5f9d6485b64122722f9cd582a subido y recuperado de private-download. El ZIP remoto coincide byte a byte con el local y su HTML con el probado. Se verifican los 42 JPEG remotos y los 42 incrustados contra sus hashes originales. La descarga anónima responde 404. main y gh-pages conservan sus referencias anteriores; los dos informes independientes mantienen sus archivos.

[Descargar esta versión de la web](https://github.com/MSaula/Sofi28/raw/9dcdaa6c57d651e5f9d6485b64122722f9cd582a/downloads/Viena.zip). El recibo con tamaños, hashes y alcance está en [timeline-photo-delivery.json](qa/timeline-photo-delivery.json).
