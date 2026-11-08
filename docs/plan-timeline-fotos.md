# Timeline fotográfico — composición, integración y validación

Estado actual: **cinco originales incorporados y revisión con fotografías reales completada; 34 pruebas aprobadas**. Entrega privada completada en `private-download`, bajo la autorización explícita del usuario y separada del flujo de GitHub Pages. El enlace del ZIP devuelve 404 sin sesión. Las notas de la primera fase sin archivos se conservan como antecedentes.

## Propósito y decisión de diseño

La cronología conserva su narrativa: vista global desde 2022, acercamiento al primer regalo, recorrido horizontal, enero de 2027 y fechas 22–24. Los regalos permanecen arriba y los demás viajes debajo.

Las cinco fotos mostradas en el mensaje son verticales (3:4). El encuadre incluye a la pareja y elementos importantes del destino. Un recorte cuadrado de 44–64 px, como el anterior, da prioridad al rótulo y reduce mucho el recuerdo. Se propone una tarjeta horizontal editorial: fotografía vertical amplia, proporción completa, y columna tipográfica con edición, destino y fecha. Sin texto sobre las caras, inclinaciones ni marcos ornamentales. Blanco, negro suave y azul mantienen la dirección visual existente.

En la vista global se conservan las etiquetas pequeñas. El acercamiento abre foto, márgenes y tipografía juntos. La tarjeta se adapta al espacio real: puede mostrar una foto de aproximadamente 230×307 px en escritorio y 175×233 px en móvil, frente a los 44–64 px anteriores. Son objetivos de composición, que se contrastarán con los tamaños reales del navegador. Sofi 28 conserva un espacio pendiente; no se le asigna una foto de otro viaje.

## Archivos recibidos

En la primera fase solo se veían las imágenes del mensaje, sin acceso a sus archivos y nombres. La recepción de **s28p.zip** ha resuelto esta dependencia. Se han leído exclusivamente los cinco JPEG; no se han importado `.DS_Store` ni los archivos auxiliares `__MACOSX`.

| Archivo original | Tarjeta             | Fecha del recuerdo | Dimensiones |
| ---------------- | ------------------- | ------------------ | ----------- |
| `niza.jpeg`      | Sofi 23 · Niza      | Marzo 2022         | 768×1024    |
| `londres.jpeg`   | Sofi 24 · Londres   | Enero 2023         | 768×1024    |
| `islandia.jpeg`  | Sofi 25 · Islandia  | Diciembre 2023     | 1536×2048   |
| `dolomitas.jpeg` | Sofi 26 · Dolomitas | Enero 2025         | 768×1024    |
| `florencia.jpeg` | Sofi 27 · Florencia | Marzo 2026         | 768×1024    |

Todos tienen proporción 3:4 y orientación EXIF normal. Los archivos de `public/images` son idénticos a los originales del ZIP; el tamaño y SHA-256 se documentan en [el manifiesto de originales](qa/timeline-photo-originals.json). La asociación procede de los nombres de los archivos, no del orden de subida. Sofi 28 conserva su espacio futuro.

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
- [x] Archivos reales recibidos y asociados por nombre.
- [x] Encuadres y carga de las cinco fotos comprobados.
- [x] Pruebas localizadas y revisión visual de las fases con espacios de foto.
- [x] Regresión end to end y exportación offline con los cinco originales.
- [x] HTML y ZIP locales con las cinco fotos reales incorporadas y validadas.
- [x] Autorización explícita recibida para subir las fotos al repositorio privado y entregar el ZIP con acceso restringido.
- [x] Subida a la rama de entrega y comprobación de acceso y contenido remoto.

## Implementación y primera validación de la composición

