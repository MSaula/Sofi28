# Wiener Staatsoper y Living Legacies — cuaderno III

[**Abrir el paquete del informe en GitHub**](https://github.com/MSaula/Sofi28/blob/416546937fc4ecdedbe4a6065725f8bd49d34547/downloads/Informe-Opera-Viena.zip). Requiere sesión iniciada con una cuenta autorizada. Pulsar ↓ / «Download raw file», descomprimir **toda la carpeta** y abrir **Informe-Opera-Viena.html**, manteniendo junto a ella `fotos/` y `planos/`.

El cuaderno reúne **44 fotografías descargadas y dos vistas de asiento enlazadas**, 7 plantas oficiales, el PDF real de asientos 2026/27 con las plazas 23 y 24 señaladas y un informe sobre las tres coreografías, la música, los créditos, el edificio y la visita. Incluye **11 fotografías oficiales de Living Legacies** de 2.500 px de lado largo, de Ashley Taylor, y fotos de sala, palcos genéricos, salones, backstage y exterior. Los archivos mantienen los bytes recibidos.

La función documentada es la del **22/01/2027 a las 19:00**. El sistema identifica **Mittelloge, fila 3, asientos 23 y 24**, como s500/s501, categoría 3. Las dos imágenes están vinculadas por el simulador a cada plaza, pero el CDN devuelve un error de conexión 503: **no están descargadas ni se contabilizan entre las 44**. Tampoco se atribuyen las fotos genéricas de palcos al interior exacto de Mittelloge. La ausencia de un reparto de bailarines para la fecha y la discrepancia entre los tiempos anunciados se documentan expresamente.

## Índices y evidencia

- [Catálogo de imágenes, créditos, dimensiones y SHA-256](indice-imagenes.json).
- [Identificación de asientos y anotación del plano](evidencia-asientos.json).
- [Fuentes consultadas](fuentes.json).
- [Método, incidencias y validación](plan-y-validacion.md).
- [Resultados funcionales](validacion.json) y [preservación de la web](preservacion.json).
- [Recibo de la entrega privada](entrega.json).

El HTML, fotografías locales, planos, filtros y visor funcionan con los archivos del paquete; los enlaces externos y las vistas pendientes requieren Internet. La auditoría usa Chromium y cinco tamaños/modos, con los recursos servidos desde bytes locales mediante interceptación y las conexiones externas bloqueadas. El navegador administrado impide navegar a file://; esa política se ha respetado y el modo directo no se presenta como ejecutado.

Los cuatro exteriores de Commons conservan sus licencias y autoría. Las fotografías oficiales sin licencia abierta declarada son referencias documentales; habrá que confirmar condiciones antes de una publicación posterior.

Los scripts `collect-opera-research.py`, `build-opera-report.py` y `validate-opera-report.cjs` documentan la preparación y auditoría. La preparación utiliza los snapshots públicos y los datos de la consulta guardados en `/workspace/artifacts/opera-research`, con requests, BeautifulSoup, Pillow y PyMuPDF en un entorno Python temporal. El paquete entregado ya contiene todos los archivos necesarios para leerlo y reutilizar su catálogo: no requiere ejecutar esos scripts.

**La página principal, src, public y Viena.zip se conservan sin cambios.** La entrega se añade exclusivamente a `private-download`, sin despliegue público.
