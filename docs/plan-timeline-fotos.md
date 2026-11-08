# Timeline fotográfico — composición, integración y validación

## Propósito y decisión de diseño

La cronología conserva su narrativa: vista global desde 2022, acercamiento al primer regalo, recorrido horizontal, enero de 2027 y fechas 22–24. Los regalos permanecen arriba y los demás viajes debajo.

Las cinco fotos mostradas en el mensaje son verticales (3:4). El encuadre incluye a la pareja y elementos importantes del destino. Un recorte cuadrado de 44–64 px, como el anterior, da prioridad al rótulo y reduce mucho el recuerdo. Se propone una tarjeta horizontal editorial: fotografía vertical amplia, proporción completa, y columna tipográfica con edición, destino y fecha. Sin texto sobre las caras, inclinaciones ni marcos ornamentales. Blanco, negro suave y azul mantienen la dirección visual existente.

En la vista global se conservan las etiquetas pequeñas. El acercamiento abre foto, márgenes y tipografía juntos. La tarjeta se adapta al espacio real: puede mostrar una foto de aproximadamente 230×307 px en escritorio y 175×233 px en móvil, frente a los 44–64 px anteriores. Son objetivos de composición, que se contrastarán con los tamaños reales del navegador. Sofi 28 conserva un espacio pendiente; no se le asigna una foto de otro viaje.

## Archivos recibidos

Se ven cinco imágenes en el mensaje, pero inicialmente no hay archivos binarios ni nombres de esas imágenes disponibles en `/workspace/attachments`, los directorios compartidos ni el repositorio. Solo está el PDF previo. Se ha solicitado un ZIP o archivos originales conservando sus nombres mientras se avanza el diseño. No asociar una foto a un lugar basándose exclusivamente en su orden ni crear sustitutos de las imágenes reales.

## Cambios localizados

1. Modelo del timeline: separar tamaño histórico, foto y tarjeta futura; calcularlos con el ancho/alto medido y reservar el espacio completo de tarjeta, calendario y etiquetas.
2. Tarjetas: HTML para tipografía, fotos con texto alternativo y composición flexible; SVG para meses, eje, conectores y mapa temporal. Ambas capas utilizan las mismas coordenadas.
3. Apertura: foto, separación y texto crecen con el mismo progreso. Recorte de marco durante apertura, sin que la imagen pase por encima del texto.
4. Cámara y colisiones: recalcular el encuadre según el tamaño de las nuevas tarjetas; mantener prioritario el evento cercano al centro y los bordes dentro del lienzo.
5. Espacio: las fechas finales solo reservan su altura cuando aparecen. El mes final conserva tamaño y lectura; las fotos históricas se desvanecen antes de ese zoom.
6. Fotografías reales: identificar cada archivo por nombre, copiarlo con un nombre estable local, asociarlo al destino correcto y revisar el encuadre. Mantener proporción y fotografía original. Verificar carga normal y exportación offline.
7. Alternativa estática: reutilizar las mismas tarjetas y datos en horizontal/pantalla baja y movimiento reducido; respetar fotos completas y orden.
8. Validación: modelo, geometría, imágenes, fases intermedias, recorrido inverso, orientación, accesibilidad, regresiones completas y exportación sin red. Revisar visualmente cada foto real cuando esté disponible.

## Seguimiento

- [x] Análisis del estado anterior y elección de composición.
- [x] Modelo de tamaños y cámara.
- [x] Tarjetas grandes y vista estática.
- [ ] Archivos reales recibidos y asociados por nombre.
- [ ] Encuadres y carga de las cinco fotos comprobados.
- [x] Pruebas localizadas y revisión visual de las fases con espacios de foto.
- [x] Regresión end to end y exportación offline del borrador.
- [ ] Entrega de la versión con las cinco fotos reales incorporadas y validadas.

## Implementación y validación del borrador

- Tarjeta histórica medida: **440×352 px**, con fotografía de **246×328 px**, a 1440×1000. En móvil 390×844: tarjeta de **315×265 px** y fotografía de **181×241 px**. El marco conserva la proporción 3:4 y `object-fit: contain`; el encuadre de cada archivo real debe comprobarse al recibirlo.
- Las fotos y la tipografía se renderizan con HTML; el calendario y los conectores SVG utilizan las mismas coordenadas del modelo. No hay imágenes superpuestas sobre el texto.
- La fecha final reserva 0 px durante la historia y recupera 64/72 px al aparecer. Las tarjetas históricas terminan de desaparecer antes del zoom final. El regalo futuro tiene su propio tamaño, conservando espacio para el mes.
- La alternativa estática usa la misma imagen y proporción; se elimina la duplicación del listado para lectores de pantalla. El texto alternativo de una foto configurada se incorpora al listado accesible del recorrido animado.
- El auditor se ha actualizado para observar también títulos HTML, dimensiones de las fotos y su estado de carga. Las comprobaciones offline recorren los cinco momentos de las fotos y comprueban los recursos configurados, además del resto de la experiencia.
- `npm run validate`: **16 pruebas unitarias + 15 de navegador + 1 offline = 32 aprobadas**, compilación incluida. Después de reforzar el contrato de recursos configurables y el recorrido offline de los cinco recuerdos: **16/16 unitarias y 1/1 offline aprobadas** de nuevo.
- Validación localizada: **4/4 pruebas aprobadas** de bandas, colisiones, separación foto/texto, pantallas estrechas y vista estática. La prueba adicional de tamaño fotográfico, retorno y espacio de fecha también ha pasado en la ronda completa.
- El recorrido completo con rueda, sentido inverso y rotación llega al final en escritorio, móvil, horizontal y movimiento reducido: **0 errores JavaScript, 0 posiciones con overflow**, 80 capturas de fases. Dos tareas de unos 51 ms en el recorrido móvil medido; las rotaciones y capturas añaden otras tareas. Son diagnósticos de Chromium, no una garantía de rendimiento en un teléfono físico.
- **Límite de esta validación:** hay **0 fotos reales configuradas** porque los archivos no están disponibles. Las pruebas anteriores verifican composición, espacios, contrato de carga y regresiones del borrador; no certifican aún asociación, decodificación ni encuadre de los originales. La vista previa publicada conserva la entrega anterior mientras se completa esta incorporación.

## Evidencia para revisión

- [Composición en escritorio: global, apertura, cinco cumpleaños y final](qa/timeline-photo-layout-desktop.jpg).
- [Las mismas fases en móvil](qa/timeline-photo-layout-mobile.jpg).
- [Alternativa con movimiento reducido](qa/timeline-photo-layout-static.jpg).
- [Resumen del recorrido, orientación y presencia de imágenes](qa/timeline-photo-layout-flow.json).
- Capturas originales: `artifacts/timeline-photos/`. Auditoría detallada: `artifacts/timeline-photos/flow/flow-report.json`. Son artefactos locales ignorados por Git.

## Siguiente paso necesario

Recibir un ZIP con las cinco fotografías originales conservando sus nombres. A partir de esos archivos: asociar cada imagen por nombre a Niza, Londres, Islandia, Dolomitas y Florencia; revisar el encuadre y la carga en todos los tamaños; confirmar la exportación offline con cinco imágenes reales; y entregar la versión completa. No se han inferido nombres ni generado fotografías de reemplazo.
