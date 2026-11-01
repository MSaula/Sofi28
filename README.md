# Para ti — Viena, enero de 2027

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

El resultado es **`dist-standalone/index.html`**, un archivo único que puede descargarse y abrirse directamente en un navegador de escritorio. Incluye JavaScript, estilos, tipografía, cartografía e ilustraciones. Esta versión usa las ilustraciones locales y no necesita conexión para recorrer la experiencia. Los enlaces externos siguen necesitando Internet al pulsarlos.

La exportación no publica ni despliega la web. Para compartir una URL será necesario un alojamiento web o una plataforma con vistas previas.

Las pruebas de navegador usan Chromium del sistema si existe en `/usr/bin/chromium`. Se puede indicar otro con `CHROMIUM_PATH`. En otras máquinas, ejecutar `npx playwright install chromium`. El servidor de pruebas se inicia automáticamente si no hay uno en el puerto 5173.

## Contenido y próximas iteraciones

Todo el contenido personal está en [`src/content.js`](src/content.js):

- **Carta:** rellenar `trip.letter` con un párrafo por elemento. Admite cualquier longitud; no hay animación de lectura. `letterTitle` controla su título.
- **Viajes anteriores:** los nueve lugares y meses proporcionados están en `memories`, ordenados cronológicamente. No se inventan días concretos.
- **Apartamento:** referencia proporcionada por el usuario: **Untere Weißgerberstraße 37, 1030 Wien**, expresamente orientativa. El mapa usa el punto medio de la geometría real de esa calle y un círculo de incertidumbre de 362m. `locationPrecision` indica `approximate-street`: no es una geocodificación confirmada del edificio ni una ubicación exacta del anuncio. El enlace real de Airbnb permanece disponible.
- **Fotos del apartamento:** añadir archivos en `public/images` y objetos `{ src, title, alt }` a `trip.airbnb.photos`. La galería horizontal y el visor ampliado ya están preparados. Hasta entonces se muestra una ilustración claramente identificada como provisional.
- **Vuelos:** origen y aeropuertos proporcionados, sin aerolínea ni horarios inventados. Solo se anima la conexión aérea BCN–VIE; se retiraron los trazados de coche y taxi que no correspondían a rutas verificadas. La salida desde Sant Vicenç de Montalt permanece en el resumen.
- **Ballet:** datos extraídos de las dos entradas: **Living Legacies**, Wiener Staatsoper, viernes **22/01/2027 a las 19:00**, Balanchine / Wheeldon / Ashton, Mittelloge, fila 3, asientos 23 y 24. Corrige el nombre provisional anterior «The Living Legends».

Las fechas del viaje y el inicio de la función se editan una sola vez al principio de `src/content.js`. Los textos de fechas, la selección del calendario y la exportación se derivan de esos valores. `src/calendar.js` genera un calendario descargable con el viaje (22–24 inclusive) y el ballet (19:00 CET / 18:00 UTC), sin suponer una hora de finalización. La exportación se valida con un parser ICS independiente, incluidos escapes y líneas UTF-8.

## Imágenes y fuentes

- Los SVG de `public/images` son ilustraciones originales conceptuales. El auditorio no es una fotografía del teatro ni una representación de la producción; el interior ilustrado no pretende representar el apartamento. Son sustituibles por material real.
- Todas las imágenes mostradas son ahora recursos locales e identificados como ilustraciones; la web y el HTML exportado tienen el mismo aspecto. Se eliminó la carga automática de una fotografía externa no verificada. Las fotos reales del apartamento y del espectáculo siguen pendientes.
- Cartografía continental: Natural Earth 1:50m, dominio público, distribuida por `world-atlas` y simplificada conservando la topología. Reproducible con `node scripts/build-europe-data.mjs`.
- Calles de Viena: **OpenStreetMap contributors**, licencia **ODbL 1.0**, extracto de [EqualStreetNames Vienna](https://github.com/EqualStreetNames/equalstreetnames-vienna), snapshot 2026-10-02, commit `734333a5f858729a6bc227c2f8dae742af050d25`. `src/data/vienna-streets.json` conserva la procedencia, licencia y extensión. La agrupación por nombre y simplificación máxima de 1.5m mantienen las calles reales; no se incluyen ríos/parques inventados. Los datos derivados se pueden descargar desde «Datos y precisión» en el mapa, también sin conexión. Regeneración: `python3 scripts/build-vienna-data.py /ruta/al/checkout/equalstreetnames-vienna`.
- Iconos: Lucide, licencia ISC. Tipografía: Inter, SIL Open Font License, servida localmente.

## Privacidad y alcance

El PDF de las entradas, códigos QR, números de pedido y datos del comprador **no se incorporan** al repositorio ni a `public`. La página solo contiene los datos de la experiencia. No hay analítica, backend, peticiones automáticas a proveedores de mapas/fotos ni almacenamiento de datos. Los enlaces externos solo se abren al pulsarlos. `noindex` evita solicitar indexación; no sustituye al control de acceso si se publica en una URL pública.

La vista previa autorizada se publica como página autocontenida y ZIP en la rama separada **`gh-pages`** de `MSaula/Sofi28`. El exportador verifica que está actualizando su propia rama. `main` no se modifica. La activación de GitHub Pages y la URL en vivo no pueden verificarse desde esta red, que bloquea `api.github.com`.

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

La salida por defecto es `artifacts/qa-flow` (ignorada por Git). Las pruebas verifican geometría real, precisión declarada del alojamiento, correspondencia entre avión y trazo SVG, las nueve etiquetas históricas, recortes, overflow, preservación del capítulo al rotar, teclado/modales, accesibilidad y exportación offline. Las pruebas usan Chromium con emulación móvil; no sustituyen a una revisión en dispositivos físicos.
