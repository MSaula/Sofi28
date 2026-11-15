# Viena — del montaje cinematográfico a los lugares

## Objetivo

Sustituir por completo «Una ciudad. Todo por descubrir» por una secuencia de scrollytelling que combine monumentos, calles, cafés y restaurantes de los dos estudios. Después, recuperar el desplazamiento vertical normal y ofrecer una galería horizontal de lugares, con acceso al mismo mapa interactivo ya validado.

La composición se decide antes de implementar la animación: cuatro actos con identidad y respiraciones propias, una entrada y una salida claras, fotografías reales y una única línea de progreso reversible. Se mantienen la carta, cronología, viaje, apartamento, ballet y resumen.

## Referencias profesionales consultadas

Consultadas el 15/11/2026; las tres fuentes responden HTTP 200. Se conservan HTML, título y hash en `/workspace/artifacts/city-reference`.

- [Apple MacBook Pro](https://www.apple.com/macbook-pro/): dirección general ya elegida por el usuario; jerarquía de pocas palabras, visual dominante y separación entre revelación y exploración. Se adopta la claridad de la composición, no una reproducción de su producto o de su código.
- [Apple AirPods Pro 3](https://www.apple.com/airpods-pro/): organización en escenas de gran escala, detalle y pausas editoriales. Se toma como referencia de ritmo y de convivencia entre relato y módulos de información.
- [The Modern House Journal](https://themodernhouse.com/journal): fotografía arquitectónica y de interiores con diferentes escalas. Se combina espacio completo, encuadre íntimo y detalle para que la ciudad no sea solo una sucesión de postales.

La consulta de estas fuentes fundamenta la dirección visual; no se presenta como una auditoría de rendimiento de las páginas ajenas.

## Estrategia narrativa y de movimiento

1. **Entrada. «Viena. A nuestra manera».** Encabezado limpio y una invitación a bajar. Un enlace permite ir directamente a los lugares. El Belvedere empieza en un encuadre contenido y se abre hasta llenar la pantalla.
2. **01 · La ciudad que impresiona.** Belvedere como imagen dominante; Hofburg y Karlskirche aparecen en dos ventanas laterales. El contraste de escala convierte tres monumentos en una composición, no en tres diapositivas.
3. **02 · Perdernos un poco.** Dos perspectivas verticales de Griechengasse y Gutenberggasse. La mirada pasa de la escala monumental a la proximidad del pavimento y las fachadas.
4. **03 · Una pausa también es un plan.** Balthasar y &flora combinan barra de café y mesas de color. Se identifican los espacios por su nombre, sin sugerir que son el mismo local ni que hay una reserva.
5. **04 · Cambiar de perspectiva.** El interior y los ventanales de Das LOFT devuelven la mirada a la ciudad. El encuadre se recoge suavemente antes de liberar la sección hacia la galería.
6. **Exploración.** 29 referencias editoriales: 12 lugares emblemáticos, 7 calles/pasajes, 4 cafés y 6 restaurantes. Filtros, tarjetas grandes, descripción y fotografía ampliable. Es una selección de los dos estudios; el mapa conserva sus 32 puntos geográficamente validados.

### Un reloj, cuatro actos

- Escena fijada de aproximadamente seis pantallas de recorrido útil, con scroll nativo. No se intercepta la rueda ni se convierten las tarjetas en un nuevo tramo obligatorio de scroll vertical.
- Apertura inicial 0–0,105; transiciones laterales 0,215–0,305, 0,445–0,535 y 0,675–0,765; recogida final 0,915–1.
- Las placas entrantes cubren progresivamente a las anteriores. La saliente se desplaza menos que la entrante para crear profundidad. La superposición asegura cobertura completa: ningún fundido deja el escenario vacío.
- Borde fino en la unión y encuadres internos contenidos. Las fotos permanecen montadas; no aparecen ni desaparecen por un umbral de renderizado.
- Cámara, apertura, rótulos y progreso se derivan de la misma función pura. Sin transiciones CSS añadidas a valores ligados al scroll: evitarían que imagen y texto coincidieran al avanzar rápido o retroceder.
- Las fotos necesarias se solicitan antes de entrar en el tramo y se conservan disponibles. El movimiento reducido y las pantallas bajas ofrecen una composición estática legible, seguida de la misma galería.

## Integración y datos

- Componente `City` independiente, con estilo acotado a la sección. Reutilizar los originales ya existentes de los monumentos; añadir solo las fotos nuevas seleccionadas, conservando bytes y procedencia.
- Modelo editorial separado del catálogo geográfico. No inventar coordenadas o tiempos a pie para cafés y calles que todavía no están en el mapa.
- Una sola instancia de `ViennaExplorer`, compartida desde la aplicación. La entrada al mapa conserva el contexto del botón de origen. Cerrar tras un cambio de tamaño desde la galería debe volver a la ciudad, no a la escena del vuelo.
- Añadir la ciudad al menú y actualizar los créditos que aún describen sus imágenes como ilustraciones conceptuales.
- Galería horizontal disponible también en PC: botones con extremos deshabilitados, teclado, desplazamiento táctil/trackpad y filtros que restablecen correctamente el inicio. La rueda vertical sigue bajando por la página.
- Versión autónoma sin solicitudes HTTP. Mantener las fotos personales y del apartamento, los datos de los dos estudios y las 32 rutas anteriores.

## Cambios localizados y aceptación

- [x] Selección editorial, imágenes y trazabilidad.
- [x] Modelo de movimiento continuo y reversible.
- [x] Montaje y versión de movimiento reducido.
- [x] Galería, filtros y visor fotográfico.
- [x] Mapa único, retorno al origen y navegación.
- [x] Pruebas de continuidad, geometría visible, interacción y acceso sin red.
- [x] Recorrido completo, revisión visual y correcciones de lo observado.
- [x] Compilaciones y entrega privada actualizada, sin despliegue público.

## Validación prevista

Muestrear la secuencia en avance y retroceso, con pasos pequeños alrededor de cada transición. Comprobar cobertura, continuidad, límites de cámara y ausencia de saltos en opacidad/posición; observar capturas y una grabación real de scroll. Revisar PC 1440×1000, portátil 1280×800, móvil 390×844, 320 px y horizontal bajo; además de movimiento reducido y cambios de orientación.

Comprobar filtros, primera/última tarjeta, teclado, imágenes y fuentes, modal fotográfico, mapa desde ambos puntos de entrada, vuelta de foco y conservación del capítulo tras redimensionar. Ejecutar las regresiones existentes, las comprobaciones nuevas, las dos compilaciones y el documento autónomo sin conexión. Registrar defectos reales, causa, corrección y resultado; no afirmar una garantía de 60 fps ni una prueba en navegadores no ejecutados.


## Incidencias observadas y corrección validada

| Problema observado | Causa | Corrección | Validación |
| --- | --- | --- | --- |
| Marco de &flora vacío con la foto pendiente | La ventana podía entrar en pantalla antes de la decodificación | Solicitud anticipada con prioridad baja; el marco aparece solo tras decodificar, con entrada suave de 250 ms | Prueba de red retrasada y capturas finales |
| El cierre del encuadre cortaba rótulos | HUD y créditos seguían visibles durante la recogida | Desvanecer ambos antes del cierre; elevar el último rótulo lateral | Avance/retroceso, PC y móvil |
| La unión del mosaico no coincidía con la reducción del protagonista | Desplazamiento lateral del 110 % frente al ancho reservado | Ajustar al 100 % y compartir la curva del mosaico | Cobertura geométrica continua y muestreo DOM |
| El final destacaba demasiado a unos comensales | Selección de la primera imagen de Das LOFT | Usar la segunda imagen ya indexada: mirada hacia Stephansdom | Revisión visual del acto final y de las 29 fotos |
| Faltaba la foto de Das LOFT durante la preparación | Se había supuesto JPEG por la URL, aunque el original es WebP | Extensión tomada del archivo indexado, bytes y SHA originales | Test de datos y hashes offline de las 59 fotos |
| Algunos encuadres de tarjeta restaban fuerza al lugar | Exceso de cielo en Hofburg; taza desplazada en Kaffeefabrik | Ajustar solo el encuadre CSS; visor conserva original completo | Contactos de todas las tarjetas y galería final |
| El mapa podía devolver a la llegada al cerrarlo desde la ciudad tras redimensionar | Retorno codificado para el antiguo único acceso | Instancia compartida, contexto de origen y sección semántica de galería | Tres accesos, rotación, cierre/foco; nueve regresiones previas del mapa |
| Conteo de filtros con contraste insuficiente (4,02:1) | Opacidad reducida sobre gris | Mantener color sin reducir opacidad | axe sin infracciones serias/críticas |
| Prueba de título ambigua al abrir la foto de TIAN | Selector encontraba la tarjeta y el visor | Acotar la comprobación al diálogo activo | Los diez casos nuevos pasan; sin cambio visual innecesario |

## Resultado de validación

- **93 pruebas únicas aprobadas:** 36 unitarias, 56 end to end y una del HTML autónomo sin conexión. Incluyen 13 pruebas nuevas de ciudad (3 unitarias y 10 de navegador).
- Dos compilaciones aprobadas. La prueba autónoma comprueba la navegación, montaje, mapa compartido y hashes de fotos sin servidor ni peticiones HTTP.
- **Recorrido completo con rueda real:** PC, móvil, horizontal y movimiento reducido llegan al resumen. Cero errores JavaScript y cero desbordamientos en 303 muestras; se comprueban además retroceso y rotación.
- **Revisión específica:** seis viewports/modos, 44 estados de las animaciones, fotos decodificadas y cero respuestas HTTP erróneas. Inspección de encuadres, límites, legibilidad y grabación con avance y retroceso.
- Control de cadencia sin grabador: mediana **16,8 ms**, p95 **50,1 ms**, máximo **83,3 ms**, sin Long Tasks durante ese tramo. Con grabación: mediana 33,4 ms y p95 66,6 ms. El entorno y el grabador afectan a la medida; no se promete 60 fps. Las tareas de redimensionado del recorrido global se conservan en el registro, incluyendo un pico de 512 ms al rotar en movimiento reducido.
- Se mantienen sin cambios los tres ZIP de investigación, los archivos públicos previos y los datos geográficos/rutas. Se añaden 17 originales; el HTML contiene 59 fotos únicas, sin recomprimirlas.
- Se entrega en el repositorio privado y se actualiza `downloads/Viena.zip`. No se ejecuta despliegue público ni se modifican `main` o `gh-pages`.

Evidencia: [resultados](qa/city-validation.json), [flujo completo](qa/city-full-flow.json), [revisión visual](qa/city-visual-review.json), [E2E](qa/city-e2e.log), [offline](qa/city-standalone.log), [grabación](qa/city-scroll-desktop.webm). Capturas finales: [palacios](qa/city-palaces.png), [calles](qa/city-streets.png), [café](qa/city-coffee.png), [skyline](qa/city-skyline.png), [galería](qa/city-gallery.png) y [móvil](qa/city-mobile.png). La entrega y su verificación remota se registran en [el recibo](qa/city-cinema-delivery.json).
