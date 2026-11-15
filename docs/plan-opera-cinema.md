# Living Legacies — capítulo final del regalo

## Objetivo y secuencia aprobada

Abrir un ambiente teatral propio después de la ciudad. Primero, fotografías de arquitectura y danza; después, presentación legible de Living Legacies; finalmente, fecha, hora, plazas, mapa completo y acceso voluntario a la vista desde Mittelloge. La última fotografía del montaje se recoge hasta su posición en la composición editorial. La logística sigue con scroll normal.

## Composición antes de programar el movimiento

- Paleta continua de negro cálido, marfil, rojo profundo y dorado suave. El cambio alcanza cabecera y controles mientras el capítulo está bajo ella; se restaura al salir y al retroceder.
- Apertura con el auditorio OP47, de 5300×3520 px. Acercamiento máximo del 12 %. Proscenio editorial que enlaza con OP08 (dúo), OP01 (conjunto) y OP05 (salto). Transiciones por encuadre y luz; las figuras de producción se muestran completas.
- Una escena sticky de aproximadamente 620svh. Apertura 0–0,16; llegada a la danza 0,23–0,36; cambios 0,44–0,53 y 0,62–0,70; recogida 0,78–0,94. Pausas entre movimientos.
- La presentación editorial ocupa el estado final de ese mismo escenario. La imagen OP05 permanece en un único elemento visible: su rectángulo final se mide en el diseño real. Al liberarse el sticky, la misma composición continúa hacia arriba. No se depende de dos copias alineadas a ojo.
- Mosaico con OP05 como foto principal y OP08/OP03 secundarias. Título, descripción breve del programa triple y dos hechos sobre coreografía e institución. El nombre aparece después del montaje.
- Cierre normal con fecha derivada de la única fecha de función, fila 3, plazas 23 y 24, dirección y mapa completo de 1753 posiciones. Las coordenadas y el marco de Mittelloge proceden del informe validado. El color no expresa disponibilidad ni aforo.
- Botón con miniatura «Ver la vista desde Mittelloge», fuera de las butacas del mapa. Foto original completa en diálogo, con contexto y crédito. Fila y asiento de la cámara desconocidos. Se conservan cierre, foco y contexto tras redimensionar.

## Datos e integración

Se recuperan cinco JPEG del ZIP del informe, verificando sus hashes y sin recomprimirlos. Las imágenes se comparten entre montaje, composición editorial y visor. Instrument Serif se sirve localmente con su licencia OFL; la interfaz mantiene Inter. La versión autónoma incluye fotografías, tipografía, datos y mapa.

El mapa de ciudad se reutiliza para «Cómo llegar» con la Ópera seleccionada. No se publican entradas, QR, códigos de admisión ni un reparto de bailarines deducido de las fotos. Programa: Divertimento No. 15 / Within the Golden Hour / Rhapsody. Duración anunciada orientativa, dos entreactos; no se cambia el calendario existente para inventar una hora de finalización.

Movimiento reducido, altura baja y móviles de poca altura reciben una composición estática completa. Los movimientos responden a una sola función de progreso, con geometría continua y reversible. Las imágenes se solicitan antes de entrar; las capas anteriores cubren cualquier imagen todavía sin decodificar.

## Cambios localizados

- [x] Extraer fotos, créditos, fuente tipográfica y datos de butacas.
- [x] Modelo puro de movimiento y medición del destino editorial.
- [x] Montaje, presentación, logística y diálogos.
- [x] Integración de cabecera, navegación, mapa compartido y créditos.
- [x] Continuidad, geometría, nitidez, carga tardía, foco y adaptación.
- [x] Revisión visual, grabación con rueda y recorrido completo.
- [x] Regresiones, compilaciones, HTML offline y ZIP privado verificado.

## Validación prevista

Comprobar avance/retroceso, límites de cada transición, coincidencia final entre foto y hueco editorial, liberación del sticky, nombre oculto durante el montaje y lectura posterior. Medir el tamaño real de imagen frente a la resolución original: conservar encuadre de bailarines y evitar ampliación de píxeles. Verificar los 1753 puntos, dos plazas seleccionadas y ausencia de rótulos que tapen posiciones.

Probar PC 1440×1000 y 1920×1080, portátil 1280×800 y 1000×650, móvil 390×844, 320×700, horizontal y movimiento reducido. Revisar diálogos, teclado, cierre tras rotación, menú oscuro, mapa de ciudad y todo el recorrido desde el inicio hasta el resumen. Ejecutar pruebas unitarias pertinentes, suite E2E completa, compilación normal y autónoma. Registrar síntomas, causa, corrección y evidencia. Entregar solo en la rama privada, sin despliegue público.

## Defectos encontrados y correcciones

