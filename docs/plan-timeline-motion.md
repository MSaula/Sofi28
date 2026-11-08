# Timeline — entradas, salidas y zoom continuos

## Problema reproducido

Se mantiene la composición fotográfica aprobada y los originales. Cambia únicamente la continuidad del recorrido.

En el modelo anterior, a 331 px de ancho, la tarjeta de Londres aparece completa en `p=0.26`: su punto está en x=312.9 pero la tarjeta se fuerza a x=165.5. En `p=0.30`, el punto ya está en x=41.3 y la tarjeta sigue en x=165.5. En `p=0.31` deja de existir. No es un problema de duración de una transición CSS: el cálculo fija el centro al borde y filtra por el punto del mes, sin considerar el ancho de la tarjeta.

Otros dos mecanismos añaden saltos: la selección discreta de etiquetas que caben puede cambiar al acercarse la cámara, y la fecha dentro de cada tarjeta se inserta al superar un umbral de apertura. Las fotografías tampoco se montan hasta empezar el zoom.

## Cambios localizados

1. Anclar siempre la tarjeta al centro real de su mes. Eliminar el límite que detiene su centro y mantener los elementos montados al atravesar la ventana. Ajustar el margen global para que los extremos se lean en la vista inicial.
2. Sustituir la aparición/desaparición binaria por opacidades continuas para etiquetas próximas. Mantener los viajes ordinarios legibles durante el recorrido y evitar colisiones entre rótulos con presencia dominante.
3. Incorporar una ventana lateral con un degradado estrecho y un límite visual muy sutil. Permitir tarjetas parcialmente visibles durante la entrada y la salida; no impedir que crucen el borde.
4. Mantener fotos y fechas en el DOM, reservando su espacio de forma continua durante la apertura. Cargar las cinco fotografías antes de su entrada y conservar el mismo elemento al invertir el scroll.
5. Actualizar las comprobaciones que exigían tarjetas completamente dentro del lienzo: ahora se validan el recorte correcto, la continuidad con el mes, la ausencia de overflow de la página, la legibilidad en el centro y el final del calendario.
6. Revisar secuencias densas de zoom, desplazamiento e inversión, además de la regresión completa y el HTML sin conexión. Actualizar únicamente la entrega privada autorizada, sin cambios en Pages.

## Seguimiento

- [x] Causa raíz identificada y medición anterior documentada.
- [x] Regresión visual reproducida en navegador.
- [x] Movimiento, opacidades, apertura y bordes suaves.
- [x] Revisión visual y pruebas específicas en escritorio, móvil y portátil bajo.
- [x] Regresión completa y exportación offline.
- [ ] ZIP privado actualizado y verificado.

## Correcciones y comprobaciones

- La regresión de entrada parcial falló antes de la corrección: Londres no existía en `p=0.25` aunque una parte de su rectángulo debía verse. Con la corrección pasa en 1440×1000, 390×844, 320×700 y 1000×650; el centro de la tarjeta sigue al centro de su mes durante entrada, salida y retorno.
- Los 16 eventos permanecen montados; las seis tarjetas de cumpleaños y las cinco imágenes conservan su identidad. Se han eliminado tanto el clamp horizontal como el filtro basado en el punto del mes. El zoom global gana margen lateral y el recorrido pasa por una máscara estrecha con un límite de 1 px muy sutil.
- La selección binaria de rótulos se sustituye por opacidad continua. Los regalos tienen prioridad estable durante la vista global; los otros viajes se cruzan gradualmente según la cercanía al centro. El intervalo de cruce se amplió después de detectar que etiquetas separadas por un mes aún cambiaban demasiado deprisa. Los quince viajes siguen siendo descubribles y los rótulos con presencia dominante no se solapan.
- Foto y fecha están siempre en el DOM. La foto se descarga desde el inicio; tamaño, opacidad, fecha y separación crecen con el progreso. Se evita la inserción de un tercer elemento que alteraba de golpe el centrado vertical del texto.
- La reproducción con rueda detectó otro detalle: al cambiar la altura de las fechas finales, el SVG se escalaba antes de actualizar su `viewBox`, mientras las tarjetas HTML seguían en píxeles. En móvil la separación tarjeta/mes oscilaba hasta 1.54 px. El SVG ahora usa el mismo ancho/alto medido que sus anotaciones, evitando ese reajuste transitorio. La separación conserva sus 16 px con un error máximo observado inferior a 0.03 px.

## Validación final

- `npm run validate`: **18 pruebas unitarias + 22 pruebas de navegador + 1 offline = 41 aprobadas**, compilaciones incluidas.
- Muestreo del modelo: 10.001 posiciones por cada uno de cuatro tamaños, sin cambios de identidad, saltos de posición visibles ni variaciones bruscas de opacidad. Durante el recorrido horizontal los centros avanzan continuamente, incluso fuera de los bordes.
- Se mantienen la revisión de las cinco fotos originales, mapas, selección 22–24, ballet, accesibilidad, teclado, rotación y ausencia de overflow del flujo completo. Las pruebas del calendario se han adaptado al nuevo contrato: recortar una tarjeta al atravesar la ventana es intencional; detenerla para mantenerla entera ya no se acepta.
- Grabación real con rueda hacia abajo y hacia arriba: **276 muestras en escritorio y 232 en móvil**, 0 errores JS, 0 muestras con overflow, elementos estables y retorno al inicio. Se observaron tarjetas parcialmente visibles en 150 y 134 muestras respectivamente. Desviación horizontal máxima respecto al mes: 0.016 px; error de separación vertical visible: menos de 0.03 px.
- HTML offline abierto sin servidor ni red, con las cinco imágenes incrustadas y verificadas contra los originales. Las fotos y la composición final conservan sus proporciones.
- Las comprobaciones se realizan en Chromium y con tamaños emulados; no equivalen a una revisión en Safari ni en teléfonos físicos.

## Evidencia

- [Entrada, centro y salida en escritorio](qa/timeline-motion-desktop.jpg).
- [La misma secuencia en móvil](qa/timeline-motion-mobile.jpg).
- [Grabación móvil: zoom, avance y regreso con rueda](qa/timeline-motion-mobile.webm).
- [Mediciones de ambos recorridos](qa/timeline-motion-review.json).
- Capturas y vídeos originales: `artifacts/timeline-motion/` (no incluidos en el ZIP del regalo). La grabación de escritorio queda en ese directorio; la móvil se conserva también en las evidencias versionadas.
