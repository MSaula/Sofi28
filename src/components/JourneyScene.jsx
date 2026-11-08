import { memo, useMemo, useRef } from "react";
import { geoMercator, geoPath } from "d3-geo";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Home,
  Plane,
  X,
} from "lucide-react";
import { useElementSize, useScene } from "../hooks";
import { trip } from "../content";
import {
  airports,
  boundsFeature,
  downloadMapData,
  europe,
  fitCamera,
  landmarks,
  transformPoint,
  vienna,
} from "../geography";
import {
  clamp,
  journeyState,
  mix,
  quadraticPoint,
  quadraticTangent,
  quadraticLengthTable,
  quadraticParameterAtLength,
} from "../motion";

const EuropeanLand = memo(function EuropeanLand({ projection }) {
  const paths = useMemo(
    () => europe.features.map((f) => ({ id: f.id, d: geoPath(projection)(f) })),
    [projection],
  );
  return (
    <g className="europe-land">
      {paths.map((f) => (
        <path key={f.id} d={f.d} />
      ))}
    </g>
  );
});

const CityStreets = memo(function CityStreets({ projection }) {
  const layers = useMemo(() => {
    const path = geoPath(projection);
    const result = { street: [], major: [], reference: [] };
    for (const feature of vienna.features)
      result[feature.properties.class].push(path(feature));
    return Object.fromEntries(
      Object.entries(result).map(([key, values]) => [key, values.join("")]),
    );
  }, [projection]);
  return (
    <g
      className="real-street-network"
      data-source-commit={vienna.source.commit}
    >
      <path className="city-road-case" d={layers.street} />
      <path className="city-road-minor" d={layers.street} />
      <path className="city-road-major-case" d={layers.major} />
      <path className="city-road-major" d={layers.major} />
      <path className="city-reference-street" d={layers.reference} />
    </g>
  );
});

function Label({
  point,
  title,
  subtitle,
  width,
  height,
  primary = false,
  hidden = false,
}) {
  const textWidth =
    Math.max(title.length * 6.3, (subtitle?.length || 0) * 4.8) + 20;
  const x = clamp(point[0], textWidth / 2 + 8, width - textWidth / 2 - 8);
  const above = point[1] > 58;
  const y = clamp(point[1] + (above ? -33 : 31), 25, height - 36);
  return (
    <g
      className={`map-label ${primary ? "primary-map-label" : ""}`}
      opacity={hidden ? 0 : 1}
    >
      {Math.abs(x - point[0]) > 8 && (
        <path d={`M${point}L${x},${y + 8}`} stroke="#b3bbc6" fill="none" />
      )}
      <circle cx={point[0]} cy={point[1]} r={primary ? 4.5 : 3} />
      <text x={x} y={y} textAnchor="middle">
        {title}
      </text>
      {subtitle && (
        <text
          className="map-label-subtitle"
          x={x}
          y={y + 15}
          textAnchor="middle"
        >
          {subtitle}
        </text>
      )}
    </g>
  );
}

function EuropeMap({ size, state, staticMode }) {
  const { width: w, height: h } = size;
  const projection = useMemo(
    () =>
      geoMercator().fitExtent(
        [
          [Math.min(64, w * 0.17), h * 0.22],
          [w - Math.min(64, w * 0.17), h * 0.79],
        ],
        {
          type: "LineString",
          coordinates: [airports.BCN.coordinates, airports.VIE.coordinates],
        },
      ),
    [w, h],
  );
  const a = projection(airports.BCN.coordinates),
    b = projection(airports.VIE.coordinates);
  const control = [
    (a[0] + b[0]) / 2,
    Math.max(38, Math.min(a[1], b[1]) - Math.min(95, h * 0.16)),
  ];
  const t = staticMode ? 1 : state.flightProgress;
  const lengths = useMemo(
    () => quadraticLengthTable(a, control, b),
    [projection],
  );
  const parameter = quadraticParameterAtLength(lengths, t);
  const plane = quadraticPoint(a, control, b, parameter);
  const tangent = quadraticTangent(a, control, b, parameter);
  const angle = (Math.atan2(tangent[1], tangent[0]) * 180) / Math.PI + 45;
  const zoom = staticMode ? 0 : state.europeZoom;
  const s = mix(1, 1.65, zoom);
  // Linear matrix interpolation keeps the destination on screen during handoff.
  const tx = (w / 2 - b[0] * 1.65) * zoom,
    ty = (h / 2 - b[1] * 1.65) * zoom;
  const reveal = staticMode || state.destinationRevealed;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="geographic-svg europe-map"
      role="img"
      aria-label={
        reveal
          ? "Mapa real de Europa: Barcelona a Viena"
          : "Mapa de Europa: salida desde Barcelona"
      }
    >
      <g transform={`translate(${tx} ${ty}) scale(${s})`}>
        <EuropeanLand projection={projection} />
        <path className="air-route-track" d={`M${a}Q${control} ${b}`} />
        <path
          data-testid="flight-route"
          className="air-route-progress"
          d={`M${a}Q${control} ${b}`}
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - t}
        />
        <Label
          point={a}
          title="Barcelona"
          subtitle="BCN · EL PRAT"
          width={w}
          height={h}
          hidden={zoom > 0.1}
        />
        <Label
          point={b}
          title={reveal ? "Viena" : "El siguiente destino"}
          subtitle={reveal ? "VIE" : ""}
          width={w}
          height={h}
          hidden={!reveal || zoom > 0.35}
          primary
        />
        <g
          data-testid="plane-marker"
          data-progress={t}
          data-angle={angle}
          transform={`translate(${plane[0]} ${plane[1]})`}
          opacity={staticMode ? 1 : state.planeOpacity}
        >
          <circle r="21" className="plane-halo" />
          <circle r="14" className="plane-disc" />
          <g transform={`rotate(${angle})`}>
            <g transform="translate(-8 -8)">
              <Plane size={16} strokeWidth={1.7} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