| Observación | Causa | Corrección y comprobación |
| --- | --- | --- |
| El retrato podía asomarse antes de abrirse el escenario | El recorte inicial conservaba una superficie visible aunque su progreso fuese cero | Opacidad propia desde 0,22; prueba del estado inicial y recorrido inverso |
| El primer boceto del plano tenía rótulos fuera de la orientación de sus coordenadas | Se conservaron los puntos del informe pero se plantearon etiquetas y viewBox genéricos | Recuperar viewBox 400/450/7800/7800 y posiciones de rótulos de la reconstrucción; escenario arriba; revisión del plano completo |
| La línea de llamada atravesaba la primera fila del palco y el marco abarcaba más de dos plazas | El extremo de la línea y el marco se calcularon sin el radio real de los puntos | Terminar la línea antes del bloque y retirar el marco; solo las plazas 500/501 destacan en marfil |
| El icono de ampliación quedaba tapado al terminar el montaje | La fotografía en movimiento tiene mayor orden de pintura que el botón del mosaico | Dibujar el indicador en el marco de la foto; conservar debajo el botón accesible y una única fotografía visible; comprobar botón, foco y geometría |
| Riesgo de contraste bajo en la cabecera durante un gris intermedio | Interpolación del fondo con cambio independiente del color del texto | Cambiar fondo y texto juntos al superar el umbral de ambiente; revisar menú y contraste |
| La cabecera seguía oscura tras navegar al resumen | scroll-padding global de 72 px dejaba 2 px del capítulo por debajo del antiguo umbral | Umbral de salida de 85 px, válido para anclas y vuelta atrás; regresión E2E |
| El plano aparecía demasiado abajo en la pantalla logística | Margen del ancla sumado al scroll-padding y cabecera con excesiva altura | Eliminar margen duplicado, compactar introducción y ajustar alto del SVG al viewport sin recortar la geometría |
| Etiquetas accesibles de la cabecera y tarjetas de ciudad omitían texto visible | El enlace no incluía «Sofi 28» y los botones omitían su número de tarjeta | Nombres que incluyen marca/número; conservar nombres de lugar; auditoría axe de página completa y actualización localizada de selectores |
| La comprobación del desplegable no encontraba su control | El selector pedía texto exacto aunque el summary también contiene «Ver programa» | Seleccionar el summary real y verificar las tres obras y duración; no cambiar contenido para satisfacer el test |
| Cerrar una foto editorial tras pasar de PC a ventana estática devolvía fuera del capítulo | Se guardaba el desplazamiento en píxeles de una escena larga; al reducir su altura ese desplazamiento ya no representaba el mismo contenido | Guardar progreso de escena y posición del disparador: restaurar el progreso en cine y el mosaico en flujo estático; prueba en ambos sentidos y foco recuperado |
| El test conjunto de cinco recorridos completos agotó 90 s | Una sola prueba acumulaba cinco viewports y la nueva longitud del capítulo; no detectó un defecto de la página | Separar los cinco recorridos en casos independientes de 60 s, conservando todos los eventos de rueda, el final de página, vuelta atrás y rotación; repetir los cinco |
| El título se pintaba sobre la fotografía a mitad de la recogida | Subir el mosaico para mostrar su icono también subía texto y leyendas antes de despejarse su espacio | Mantener todo el plano editorial detrás del marco fotográfico: el borde descubre el texto al retirarse, sin letras sobre los bailarines; revisión de 0,82/0,88/0,94 y prueba del orden de capas |
| Botones transparentes del programa podían recibir un clic durante el montaje | Opacidad y tabIndex no desactivan los eventos del ratón | pointer-events:none hasta el estado interactivo, además de tabIndex y aria-hidden; regresión de estados de avance y retroceso |

La fuente de butacas mantiene 1.753 identificadores únicos, 111 bloques y 36 posiciones en Mittelloge. Las plazas 500 y 501 corresponden a fila 3, números 23 y 24. El rectángulo de llamada no tapa ningún punto; el líder termina a y=5320, antes de la primera fila (y=5402). La imagen del mismo palco conserva su descripción de procedencia y la limitación de fila/cámara; no se incorpora una vista exacta inaccesible.


## Resultado final

Comprobados 40 tests unitarios, los 71 casos de navegador de la versión final mediante ejecución completa y repeticiones de los grupos afectados, y el HTML autónomo sin red. El registro distingue el timeout acumulado de la primera pasada de los cinco recorridos independientes que lo sustituyen. Los once casos de la Ópera se repitieron después de la última corrección de capas.

La revisión final registra nueve modos y 63 estados; no encuentra errores de ejecución, respuestas fallidas ni imágenes ausentes. La auditoría completa llega al final con rueda real en PC, móvil, horizontal y movimiento reducido, sin desbordamiento horizontal; incluye vuelta atrás y cambio de orientación. La foto termina sobre su hueco medido, el texto se descubre detrás de su borde y los controles del mosaico permanecen desactivados durante el montaje. La logística completa cabe en la vista de PC 1440×1000; el SVG mantiene todo el plano y puede ampliarse.

Las cinco fotos nuevas conservan sus hashes y dimensiones del informe. El ZIP verifica las 64 fotografías nativas, conserva los 65 recursos públicos anteriores y los cuatro cuadernos sin cambios, y acompaña las licencias de ambas fuentes. El HTML de la prueba offline y el del ZIP tienen el mismo hash. La entrega se limita a `private-download`; no se ejecuta despliegue público.

Evidencia: [resultados](qa/opera-validation.json), [revisión de estados](qa/opera-visual-review.json), [recorrido completo](qa/opera-full-flow.json), [vídeo](qa/opera-scroll-desktop.webm), [presentación](qa/opera-desktop-98.png), [logística](qa/opera-desktop-tickets.png), [plano completo](qa/opera-desktop-map.png), [vista de Mittelloge](qa/opera-desktop-view.png), [móvil](qa/opera-mobile-98.png). Las medidas de tiempo corresponden al Chromium del entorno con grabación y emulación, no a una garantía de rendimiento en todos los equipos.
