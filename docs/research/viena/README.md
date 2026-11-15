# Cuadernos de Viena — índice interno

La investigación se organiza en dos documentos independientes. La segunda parte amplía las referencias visuales y conserva las fichas del primer estudio; todavía no se incorpora a la web del regalo.

| Estudio | Contenido | Abrir |
| --- | --- | --- |
| I · Viena, lugar a lugar | 32 lugares y 34 fotos: monumentos, plazas, jardines e interiores | [Informe y documentación](#volumen-i--viena-lugar-a-lugar) |
| II · Viena, entre calles y mesas | 29 fichas y 44 fotos: 15 calles/pasajes, 5 cafés y 9 restaurantes | [Estudio visual II](volumen-2/README.md) · [ZIP privado](https://github.com/MSaula/Sofi28/raw/refs/heads/private-download/downloads/Indice-visual-Viena-II.zip) |

[Registro de ambos estudios](indice-estudios.json). Los índices separados permiten elegir imágenes y lugares sin alterar los datos que utiliza actualmente el mapa de la web principal.

## Volumen I — Viena, lugar a lugar

[Descargar el informe HTML y sus índices](https://github.com/MSaula/Sofi28/raw/refs/heads/private-download/downloads/Indice-visual-Viena.zip). Requiere acceso al repositorio privado. Descomprimir y abrir **Indice-visual-Viena.html**; funciona sin servidor y sin conexión.

La investigación del 14/11/2026 reúne **32 lugares, 34 fotografías y cuatro zonas**: casco histórico, Ring y museos, Karlsplatz/Belvedere y Stadtpark/Landstraße. Doce lugares se señalan como selección visual editorial. Incluye arquitectura, plazas, grandes interiores, jardines, cafés y mercado. Es una base para elegir contenidos y visitas, no un itinerario cerrado.

Cada ficha ofrece una descripción, ideas de encuadre, consideraciones para enero y enlaces de contraste. La galería permite ampliar y descargar todas las fotografías; búsqueda, filtros y exportación CSV/JSON funcionan offline. Las copias recibidas tienen al menos 1.600 px en su lado largo y conservan sus bytes; autor, licencia, fecha publicada, resolución, URL y SHA-256 se registran individualmente.

**Hallazgo operativo:** Café Central anuncia en su web una reforma iniciada el 16/03/2026 y reapertura prevista para el invierno de 2026. La reapertura efectiva para enero de 2027 y el acceso al pasaje de Palais Ferstel se dejan por comprobar. Las imágenes de referencia no son una confirmación de apertura o del aspecto tras las obras.

## Archivos del índice

- [Fichas, fotografías y fuentes JSON](lugares-y-fuentes.json).
- [Catálogo fotográfico CSV](fotografias.csv).
- [Plan, selección y validación](plan-y-validacion.md).
- [Comprobaciones de navegador](validacion.json).
- [Integridad y entrega privada](entrega.json).
- [Portada de escritorio](portada-escritorio.png), [portada móvil](portada-movil.png), [ficha móvil](cafe-central-movil.png) y [visor móvil](visor-movil.png).

Las fuentes de trabajo y las copias de las fotos están en /workspace/informes/viena-puntos-interes. El ZIP conserva el HTML con las 34 fotografías incrustadas, los índices, las licencias y las instrucciones de apertura. Cada archivo fotográfico puede recuperarse desde su visor; no hace falta duplicar las fotos dentro del ZIP.

Las nueve comprobaciones finales pasan en Chromium, con tamaños 1440×1000, 390×844, 320×700 y 844×390. Se verifican los 34 hashes incrustados, todas las imágenes del visor, el teclado, las descargas, los filtros, la impresión y ausencia de solicitudes HTTP/errores JavaScript. Axe no detecta problemas graves/críticos en los estados comprobados. La emulación no sustituye la revisión en Safari o dispositivos físicos.

El informe se entrega únicamente en private-download. La aplicación del regalo, su ZIP y la rama de vista previa permanecen en su versión anterior.