function ViennaMap({ size, state, staticMode }) {
  const { width: w, height: h } = size;
  const projections = useMemo(
    () => ({
      from: geoMercator().fitExtent(
        [
          [26, 28],
          [w - 26, h - 28],
        ],
        boundsFeature([16.354, 48.198, 16.407, 48.222]),
      ),
      to: geoMercator().fitExtent(
        [
          [Math.min(75, w * 0.19), 52],
          [w - Math.min(75, w * 0.19), h - 58],
        ],
        boundsFeature([16.365, 48.201, 16.401, 48.215]),
      ),
    }),
    [w, h],
  );
  const camera = fitCamera(
    projections.from,
    projections.to,
    staticMode ? 1 : state.cityZoom,
  );
  const point = (coordinate) =>
    transformPoint(projections.from(coordinate), camera);
  const home = point(trip.airbnb.coordinates);
  const east = point([
    trip.airbnb.coordinates[0] +
      trip.airbnb.uncertaintyMeters /
        (111320 * Math.cos((trip.airbnb.coordinates[1] * Math.PI) / 180)),
    trip.airbnb.coordinates[1],
  ]);
  const radius = Math.abs(east[0] - home[0]);
  const reveal = staticMode ? 1 : state.stayOpacity;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="geographic-svg vienna-map"
      role="img"
      aria-label="Calles reales del centro de Viena. Zona aproximada del alojamiento en Untere Weißgerberstraße, no ubicación verificada del edificio 37."
    >
      <g
        transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}
      >
        <CityStreets projection={projections.from} />
      </g>
      <g className="orientation-landmarks">
        {landmarks
          .filter(
            (landmark, i) =>
              i === 0 ||
              Math.hypot(
                point(landmark.coordinates)[0] - home[0],
                point(landmark.coordinates)[1] - home[1],
              ) > 95,
          )
          .map((landmark) => (
            <Label
              key={landmark.name}
              point={point(landmark.coordinates)}
              title={landmark.name}
              width={w}
              height={h}
            />
          ))}
      </g>
      <g
        className="stay-map-location"
        data-testid="stay-location"
        data-precision="approximate-street"
        opacity={reveal}
      >
        <circle
          className="location-uncertainty"
          cx={home[0]}
          cy={home[1]}
          r={radius}
        />
        <g
          transform={`translate(${home[0]} ${home[1]})`}
          data-testid="stay-pin"
        >
          <circle className="stay-pin-disc" r="18" />
          <g transform="translate(-8 -8)">
            <Home size={16} strokeWidth={1.7} />
          </g>
        </g>
        <Label
          point={home}
          title="Nuestro lugar"
          subtitle="ZONA APROXIMADA"
          width={w}
          height={h}
          hidden={reveal < 0.5}
        />
      </g>
    </svg>
  );
}

function MapPanel({ state, staticMode, kind }) {
  const [ref, size] = useElementSize();
  return (
    <div ref={ref} className={`map-panel ${kind || "animated-map-panel"}`}>
      {size.width > 0 && (
        <>
          {(staticMode ? kind === "europe-static" : true) && (
            <div
              className="map-layer europe-layer"
              style={{ opacity: staticMode ? 1 : state.europeOpacity }}
              aria-hidden={!staticMode && state.europeOpacity < 0.1}
            >
              <EuropeMap size={size} state={state} staticMode={staticMode} />
            </div>
          )}
          {(staticMode ? kind === "vienna-static" : true) && (
            <div
              className="map-layer city-layer"
              style={{ opacity: staticMode ? 1 : state.cityOpacity }}
              aria-hidden={!staticMode && state.cityOpacity < 0.1}
            >
              <ViennaMap size={size} state={state} staticMode={staticMode} />
            </div>
          )}
        </>
      )}
      <div className="map-panel-corner" aria-hidden="true">
        <span>N</span>
        <ArrowDown size={11} />
      </div>
      <span className="map-panel-caption">
        {staticMode
          ? kind === "europe-static"
            ? "EUROPA"
            : "VIENA · CENTRO"
          : state.cityOpacity > 0.5
            ? "VIENA · CENTRO"
            : "EUROPA"}
      </span>
    </div>
  );
}

