# Sofi 28 — portada y cronología 2022–2027

## Alcance

Aplicar esta iteración sobre la versión auditada, manteniendo carta, mapas, apartamento, ballet y resumen. No completar fotografías ni inventar recuerdos.

1. **Identidad y portada:** título de navegador y marcas visibles «Sofi 28». Portada «Hoy cumples 28 años.» y subtítulo «Y eso merece un regalo a la altura.». Mantener la carta independiente y de longitud libre.
2. **Datos:** ampliar la cronología desde enero de 2022. Añadir Niza (marzo 2022), Mallorca (agosto 2022), Londres (enero 2023), Montenegro (agosto 2023), Roma (octubre 2023) e Islandia (diciembre 2023), conservando los nueve viajes ya indicados y su orden.
3. **Regalos destacados:** Niza → Sofi 23; Londres → Sofi 24; Islandia → Sofi 25; Dolomitas → Sofi 26; Florencia → Sofi 27; regalo actual → Sofi 28. Cada uno tendrá un espacio configurable para una foto de los dos. Los cinco recuerdos y el regalo actual son seis espacios, sin fotos ficticias.
4. **Distribución:** regalos en la parte superior del timeline, viajes ordinarios en la inferior. Evitar solapes dentro de cada banda y recortes en los extremos. En la vista global se usarán etiquetas compactas; al acercarse, se abrirán las tarjetas con foto para conservar legibilidad.
5. **Movimiento:** conservar vista global → acercamiento → recorrido horizontal → enero de 2027 con 22–24 marcados. Calcular todos los índices respecto al nuevo comienzo; eliminar posiciones/longitudes antiguas fijadas a 2024. Ajustar la distancia de scroll para que los años y fotos adicionales no pasen a toda velocidad.
6. **Final del calendario:** mostrar Sofi 28 con su espacio para foto, reservando altura para la tarjeta y el mes. Mantener la revelación del destino en el mapa: aquí el regalo actual se identifica como «Lo próximo».
7. **Validación localizada:** identidad/portada; datos y edades; posiciones, colisiones, fotografías y fecha final del calendario. Comprobar escritorio, móvil, pantallas estrechas, paisaje y movimiento reducido.
8. **Validación final:** regresiones completas de los mapas y la ópera, teclado, accesibilidad, giro de pantalla y exportación offline. Actualizar la vista previa únicamente después de las comprobaciones.

## Seguimiento

- [x] Identidad y portada.
- [x] Datos 2022–2027 y asociación Sofi 23–28.
- [x] Dos bandas y seis espacios para fotografías.
- [x] Vista global, recorrido y calendario final sin recortes ni solapes.
- [x] Pruebas localizadas y revisión visual.
- [x] Validación end to end y exportación offline.
- [x] Actualización de la vista previa y evidencia de resultados.

## Criterios de aceptación

- Quince viajes anteriores y el regalo actual en la cronología, sin inventar días de los viajes pasados.
- Los cinco viajes de cumpleaños indicados y la edición actual aparecen arriba; los otros diez viajes aparecen abajo.
- Los seis espacios de foto son descubribles durante el recorrido y pueden configurarse desde los datos.
- Todos los viajes se pueden leer al recorrer el calendario, aunque la vista global descarte etiquetas que no caben.
- Enero de 2027 y los días 22–24 conservan su selección; el destino se descubre después, en el mapa.
- Sin overflow horizontal, colisiones entre tarjetas, cambios de capítulo al girar ni regresiones en el resto de la página.

## Cambios localizados y problemas resueltos

