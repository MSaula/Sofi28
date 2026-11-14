# El apartamento — propuesta, integración y validación

## Decisión de diseño

El mapa resuelve dónde está el punto del anuncio; la siguiente escena debe convertir esa referencia en una sensación de llegada. Se sustituye la ilustración provisional por una fotografía real del dormitorio que se abre con el scroll, con una respiración suave del encuadre y una aparición escalonada del título. La escena mantiene todos sus elementos montados y es reversible.

Después se recupera la lectura natural: cuatro ventajas breves, seguidas de cuatro tarjetas fotográficas grandes en un recorrido horizontal controlable. Imagen protagonista más tarjetas cubren las cinco fotografías disponibles como archivos: dormitorio general, rincón del dormitorio, cocina, comedor y cama auxiliar del estar. No se pretende crear fotografías nuevas ni descargar recursos de terceros al abrir la página.

La separación entre emoción (revelación), comprensión (ventajas) y detalle (fotos y descripciones) evita convertir el regalo en una ficha de alquiler. El apartado conserva el estilo limpio, la tipografía grande y el ritmo de la página; se limita la duración de la escena fijada. En movimiento reducido o ventanas bajas se muestra una composición estática con toda la información.

## Contenido respaldado

- Ático luminoso con ventanales, cama doble y butacas.
- Cocina equipada para preparar desayunos, sin prometer desayuno incluido.
- Ubicación en Landstraße, cerca de Hundertwasserhaus.
- Ascensor y llegada autónoma declarados.
- Cama auxiliar abatible en el estar, descrita como cama, no como sofá.
- No se promete balcón privado, superficie, medidas de cama, dormitorio cerrado, estado operativo de equipos o tarifas no verificadas.
- Las distintas mesas de las fotos se muestran como aparecen en el anuncio, sin presentar una como configuración actual garantizada.

## Ubicación: aclaración aceptada por el usuario

Se usa la posición publicada por Airbnb, latitud 48.20926 y longitud 16.39508. El usuario acepta usar esa localización. La copia analizada indica isExactLocation=false y exactAddress=null: no se transforma en ubicación verificada del edificio.

Se sustituye el punto medio de Untere Weißgerberstraße por el punto del anuncio, se elimina el círculo de 362 m que representaba toda la calle y no se inventa otro radio. La referencia al número 37 queda como antecedente sin confirmar, no como dirección visible. Mapa, enlace externo, descripción y resumen comparten una única fuente.

## Cambios localizados

- [x] Metadatos y cinco JPEG originales con procedencia/hash.
- [x] Componente independiente para la revelación, ventajas, galería y visor.
- [x] Modelo de animación continuo y versión estática.
- [x] Pin del anuncio, eliminación de círculo y textos coherentes.
- [x] Créditos y documentación actualizados.
- [x] Pruebas específicas de continuidad, galería, teclado, mapa y exportación.
- [x] Revisión visual, recorrido completo, móviles/rotación y accesibilidad.
- [x] ZIP privado actualizado y recuperado para verificarlo.

## Aceptación

Fotos reales, con descripciones breves, sin recortes en las tarjetas ni saltos al invertir la escena. Flechas, desplazamiento táctil y teclado permiten recorrer todos los rincones; el visor devuelve el foco y bloquea el fondo. El modo estático conserva los mismos datos e imágenes.

El marcador debe coincidir con la proyección de las coordenadas del anuncio en cada tamaño, sin el antiguo círculo y manteniendo su precisión aproximada. La exportación incluye los cinco JPEG y funciona sin peticiones HTTP. Timeline, vuelo, ciudad, ballet y resumen conservan sus comprobaciones.

Solo se actualiza la entrega privada autorizada; no se modifica main ni gh-pages.


## Decisiones verificadas durante la integración

- En escritorio la imagen protagonista es la vista general del dormitorio; en móvil se selecciona la fotografía vertical para conservar mejor la lectura de la habitación. El elemento permanece montado durante el scroll y la selección solo cambia al cruzar el ancho de pantalla.
- El baño con bañera se recoge entre las ventajas, a partir del anuncio y la foto inspeccionada en la conversación. No se simula un archivo de baño que no estuviera disponible localmente.
- Las cuatro tarjetas muestran fotografías completas con object-fit: contain. El encuadre cinematográfico de la portada puede recortar; el visor permite ver los cinco originales completos.
- Los controles de galería se desactivan en los extremos. Teclado, desplazamiento nativo y botones llegan a todos los rincones. El visor incluye también la vista general y devuelve el foco al elemento que lo abrió.
- El pin usa la coordenada del anuncio en todos los tamaños y su enlace externo lleva al mismo punto. La descarga cartográfica conserva la referencia histórica como antecedente y publica la referencia actual separada, con precisión aproximada y sin radio inventado.
- La primera prueba de contraste se ejecutaba mientras las revelaciones de lectura estaban en transición. Se ha ajustado la comprobación para esperar su estado estable; no se rebaja el criterio de contraste.