- Tarjeta histórica medida: **440×352 px**, con fotografía de **246×328 px**, a 1440×1000. En móvil 390×844: tarjeta de **315×265 px** y fotografía de **181×241 px**. El marco conserva la proporción 3:4 y `object-fit: contain`; el encuadre de cada archivo real debe comprobarse al recibirlo.
- Las fotos y la tipografía se renderizan con HTML; el calendario y los conectores SVG utilizan las mismas coordenadas del modelo. No hay imágenes superpuestas sobre el texto.
- La fecha final reserva 0 px durante la historia y recupera 64/72 px al aparecer. Las tarjetas históricas terminan de desaparecer antes del zoom final. El regalo futuro tiene su propio tamaño, conservando espacio para el mes.
- La alternativa estática usa la misma imagen y proporción; se elimina la duplicación del listado para lectores de pantalla. El texto alternativo de una foto configurada se incorpora al listado accesible del recorrido animado.
- El auditor se ha actualizado para observar también títulos HTML, dimensiones de las fotos y su estado de carga. Las comprobaciones offline recorren los cinco momentos de las fotos y comprueban los recursos configurados, además del resto de la experiencia.
- `npm run validate`: **16 pruebas unitarias + 15 de navegador + 1 offline = 32 aprobadas**, compilación incluida. Después de reforzar el contrato de recursos configurables y el recorrido offline de los cinco recuerdos: **16/16 unitarias y 1/1 offline aprobadas** de nuevo.
- Validación localizada: **4/4 pruebas aprobadas** de bandas, colisiones, separación foto/texto, pantallas estrechas y vista estática. La prueba adicional de tamaño fotográfico, retorno y espacio de fecha también ha pasado en la ronda completa.
- El recorrido completo con rueda, sentido inverso y rotación llega al final en escritorio, móvil, horizontal y movimiento reducido: **0 errores JavaScript, 0 posiciones con overflow**, 80 capturas de fases. Dos tareas de unos 51 ms en el recorrido móvil medido; las rotaciones y capturas añaden otras tareas. Son diagnósticos de Chromium, no una garantía de rendimiento en un teléfono físico.
- **Alcance de aquella ronda:** se probó el borrador con espacios de foto. La recepción del ZIP y la ronda final descrita más abajo resuelven la comprobación pendiente de las imágenes reales.

## Evidencia para revisión

Versión con fotografías originales:

- [Escritorio: cinco fotos y recorrido completo del calendario](qa/timeline-photos-desktop.jpg).
- [Móvil: las mismas fases y encuadres](qa/timeline-photos-mobile.jpg).
- [Fotos completas con movimiento reducido](qa/timeline-photos-static.jpg).
- [Auditoría final de carga, recorrido y rotación](qa/timeline-photos-flow.json).
- Capturas originales en `artifacts/timeline-photos-final/` (artefactos locales ignorados por Git).

Maquetas anteriores, conservadas como antecedente:

- [Composición en escritorio: global, apertura, cinco cumpleaños y final](qa/timeline-photo-layout-desktop.jpg).
- [Las mismas fases en móvil](qa/timeline-photo-layout-mobile.jpg).
- [Alternativa con movimiento reducido](qa/timeline-photo-layout-static.jpg).
- [Resumen del recorrido, orientación y presencia de imágenes](qa/timeline-photo-layout-flow.json).
- Capturas originales: `artifacts/timeline-photos/`. Auditoría detallada: `artifacts/timeline-photos/flow/flow-report.json`. Son artefactos locales ignorados por Git.

## Cierre con los originales

- `npm run validate`: **17 pruebas unitarias + 16 de navegador + 1 offline = 34 aprobadas**, compilación de producción y exportación incluidas.
- Prueba específica de los originales: asociación exacta, dimensiones naturales y carga comprobadas para las cinco fotos a 1440×1000, 390×844, 320×700 y 1000×650, regreso por el timeline y alternativa con movimiento reducido. Proporción del marco contrastada con la de cada imagen, sin recortes.
- Revisión visual de las cinco tarjetas, la apertura y la transición al calendario final en los cuatro tamaños; también de la galería estática. Caras y entorno permanecen visibles; el texto ocupa su propia columna.
- Exportación offline abierta sin conexión: las cinco imágenes se cargan desde `data:image/jpeg`, se recorren los cinco recuerdos y se compara el SHA-256 de cada imagen incrustada con el archivo original. No hay peticiones HTTP para ver la experiencia.
- Se mantienen las verificaciones de mapas, ballet, selección de fechas, accesibilidad, navegación, rotación y overflow del recorrido completo.
- Auditoría final con fotos: 96 capturas (24 por tamaño/modo), los cuatro recorridos llegan al final, **0 errores JavaScript, 0 muestras con overflow y las cinco fotos cargadas en los cuatro casos**. No se registran tareas de más de 50 ms durante el avance con rueda; las capturas y rotaciones posteriores sí generan tareas largas. La prueba se realiza en Chromium, sin una revisión en dispositivos físicos ni Safari.

