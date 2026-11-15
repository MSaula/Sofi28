# Investigación: Wiener Staatsoper y Living Legacies

Fecha de consulta: 15 de noviembre de 2026 (Europe/Madrid).

## Alcance

Informe independiente en HTML, índice fotográfico y archivos reutilizables. No modificar `src`, `public`, la web del regalo ni su ZIP. Entrega en la rama privada existente; no publicar en Pages.

## Método

1. Confirmar función, programa, créditos y contexto en la ficha oficial del 22/01/2027. Contrastar la historia de las coreografías cuando haya fuentes accesibles.
2. Documentar la organización real de la casa mediante su plano interactivo y sus fotografías. Diferenciar las fotos de palcos genéricos de las de la Mittelloge.
3. Consultar el plano oficial de temporada y el simulador de la tienda sin comprar ni reservar entradas. Los asientos de referencia son Mittelloge, fila 3, 23 y 24, según las entradas ya documentadas. No deducir el asiento de una previsualización a partir de una captura ambigua.
4. Catalogar imágenes con identificador, descripción, espacio/pieza, fuente, dimensiones reales, autor conocido, condiciones de uso y SHA-256. Mantener separadas pruebas exactas, vistas de zona y material contextual. No sustituir fotografías por imágenes generadas.
5. Crear un informe legible y navegable con buscador/filtros y fotografías ampliables. Incluir enlaces al original, índice JSON/CSV y planos vectoriales/PDF disponibles.
6. Revisar visualmente fotografías, exactitud de etiquetas, plano de asientos y ampliaciones. Validar HTML, imágenes y funcionamiento offline en PC/móvil; verificar integridad del ZIP y preservación de la web principal.

## Hallazgos y límites iniciales

- Programa oficial: Divertimento No. 15 / Within the Golden Hour / Rhapsody.
- Ficha del 22/01/2027: 19:00–21:45, dos descansos. Los tiempos individuales publicados suman 151 minutos; no equivalen a los 165 minutos de la franja general. Documentar ambas cifras sin inventar horarios intermedios.
- El programa digital externo en Issuu responde 403; no se presenta como leído. Las páginas oficiales de la producción sí son accesibles.
- Una búsqueda externa con datos específicos del asiento fue bloqueada automáticamente antes de ejecutarse. Se descartó y se continúa la consulta de asientos exclusivamente en fuentes oficiales.
- El portal de entradas redirige inicialmente a una cola JavaScript. El navegador normal ha accedido al catálogo sin eludir controles ni autenticarse.

## Validación y cierre


### Material y verificación factual

- 44 fotografías locales, todas revisadas visualmente en cuatro hojas de contacto. Once corresponden a las tres coreografías; el lado largo de esas once es de 2.500 px. El resto incluye 4 exteriores con licencia identificada, 3 imágenes genéricas de palcos, auditorio, salones, acceso y backstage. Los originales recibidos se conservan sin recomprimir y con SHA-256.
- Dos registros adicionales, OP45 y OP46, documentan el vínculo individual asiento→imagen. Su descarga en el entorno falla con 503 / upstream remote reset en el CDN. Las vistas no se contabilizan como descargadas ni se dice que se hayan examinado. El portal y sus datos sí son accesibles con un navegador normal.
- Siete plantas SVG del sitio oficial, PDF de temporada y dos presentaciones anotadas del PDF. Los círculos de fila 3 se identifican directamente en los trazados del PDF: plaza 23, x=550,365/y=731,963; plaza 24, x=539,282/y=731,963. Se contrastan con s500/s501 del sector MILO, categoría 3. La Mittelloge del catálogo tiene 36 plazas (9/10/9/8), no las siete de la descripción genérica de palcos.
- No se ha localizado una fotografía inequívocamente identificada como interior exacto de Mittelloge. Las fotos de Loge y el rótulo «Zur Mittelloge» quedan descritas con su alcance real.
- No se ha comprado ni reservado ninguna entrada, ni enviado selecciones al carrito. No se incluyen PDF de entradas, QR, códigos de admisión o datos del comprador.

### Incidencias y correcciones del documento

| Observación | Causa | Resolución y comprobación |
| --- | --- | --- |
| La primera consulta de entradas correspondía al 29, no al 22 de enero | Se había leído el enlace de una función adicional de la página | Leer el módulo principal: evento 16677. Verificar cabecera 22/01/2027 y usar esa función para obtener el bloque |
| Error al exportar las plazas de la primera vista | Un registro del catálogo omite viewIndex | Conservar ese campo opcional como null; los índices 13/14 de las dos plazas seleccionadas sí están presentes |
| Foto inicial negra en la primera captura | Petición lazy de la imagen de portada aún sin decodificar | Prioridad alta y carga eager; captura tras decode. Portadas PC y móvil revisadas |
| Contraste de cuatro rótulos por debajo de AA | Marca secundaria y etiquetas doradas sobre fondo claro | Oscurecer los colores. axe A/AA sin infracciones serias/críticas en los cinco modos y en el visor |
| Detalle del plano mostraba parte de la siguiente zona | Recorte vertical demasiado extenso | Ajustar el viewBox, conservando las coordenadas del PDF. Verificación visual de los círculos 23 y 24 |
| Flechas de enlaces con glifo no disponible | Cobertura de la fuente del navegador de QA | Usar pequeños SVG, sin dependencia de fuentes remotas |
| El navegador administrado bloquea file:// | Política del Chromium del entorno | Mantener la política y validar los mismos bytes mediante un origen localhost interceptado. No se afirma una navegación file:// ejecutada |