## Problemas resueltos y comprobación

| Problema | Causa | Solución y validación |
| --- | --- | --- |
| El apartado no enseñaba el alojamiento real. | La colección estaba vacía y se mostraba una ilustración provisional. | Cinco archivos del anuncio, con procedencia y SHA-256. La prueba offline compara también los bytes incrustados. |
| La vista general perdía información en móvil. | Una fotografía horizontal recortada a una ventana vertical ocultaba buena parte de la habitación. | Se selecciona el original vertical del dormitorio en móvil; tarjetas y visor mantienen la imagen completa. Capturas de 320 y 390 px. |
| El punto del mapa representaba una calle entera. | El contenido conservaba el punto medio de la calle y una incertidumbre calculada para esa calle. | Punto del anuncio aceptado, sin círculo. Prueba de proyección SVG independiente en tres tamaños y enlace al mismo punto. |
| Riesgo de salto al revelar o retroceder. | Insertar imágenes por umbrales o animarlas por tiempo desacoplaría su posición del scroll. | Escena montada, estado continuo y reversible, comprobación densa y recorrido real hacia delante y atrás. |
| Un carrusel no siempre permite descubrir el último elemento. | El desplazamiento fijo y los controles siempre activos no expresan sus límites. | Paso calculado por ancho real de tarjeta y separación, extremos desactivados, teclado y visor con retorno del foco. |

## Resultado local y end to end

- npm run validate: **25 pruebas unitarias, 37 de navegador y 1 de exportación offline aprobadas**. Compilaciones normal y autónoma correctas.
- Nueva cobertura: estado continuo, activos originales, apertura y retroceso, cuatro tamaños, controles de galería, visor/foco, versión estática, rotación, proyección del pin y descarga de datos coherente.
- Auditoría con rueda real en escritorio 1440×1000, móvil 390×844, horizontal 844×390 y movimiento reducido: los cuatro recorridos llegan al final, sin errores JavaScript ni overflow horizontal. Retroceso y rotación también comprobados; **120 estados capturados**.
- Revisión visual adicional en 320×700 y 1000×650, portada, ventajas, galería y mapa. Las fotos completas permanecen accesibles en las tarjetas y el visor.
- Axe-core no detecta infracciones graves/críticas en los estados estables comprobados del apartamento y sus pies. No constituye una auditoría manual completa de accesibilidad.
- El HTML autónomo se prueba sin servidor ni solicitudes HTTP; incluye los diez originales fotográficos. Se conserva la advertencia previa de tamaño de bundle cartográfico, sin elevar el umbral para ocultarla.
- El informe independiente del Airbnb conserva exactamente sus archivos anteriores; no forma parte del regalo descargable.

[Resultados compactos](qa/apartment-flow-summary.json) · [Portada escritorio](qa/apartment-cinema-desktop.png) · [Portada móvil](qa/apartment-cinema-mobile.png) · [Galería escritorio](qa/apartment-gallery-desktop.png) · [Galería móvil](qa/apartment-gallery-mobile.png) · [Pin móvil](qa/apartment-pin-mobile.png).

Las pruebas usan Chromium y emulación móvil. La revisión en Safari/iOS y dispositivos físicos sigue pendiente de disponibilidad de esos dispositivos.

## Entrega privada verificada

El commit 3eb58f14277ebf8a2519af65d76cf7efcc78073d se ha subido únicamente a private-download y recuperado desde origin. El ZIP remoto coincide byte a byte con el local; su HTML coincide con el probado. Las diez fotografías remotas y las diez incrustadas conservan los hashes de sus originales. La descarga anónima responde 404; requiere los permisos del repositorio privado.

[Descarga de esta versión](https://github.com/MSaula/Sofi28/raw/3eb58f14277ebf8a2519af65d76cf7efcc78073d/downloads/Viena.zip). Contiene únicamente Viena.html y LEEME.txt. La verificación de ramas confirma main y gh-pages sin cambios respecto a su estado al comenzar esta entrega. Detalles y hashes en [el recibo](qa/timeline-photo-delivery.json).
