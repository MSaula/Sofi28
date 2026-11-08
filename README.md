# Sofi 28 — Viena, enero de 2027

**Entrega privada con las cinco fotografías:** [descargar Viena.zip](https://github.com/MSaula/Sofi28/raw/refs/heads/private-download/downloads/Viena.zip), en la rama `private-download`. Requiere una cuenta autorizada en este repositorio. Descomprimir y abrir `Viena.html`. Esta entrega no actualiza GitHub Pages.

Primera versión de una web-regalo con carta, cronología, mapa animado y revelación del ballet. React + Vite. El desplazamiento es nativo: las escenas usan CSS `sticky` y su animación depende de la posición del scroll, también al retroceder.

## Desarrollo

Requiere Node.js 22.12+ (verificado con Node 24).

```sh
cd /workspace/Sofi28
npm ci
npm run dev
```

```sh
npm run build
npm run preview
npm test
npm run test:e2e
npm run validate
```

## Abrir sin servidor ni vista previa del entorno

El puerto 5173 pertenece a la máquina del entorno; no es una URL pública. Esta conversación no ofrece una función para exponerlo al navegador del usuario.

```sh
npm run build:standalone
npm run test:standalone
```

El resultado es **`dist-standalone/index.html`**, un archivo único que puede descargarse y abrirse directamente en un navegador de escritorio. Incluye JavaScript, estilos, tipografía, cartografía, ilustraciones y las cinco fotografías originales de los viajes. No necesita conexión para recorrer la experiencia. Los enlaces externos siguen necesitando Internet al pulsarlos.

La exportación no publica ni despliega la web. Para compartir una URL será necesario un alojamiento web o una plataforma con vistas previas.

Las pruebas de navegador usan Chromium del sistema si existe en `/usr/bin/chromium`. Se puede indicar otro con `CHROMIUM_PATH`. En otras máquinas, ejecutar `npx playwright install chromium`. El servidor de pruebas se inicia automáticamente si no hay uno en el puerto 5173.

## Contenido y próximas iteraciones

Todo el contenido personal está en [`src/content.js`](src/content.js):

- **Carta:** rellenar `trip.letter` con un párrafo por elemento. Admite cualquier longitud; no hay animación de lectura. `letterTitle` controla su título.
- **Viajes anteriores:** los quince lugares y meses proporcionados están en `memories`, desde Niza (marzo de 2022). No se inventan días concretos. `birthdayAge` identifica Niza, Londres, Islandia, Dolomitas y Florencia como Sofi 23–27; `currentBirthdayGift` contiene Sofi 28. Los regalos van arriba del calendario y los otros diez viajes, abajo.
- **Fotos de los dos:** las cinco fotografías de `s28p.zip` están asociadas por nombre a Niza, Londres, Islandia, Dolomitas y Florencia (Sofi 23–27). Se conservan los JPEG originales, sin recortar ni recomprimir. Sofi 28 es una tarjeta tipográfica más grande, con «Lo próximo» y fecha, sin foto ni placeholder. Para cambiar una foto, editar `{ src, alt }` en `src/content.js` y colocar el archivo en `public/images`. El HTML offline incluye también WebP, PNG, AVIF y SVG.
- **Composición fotográfica:** las tarjetas históricas reservan una foto vertical 3:4 completa y una columna para edición, destino y mes/año. Tamaño, cámara, colisiones y apertura se calculan juntos. La versión estática usa el mismo recurso. Diseño, asociación de originales y validación: [docs/plan-timeline-fotos.md](docs/plan-timeline-fotos.md).
- **Fluidez del timeline:** las tarjetas siguen a su mes y atraviesan los bordes con un desvanecimiento estrecho. Se mantienen montadas durante el zoom y el recorrido inverso; los rótulos cercanos se cruzan gradualmente. Correcciones y vídeo de validación: [docs/plan-timeline-motion.md](docs/plan-timeline-motion.md).
- **Apartamento:** referencia proporcionada por el usuario: **Untere Weißgerberstraße 37, 1030 Wien**, expresamente orientativa. El mapa usa el punto medio de la geometría real de esa calle y un círculo de incertidumbre de 362m. `locationPrecision` indica `approximate-street`: no es una geocodificación confirmada del edificio ni una ubicación exacta del anuncio. El enlace real de Airbnb permanece disponible.
- **Fotos del apartamento:** añadir archivos en `public/images` y objetos `{ src, title, alt }` a `trip.airbnb.photos`. La galería horizontal y el visor ampliado ya están preparados. Hasta entonces se muestra una ilustración claramente identificada como provisional.
- **Mapa continental:** encuadre de Europa con Edimburgo y Copenhague, capitales y los lugares compartidos que caben. Paros y Cortina d’Ampezzo sustituyen a las referencias generales de Grecia y Dolomitas; Mallorca se identifica como isla. No se amplía para Islandia o Lanzarote. Solo aparece la traza recorrida, sin ruta futura ni destino anticipado. Fuentes, geometría, diseño y comprobaciones: [docs/plan-europe-reveal.md](docs/plan-europe-reveal.md).
- **Vuelos:** origen y aeropuertos proporcionados, sin aerolínea ni horarios inventados. Solo se anima la conexión aérea BCN–VIE; se retiraron los trazados de coche y taxi que no correspondían a rutas verificadas. La salida desde Sant Vicenç de Montalt permanece en el resumen.
- **Ballet:** datos extraídos de las dos entradas: **Living Legacies**, Wiener Staatsoper, viernes **22/01/2027 a las 19:00**, Balanchine / Wheeldon / Ashton, Mittelloge, fila 3, asientos 23 y 24. Corrige el nombre provisional anterior «The Living Legends».

Las fechas del viaje y el inicio de la función se editan una sola vez al principio de `src/content.js`. Los textos de fechas, la selección del calendario y la exportación se derivan de esos valores. `src/calendar.js` genera un calendario descargable con el viaje (22–24 inclusive) y el ballet (19:00 CET / 18:00 UTC), sin suponer una hora de finalización. La exportación se valida con un parser ICS independiente, incluidos escapes y líneas UTF-8.

## Imágenes y fuentes

- Los SVG de `public/images` son ilustraciones originales conceptuales. El auditorio no es una fotografía del teatro ni una representación de la producción; el interior ilustrado no pretende representar el apartamento. Son sustituibles por material real.
- Las cinco fotografías del timeline son los originales aportados por el usuario. Los demás visuales son ilustraciones conceptuales identificadas como tales. Todos son recursos locales; la web y el HTML exportado tienen el mismo aspecto. Las fotos reales del apartamento y del espectáculo siguen pendientes.
- Cartografía continental: Natural Earth 1:50m, dominio público, distribuida por `world-atlas` y simplificada conservando la topología. Reproducible con `node scripts/build-europe-data.mjs`.
- Nombres y coordenadas: Natural Earth 1:10m (revisión fijada) y GeoNames, CC BY 4.0, distribuidos en geonamescache 3.0.2. Procedencia e identificadores en `src/data/europe-places.json`; las islas usan centroides de su geometría real y las regiones se distinguen de las ciudades. Las coordenadas nunca se desplazan para encajar etiquetas.
- Calles de Viena: **OpenStreetMap contributors**, licencia **ODbL 1.0**, extracto de [EqualStreetNames Vienna](https://github.com/EqualStreetNames/equalstreetnames-vienna), snapshot 2026-10-02, commit `734333a5f858729a6bc227c2f8dae742af050d25`. `src/data/vienna-streets.json` conserva la procedencia, licencia y extensión. La agrupación por nombre y simplificación máxima de 1.5m mantienen las calles reales; no se incluyen ríos/parques inventados. Los datos derivados se pueden descargar desde «Datos y precisión» en el mapa, también sin conexión. Regeneración: `python3 scripts/build-vienna-data.py /ruta/al/checkout/equalstreetnames-vienna`.
- Iconos: Lucide, licencia ISC. Tipografía: Inter, SIL Open Font License, servida localmente.

## Privacidad y alcance

El PDF de las entradas, códigos QR, números de pedido y datos del comprador **no se incorporan** al repositorio ni a `public`. La página solo contiene los datos de la experiencia. No hay analítica, backend, peticiones automáticas a proveedores de mapas/fotos ni almacenamiento de datos. Los enlaces externos solo se abren al pulsarlos. `noindex` evita solicitar indexación; no sustituye al control de acceso si se publica en una URL pública.

La entrega actual autorizada es privada: código y ZIP en **`private-download`**, con la descarga en `downloads/Viena.zip`. Los permisos los establece el repositorio, no el nombre de la rama. La rama nueva no es la fuente previamente propuesta para Pages y no contiene workflows de despliegue.

La rama anterior **`gh-pages`** conserva la vista previa sin estas fotografías. No se actualiza en esta entrega: GitHub Pages puede exponer contenido públicamente incluso desde un repositorio privado. Su configuración y la URL en vivo no pueden verificarse desde esta red, que bloquea `api.github.com`. El exportador antiguo de los párrafos siguientes corresponde a ese flujo separado; no se usa para entregar las fotos bajo la autorización privada actual.

Para activar el alojamiento: en <https://github.com/MSaula/Sofi28/settings/pages>, elegir **Deploy from a branch → gh-pages → / (root)** y guardar. GitHub mostrará la URL cuando finalice el despliegue. La disponibilidad de Pages depende de la configuración y el plan del repositorio; no se ha cambiado su visibilidad.

Para actualizar posteriormente la rama de vista previa, con publicación autorizada:

```sh
npm run test:standalone
npm run deploy:preview
```

El exportador usa Python 3 y el acceso Git HTTPS existente. Solo sube los archivos de la vista previa, conserva el historial de su propia rama y rechaza modificar una rama `gh-pages` ajena a este flujo. No usa force push ni cambia el checkout o el índice de trabajo.

No se ha cambiado ni publicado la configuración del entorno. Esta tarea utiliza el checkout existente; no necesita un worktree adicional.

## Auditoría y regresiones

El registro completo de síntomas, causas, decisiones, correcciones y resultados está en [QA_PLAN.md](QA_PLAN.md). La auditoría recorre toda la página con eventos de rueda, toma capturas intermedias, retrocede, rota el viewport y comprueba movimiento reducido.

```sh
# Con npm run dev activo:
npm run audit:flow
# Opcional: QA_OUT=/otra/ruta QA_URL=http://127.0.0.1:5173 npm run audit:flow
```

La salida por defecto es `artifacts/qa-flow` (ignorada por Git). Las pruebas verifican geometría real, precisión declarada del alojamiento, correspondencia entre avión y trazo SVG, los quince viajes históricos y Sofi 28, las cinco fotos históricas y la tarjeta final sin imagen, bandas sin solapes, recortes, overflow, preservación del capítulo al rotar, teclado/modales, accesibilidad y exportación offline. Las pruebas usan Chromium con emulación móvil; no sustituyen a una revisión en dispositivos físicos. La planificación de esta iteración está en [docs/plan-sofi28.md](docs/plan-sofi28.md).