### Resultado

- Auditoría funcional aprobada en Chromium 154.0.8037.57: escritorio 1440×1000, portátil 1280×800, móvil 390×844, estrecho 320×700 y movimiento reducido 1440×1000.
- Las 44 fotos se abren y decodifican en el visor de PC, comprobando sus dimensiones nativas; cuatro se vuelven a comprobar por cada modo adicional (60 aperturas verificadas).
- Filtros, búsqueda con mayúsculas, ausencia de resultados, cierre, foco, flechas de teclado, siete plantas y dos estados del plano de asientos comprobados en los cinco modos.
- Cero errores JavaScript, solicitudes externas y desbordamientos en los estados revisados. axe A/AA: cero infracciones serias/críticas; también se audita el visor abierto.
- El origen de prueba sirve exclusivamente bytes de la carpeta local mediante interceptación; no necesita servidor ni llamadas HTTP reales. La navegación directa file:// está bloqueada por el administrador de este Chromium y no se ha desactivado esa política. El paquete usa HTML, JavaScript inline y rutas relativas estándar para abrirse descomprimido en el navegador del usuario.
- Preservación: 34 archivos de src, 65 de public y el SHA-256 de downloads/Viena.zip idénticos al inicio. No se requiere repetir las pruebas de la aplicación porque no se ha modificado.

Evidencias: [validacion.json](validacion.json), [registro](validacion.log), [preservación](preservacion.json), [portada PC](portada-escritorio.png), [móvil](portada-movil.png), [plazas señaladas](asientos-escritorio.png), [plantas](plantas-escritorio.png), [visor móvil](visor-movil.png) y [archivo](archivo-escritorio.png).


## Segunda iteración — mapa global y vista desde el mismo palco

### Cambios solicitados

El contexto global queda visible al entrar en la sección de asientos. La reconstrucción completa y el detalle de la numeración se muestran a la vez, sin alternar uno por otro. El plano oficial completo sigue disponible en un desplegable y como PDF.

- Reconstrucción SVG de **1.753 posiciones sentadas** a partir del área principal de la geometría pública del simulador. Se conservan coordenadas y agrupaciones; la rotación de 180° sitúa el escenario arriba como en el PDF. La versión `356552144` coincide con la del mapa de la función del 22/01/2027.
- Mittelloge está destacado en dorado y enmarcado, con las plazas s500/23 y s501/24 en azul. No se usan colores de disponibilidad ni se interpreta el recuento del catálogo como aforo físico. Las zonas de pie de las otras tres áreas no se convierten en butacas.
- El rótulo inicial tapaba 16 posiciones de palcos adyacentes. Se desplazó al espacio vacío entre parterre y Mittelloge. La comprobación de intersecciones confirma **cero butacas cubiertas**, además de verificar los 1.753 IDs únicos y los dos puntos seleccionados.
- Se añade **OP47**, fotografía de 5.300 × 3.520 px y 9.963.567 bytes, C.Stadler/Bwag, CC BY-SA 4.0, tomada el 26/02/2023. La descripción alemana de su autor dice «Blick von der Mittelloge zur Bühne». Por ello se clasifica como vista del mismo palco; **fila y asiento no documentados**. Se conserva el JPEG original, sin retoque ni recorte del archivo.
- Las dos vistas individuales APNR500/APNR501 siguen devolviendo 503 al descargarlas en el entorno. Se revisaron también fuentes alternativas: se descartaron resultados de la Staatsoper de Berlín; A View From My Seat devuelve 403. No se atribuye OP47 a una de las dos plazas exactas.

### Validación de la revisión

La auditoría completa se repite tras la corrección del rótulo: cinco tamaños/modos de Chromium, 45 fotos locales verificadas por hash, 45 aperturas en PC y cinco referencias en cada uno de los otros cuatro modos. OP47 se abre además desde su nueva sección en los cinco modos; el visor conserva sus dimensiones nativas y la indicación de fila/asiento desconocidos.

Se verifican el mapa global y el detalle visibles conjuntamente, el SVG reconstruido, el SVG de detalle, el plano oficial completo desplegable y las siete plantas. Cero errores JavaScript, solicitudes externas, desbordamientos e infracciones serias/críticas de axe en los estados revisados. Se inspeccionan las capturas de PC/móvil, el mapa y la fotografía completa.

Los 44 originales anteriores, los 99 archivos de src/public y Viena.zip conservan sus hashes. El paquete actualizado contiene 45 fotos locales y dos vistas exactas enlazadas pendientes. Evidencias añadidas: [geometría reconstruida](reconstruccion-butacas.json), [fuente del mapa](plano-butacas-fuente.json), [fuente de la fotografía](vista-mittelloge-fuente.json), [mapa PC](asientos-escritorio.png), [mapa móvil](asientos-movil.png), [foto del mismo palco](vista-mittelloge-escritorio.png) y [visor móvil](vista-mittelloge-visor-movil.png).