## Entrega local, autorización y privacidad

- HTML validado: `artifacts/entrega-sofi28/Viena.html`.
- ZIP preparado y comprobado: `artifacts/entrega-sofi28/Sofi28-fotos.zip`. Contiene únicamente `Viena.html` y `LEEME.txt`; el HTML coincide byte a byte con la exportación validada.
- [Recibo de entrega local y SHA-256](qa/timeline-photo-delivery.json).
- La revisión automática rechazó ejecutar `python3 scripts/publish-preview.py`: consideró las cinco fotografías personales un contenido sensible nuevo y que la autorización anterior para detalles e ilustraciones no cubría su publicación pública. Se necesita aprobación explícita del usuario para publicar estas fotos concretas.
- Aclaración de acceso tras la pregunta del usuario: tanto la página de `github.com/MSaula/Sofi28` como el enlace GitHub/raw del ZIP devuelven **404 sin sesión**, mientras que el acceso Git autorizado confirma que la rama `gh-pages` existe. El enlace GitHub del ZIP no es accesible anónimamente y hereda los permisos del repositorio. No se ha confirmado mediante metadatos su etiqueta formal de visibilidad: la API está bloqueada en esta red. GitHub Pages es un canal separado; puede servir públicamente una web y el ZIP de su carpeta raíz aunque el repositorio sea privado. Su configuración/despliegue no están verificados. La referencia previa a «publicación pública» describe la acción propuesta y el motivo de la revisión automática; no demuestra que el repositorio sea público.
- Tras esa aclaración, el usuario ha autorizado explícitamente subir las fotos a su repositorio privado siempre que el enlace requiera sus permisos. La entrega se realizará en `private-download`, una rama inexistente antes de esta autorización, con el ZIP en `downloads/Viena.zip`. No se actualizará `gh-pages`, no se activará Pages ni se cambiará la visibilidad del repositorio. La rama contiene el código y las evidencias, sin workflows de despliegue.
- Antes de la subida, GitHub vuelve a responder 404 a una lectura anónima del repositorio. Se ha detectado y conservado la integración que el usuario hizo en `main` (`66e6acd`, merge de la iteración anterior): su contenido coincide con la base ya incorporada en este trabajo.

## Entrega privada verificada

- [Descargar el ZIP con las fotografías](https://github.com/MSaula/Sofi28/raw/refs/heads/private-download/downloads/Viena.zip). Requiere una cuenta con acceso al repositorio; descomprimir y abrir `Viena.html`.
- Código, fotografías y evidencias subidos a `private-download`; primer commit de entrega: `ea297ee84a79b7816253b14c51ef131a3c84161d`.
- ZIP recuperado de la rama remota y comparado byte a byte con el ZIP validado. Su `Viena.html` coincide con el HTML probado offline (SHA-256 `3fae2c4f3cad67eb7606adeea8516e6a85fc18c43aa7b911a3f93a785af02a02`). También se verifican los cinco JPEG remotos contra los SHA-256 originales.
- El nuevo enlace responde **404 sin sesión**, después de la subida, mientras el contenido existe y puede leerse mediante el acceso Git autorizado.
- `main` permanece en `66e6acd5e8f016ff52ae78eee758054b26b1a0d6` y `gh-pages` en `a276f224e4072e3f60879ed3cc6025304c551322`. No se ha cambiado la visibilidad ni la configuración de Pages, ni se ha actualizado su rama con las fotografías.