| Área                 | Causa / riesgo comprobado                                                                                                                        | Solución                                                                                                                                                                | Verificación                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identidad            | Título HTML, marcas y capítulo inicial repetían «Para ti»; el texto inicial ya no correspondía al encargo.                                       | Marca compartida «Sofi 28», título «Hoy cumples 28 años.» y subtítulo «Y eso merece un regalo a la altura.». Se conserva «Para ti. Siempre.» como firma de la carta.    | Título de navegador, h1 y subtítulo comprobados en navegador y exportación offline.                                                                                             |
| Ampliación de fechas | El calendario comenzaba en agosto de 2024 y el eje/puntos tenían posiciones fijadas a ese inicio.                                                | Modelo relativo en `src/timeline.js`: 61 meses de enero de 2022 a enero de 2027, puntos, eje y cámara derivados del mismo origen. El primer acercamiento apunta a Niza. | Fechas y orden contrastados con la solicitud; prueba del rango completo y del centrado final.                                                                                   |
| Distribución         | Alternar etiquetas arriba/abajo por índice no permite distinguir los regalos.                                                                    | Dos bandas según `birthdayAge`: cinco regalos anteriores y Sofi 28 arriba, otros diez viajes abajo. Tarjetas compactas en global y seis espacios de foto al acercarse.  | 51 muestras por escritorio/móvil: posiciones de ambas bandas, colisiones, bordes y descubrimiento de los 16 eventos. Solo se cuentan eventos con opacidad acumulada suficiente. |
| Etiquetas próximas   | En la primera prueba de navegador, País Vasco no aparecía en el muestreo: Grecia, un mes antes, tenía prioridad constante por orden cronológico. | En caso de conflicto se prioriza la etiqueta más cercana al centro de la cámara.                                                                                        | La prueba inicialmente fallaba en escritorio y móvil. Tras la corrección se descubren todos los viajes en ambos tamaños, sin solapamientos.                                     |
| Expansión de fotos   | Durante el acercamiento, una foto a tamaño completo pero semitransparente podía ocupar el espacio del texto aún compacto.                        | La foto escala y gana opacidad al mismo ritmo que se abre la tarjeta y se desplaza su texto.                                                                            | Comprobación geométrica entre foto y título en fotogramas intermedios, a 320×700, 1000×650 y 390×620.                                                                           |
| Calendario final     | La foto actual añade altura sobre el mes y podía recortar la selección.                                                                          | Ajuste de cámara que reserva la altura de tarjeta, separación y mes antes de escalar. Tarjetas algo más compactas en pantallas bajas.                                   | Tarjeta Sofi 28 y mes dentro del contenedor; 22, 23 y 24 con fondo azul/texto blanco y resultado visible.                                                                       |
| Vista estática       | Saltar directamente al estado final con movimiento reducido ocultaría los nuevos recuerdos visuales.                                             | Galería de los cinco cumpleaños anteriores y lista de los diez viajes antes del mes final y su sexta foto (Sofi 28).                                                    | Cinco tarjetas + diez viajes + foto actual comprobados en horizontal y movimiento reducido, sin overflow.                                                                       |
| Fotografías futuras  | La exportación anterior solo incrustaba ilustraciones SVG.                                                                                       | Aceptar también archivos locales WebP, JPEG, PNG y AVIF, manteniendo los seis valores `photo: null` configurables.                                                      | Exportación actual validada sin red. Las fotografías reales se revisarán cuando se añadan. Instrucciones en README.                                                             |

## Resultado de validación

- `npm run validate`: **15 pruebas unitarias, 14 pruebas de navegador y 1 prueba offline aprobadas**, además de la compilación de producción.
- Pruebas localizadas repetidas después de corregir la prioridad de etiquetas y reforzadas para considerar la opacidad de todos los ancestros: **2/2 aprobadas**.
- Flujo completo con rueda, recorrido inverso, rotación, navegación, exportación ICS, mapas y ópera. Incluye 1440×1000, 390×844, 844×390, 1000×650 y 320×700; el calendario se comprueba también a 390×620.
- Auditoría independiente: `QA_CAPTURE=0 QA_OUT=artifacts/sofi28-flow npm run audit:flow`. Cuatro casos alcanzan el final; **0 errores JS, 0 muestras con overflow y 0 tareas de más de 50 ms durante el recorrido hacia abajo**. El giro de pantalla y otros pasos posteriores sí generan tareas de más de 50 ms; esta medición de Chromium no equivale a una garantía de rendimiento en dispositivos físicos.
- Revisión visual de portada, vista global, expansión, cinco regalos históricos y final en escritorio, móvil, móvil estrecho y portátil bajo; galería estática revisada por separado.
- El resto de contenidos y mapas conserva su modelo. No se han añadido fotografías ficticias, billetes, códigos de acceso ni datos de reservas.

## Evidencia

- [Portada y fases en escritorio](qa/sofi28-desktop.jpg).
- [Portada y fases en móvil](qa/sofi28-mobile.jpg).
- [Recuerdos con movimiento reducido](qa/sofi28-static-history.jpg).
- [Resumen medido del recorrido y rotación](qa/sofi28-flow-summary.json).
- Capturas originales: `artifacts/sofi28/`; informe de flujo completo: `artifacts/sofi28-flow/flow-report.json` (artefactos locales, ignorados por Git).

Las pruebas usan Chromium con emulación de tamaños, sin una revisión en Safari ni en teléfonos físicos. Las seis fotografías reales están pendientes de aportarse.

## Entrega

- Vista previa y ZIP actualizados en `gh-pages`, commit `a276f224e4072e3f60879ed3cc6025304c551322`.
- HTML remoto y `Viena.html` dentro del ZIP comparados byte a byte con el archivo validado offline. SHA-256: `6b49b92413af3424a4dba141aaac6822f188b34af53ff6f3c47dd0a09b9d5bd9`.
- `main` permanece en `2cce82eb048c4eefb59f7690afedaa0c43e0eb72`. Código y evidencias en `qa/animation-flow`.
- [Descargar el ZIP actualizado desde GitHub](https://github.com/MSaula/Sofi28/raw/refs/heads/gh-pages/Viena.zip). Descomprimir y abrir `Viena.html`.
- Esta comprobación confirma la entrega en la rama y el ZIP; no confirma un despliegue web de GitHub Pages.