export default function JourneyScene() {
  const { ref, progress: p, reduced: staticMode } = useScene();
  const state = journeyState(p);
  const credits = useRef(null);
  const mapLink = `https://www.openstreetmap.org/?mlat=${trip.airbnb.coordinates[1]}&mlon=${trip.airbnb.coordinates[0]}#map=16/${trip.airbnb.coordinates[1]}/${trip.airbnb.coordinates[0]}`;
  return (
    <section
      className={`scroll-scene journey-scene ${staticMode ? "reduced-scene static-journey" : ""}`}
      ref={ref}
      id="destino"
      data-journey-phase={state.phase}
      aria-label="El vuelo a Viena y la zona del alojamiento"
    >
      <div className="scene-sticky journey-stage">
        <div className="journey-heading-row">
          <span className="eyebrow">
            <span className="blue-dot" />
            02 — DÓNDE
          </span>
          <span className="tiny-label">{trip.shortDates}</span>
        </div>
        <div className="journey-heading-copy">
          <h2>{staticMode ? "De Barcelona a Viena." : state.title}</h2>
          <p>
            {state.destinationRevealed || staticMode
              ? "Barcelona · BCN → Viena · VIE"
              : "Salimos de Barcelona. El destino está por descubrir."}
          </p>
        </div>
        {staticMode ? (
          <div className="static-map-pair">
            <MapPanel state={state} staticMode kind="europe-static" />
            <MapPanel state={state} staticMode kind="vienna-static" />
          </div>
        ) : (
          <MapPanel state={state} staticMode={false} />
        )}
        <div className="journey-location-row">
          {state.stayOpacity > 0.5 || staticMode ? (
            <div className="location-description">
              <Home size={17} />
              <div>
                <strong>Untere Weißgerberstraße 37</strong>
                <span>Referencia aproximada · edificio por confirmar</span>
              </div>
            </div>
          ) : (
            <div className="journey-flight-description">
              <Plane size={17} />
              <span>
                Barcelona <ArrowRight size={13} />{" "}
                {state.destinationRevealed ? "Viena" : "Por descubrir"}
              </span>
            </div>
          )}
          <a
            className="text-link real-map-link"
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden={!staticMode && state.stayOpacity < 0.5}
            tabIndex={!staticMode && state.stayOpacity < 0.5 ? -1 : 0}
            style={{
              visibility:
                state.stayOpacity > 0.5 || staticMode ? "visible" : "hidden",
            }}
          >
            Abrir mapa <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="journey-attribution">
          <span>
            {state.cityOpacity > 0.5 || staticMode ? (
              <>
                <a
                  href={vienna.source.copyrightUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  © OpenStreetMap contributors
                </a>
                <button onClick={() => credits.current.showModal()}>
                  Datos y precisión
                </button>
              </>
            ) : (
              "Cartografía: Natural Earth · conexión aérea ilustrativa"
            )}
          </span>
          <ArrowDown size={13} />
        </div>
      </div>
      <dialog
        ref={credits}
        className="credits-dialog"
        aria-labelledby="map-credits-title"
      >
        <button
          className="icon-button close-dialog"
          onClick={() => credits.current.close()}
          aria-label="Cerrar información del mapa"
        >
          <X />
        </button>
        <span className="eyebrow">CARTOGRAFÍA Y UBICACIÓN</span>
        <h2 id="map-credits-title">Sobre este mapa.</h2>
        <p>
          Cartografía de calles de OpenStreetMap. Extracto de Viena:
          EqualStreetNames, 2 de octubre de 2026. Puedes abrir el mapa de
          OpenStreetMap para consultar más capas y comprobar una dirección.
        </p>
        <p>
          La dirección facilitada, {trip.airbnb.address}, es orientativa. El
          círculo representa una zona sobre esa calle; el punto no identifica un
          edificio confirmado.
        </p>
        <div className="map-data-links">
          <a
            className="text-link"
            href={vienna.source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fuente de los datos <ArrowUpRight size={14} />
          </a>
          <a
            className="text-link"
            href={vienna.source.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Licencia ODbL 1.0 <ArrowUpRight size={14} />
          </a>
          <button className="text-link" onClick={downloadMapData}>
            Descargar datos cartográficos <ArrowDown size={14} />
          </button>
        </div>
      </dialog>
    </section>
  );
}
