import { memo, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Home,
  Maximize2,
  Plane,
  X,
} from "lucide-react";
import { useElementSize, useScene } from "../hooks";
import { trip } from "../content";
import {
  buildEuropeModel,
  europeCamera,
  europePlaces,
  flightAt,
} from "../europeMap";
import {
  airports,
  boundsFeature,
  downloadMapData,
  europe,
  fitCamera,
  transformPoint,
  vienna,
} from "../geography";
import { clamp, journeyState, range, smooth } from "../motion";
import { ViennaContext, ViennaMarkers } from "./ViennaCartography";

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
  testId,
  below = false,
  opacity = 1,
}) {
  const textWidth =
    Math.max(title.length * 6.3, (subtitle?.length || 0) * 4.8) + 20;
  const x = clamp(point[0], textWidth / 2 + 8, width - textWidth / 2 - 8);
  const above = !below && point[1] > 58;
  const y = clamp(point[1] + (above ? -33 : 31), 25, height - 36);
  return (
    <g
      className={`map-label ${primary ? "primary-map-label" : ""}`}
      data-testid={testId}
      opacity={hidden ? 0 : opacity}
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

function EuropeanPlaces({ model, opacity, flight, planeOpacity }) {
  return (
    <g className="europe-place-labels" opacity={opacity}>
      {model.labels
        .filter((p) => p.rect)
        .map((place) => {
          const { point, rect } = place;
          const x = clamp(point[0], rect.x + 3, rect.x + rect.width - 3);
          const y = clamp(point[1], rect.y + 2, rect.y + rect.height - 2);
          return (
            <g
              key={place.id}
              data-map-place={place.id}
              data-place-kind={place.kind}
              data-visited={place.visited ? "true" : "false"}
              data-lon={place.coordinates[0]}
              data-lat={place.coordinates[1]}
              opacity={
                1 -
                planeOpacity *
                  (1 -
                    smooth(
                      range(
                        Math.hypot(
                          clamp(flight.point[0], rect.x, rect.x + rect.width) -
                            flight.point[0],
                          clamp(flight.point[1], rect.y, rect.y + rect.height) -
                            flight.point[1],
                        ),
                        16,
                        34,
                      ),
                    ))
              }
              className={`europe-place ${place.visited ? "europe-place-visited" : ""} ${place.kind !== "city" ? "europe-place-region" : ""}`}
            >
              <title>
                {place.name}
                {place.kind === "city"
                  ? ""
                  : " · referencia regional, no una ciudad concreta"}
              </title>
              {Math.hypot(x - point[0], y - point[1]) > 14 && (
                <path className="place-leader" d={`M${point}L${x},${y}`} />
              )}
              <circle
                data-place-marker
                cx={point[0]}
                cy={point[1]}
                r={place.visited ? 2.8 : 2}
              />
              <text
                data-place-label
                x={rect.x + 2}
                y={rect.y + place.fontSize + 1}
                fontSize={place.fontSize}
              >
                {place.name}
              </text>
            </g>
          );
        })}
    </g>
  );
}

function EuropeMap({ size, state, staticMode }) {
  const { width: w, height: h } = size;
  const model = useMemo(() => buildEuropeModel(w, h), [w, h]);
  const t = staticMode ? 1 : state.flightProgress;
  const flight = flightAt(model, t);
  const zoom = staticMode ? 0 : state.europeZoom;
  const camera = europeCamera(model, zoom);
  const reveal = staticMode || state.destinationRevealed;
  const labelsOpacity = 1 - smooth(range(zoom, 0, 0.25));
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: w, height: h }}
      className="geographic-svg europe-map"
      role="img"
      aria-label={
        reveal
          ? "Mapa real de Europa: Barcelona a Viena"
          : "Mapa de Europa con ciudades y recuerdos anteriores. Salida desde Barcelona; destino por descubrir."
      }
    >
      <g
        transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}
      >
        <EuropeanLand projection={model.projection} />
        <EuropeanPlaces
          model={model}
          opacity={labelsOpacity}
          flight={flight}
          planeOpacity={
            staticMode
              ? 0
              : state.planeOpacity *
                smooth(range(t, 0, 0.06)) *
                (1 - smooth(range(t, 0.92, 1)))
          }
        />
        <path
          data-testid="flight-route"
          className="air-route-progress"
          d={model.d}
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - t}
          opacity={t > 0 ? labelsOpacity : 0}
        />
        <Label
          point={model.a}
          title="Barcelona"
          subtitle="BCN · EL PRAT"
          width={w}
          height={h}
          opacity={1 - smooth(range(zoom, 0, 0.2))}
          testId="departure-label"
          below
        />
        {reveal && (
          <Label
            point={model.b}
            title="Viena"
            subtitle="VIE"
            width={w}
            height={h}
            opacity={labelsOpacity}
            primary
            testId="destination-label"
          />
        )}
        <g
          data-testid="plane-marker"
          data-progress={t}
          data-angle={flight.angle}
          transform={`translate(${flight.point[0]} ${flight.point[1]})`}
          opacity={staticMode ? 1 : state.planeOpacity * labelsOpacity}
        >
          <circle r="16" className="plane-halo" />
          <circle r="11" className="plane-disc" />
          <g transform={`rotate(${flight.angle})`}>
            <g transform="translate(-6.5 -6.5)">
              <Plane size={13} strokeWidth={1.7} />
            </g>
          </g>
        </g>
      </g>
      <g className="europe-legend" opacity={labelsOpacity}>
        <circle cx="17" cy="18" r="2.5" />
        <text x="25" y="21">
          Lugares compartidos
        </text>
      </g>
    </svg>
  );
}

function ViennaMap({ size, state, staticMode, onExplore }) {
  const { width: w, height: h } = size;
  const [hover, setHover] = useState(null);
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
  const reveal = staticMode ? 1 : state.stayOpacity;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="geographic-svg vienna-map"
      style={{ width: w, height: h }}
      role="group"
      aria-label="Mapa de Viena y punto del apartamento. Selecciona un lugar para explorar la ciudad y sus recorridos a pie."
    >
      <g
        transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}
      >
        <ViennaContext projection={projections.from} roads={false} />
        <CityStreets projection={projections.from} />
      </g>
      <ViennaMarkers
        projection={projections.from}
        view={{ k: camera.scale, x: camera.x, y: camera.y }}
        width={w}
        height={h}
        opacity={staticMode ? 1 : smooth(range(state.stayOpacity, 0.55, 1))}
        interactive={staticMode || state.stayOpacity > 0.99}
        compact
        showHome={false}
        hover={hover}
        onHover={setHover}
        onSelect={(id, node) => onExplore(id, node)}
      />
      <g
        className="stay-map-location"
        data-testid="stay-location"
        data-precision={trip.airbnb.locationPrecision}
        data-longitude={trip.airbnb.coordinates[0]}
        data-latitude={trip.airbnb.coordinates[1]}
        opacity={reveal}
      >
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
          subtitle="PUNTO DEL ANUNCIO"
          width={w}
          height={h}
          opacity={smooth(range(reveal, 0.2, 0.9))}
        />
      </g>
    </svg>
  );
}

function MapPanel({ state, staticMode, kind, onExplore }) {
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
              <ViennaMap
                size={size}
                state={state}
                staticMode={staticMode}
                onExplore={onExplore}
              />
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
          : state.phase === "city" || state.phase === "stay"
            ? "VIENA · CENTRO"
            : "EUROPA"}
      </span>
      {(!staticMode || kind === "vienna-static") && (
        <button
          className="v-compact-explore"
          onClick={(event) => onExplore(null, event.currentTarget)}
          tabIndex={staticMode || state.stayOpacity > 0.99 ? 0 : -1}
          aria-hidden={!staticMode && state.stayOpacity <= 0.99}
          style={{
            opacity: staticMode ? 1 : smooth(range(state.stayOpacity, 0.7, 1)),
            visibility:
              staticMode || state.stayOpacity > 0.7 ? "visible" : "hidden",
            pointerEvents:
              staticMode || state.stayOpacity > 0.99 ? "auto" : "none",
          }}
        >
          <span>
            <strong>Explorar Viena</strong>
            <small>32 lugares · rutas a pie</small>
          </span>
          <Maximize2 size={18} />
        </button>
      )}
    </div>
  );
}

export default function JourneyScene({ explorerRef }) {
  const { ref, progress: p, reduced: staticMode } = useScene();
  const state = journeyState(p);
  const credits = useRef(null);
  const explore = (id, node) => explorerRef.current?.open(id, node);
  const mapLink = `https://www.openstreetmap.org/?mlat=${trip.airbnb.coordinates[1]}&mlon=${trip.airbnb.coordinates[0]}#map=16/${trip.airbnb.coordinates[1]}/${trip.airbnb.coordinates[0]}`;
  return (
    <section
      className={`scroll-scene journey-scene ${staticMode ? "reduced-scene static-journey" : ""}`}
      ref={ref}
      id="destino"
      data-journey-phase={state.phase}
      aria-label={
        staticMode || state.destinationRevealed
          ? "El vuelo a Viena y el punto del anuncio del alojamiento"
          : "Un viaje y un destino por descubrir"
      }
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
          <h2>{staticMode ? "¿A dónde iremos?" : state.title}</h2>
          <p>
            {state.destinationRevealed || staticMode
              ? "Barcelona · BCN → Viena · VIE"
              : "Salimos de Barcelona. El destino está por descubrir."}
          </p>
        </div>
        {staticMode ? (
          <div className="static-map-pair">
            <MapPanel
              state={state}
              staticMode
              kind="europe-static"
              onExplore={explore}
            />
            <MapPanel
              state={state}
              staticMode
              kind="vienna-static"
              onExplore={explore}
            />
          </div>
        ) : (
          <MapPanel state={state} staticMode={false} onExplore={explore} />
        )}
        <div className="journey-location-row">
          {state.stayOpacity > 0.5 || staticMode ? (
            <div className="location-description">
              <Home size={17} />
              <div>
                <strong>{trip.airbnb.neighborhood}</strong>
                <span>Punto del anuncio · ubicación aproximada</span>
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
                {" · "}
                <a
                  href="https://data.wien.gv.at/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stadt Wien
                </a>
              </>
            ) : (
              "Natural Earth · GeoNames · conexión aérea ilustrativa"
            )}
            <button onClick={() => credits.current.showModal()}>
              Datos y precisión
            </button>
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
          Europa: límites de Natural Earth y ciudades de Natural Earth y
          GeoNames. Los nombres de islas y regiones señalan referencias
          geográficas, sin atribuir una ciudad visitada. La traza aérea es una
          conexión ilustrativa entre los aeropuertos, no un itinerario de vuelo.
        </p>
        <p>
          Cartografía de calles de OpenStreetMap. Extracto de Viena:
          EqualStreetNames, 2 de octubre de 2026. Puedes abrir el mapa de
          OpenStreetMap para consultar más capas y comprobar una dirección.
        </p>
        <p>
          Manzanas, zonas verdes y agua: datos oficiales de Stadt Wien, CC BY
          3.0 AT. Los 32 lugares se han contrastado con objetos de
          OpenStreetMap; las rutas usan el perfil peatonal de FOSSGIS/OSRM. Las
          distancias y los tiempos son orientativos desde el punto del anuncio,
          sin paradas.
        </p>
        <p>
          El marcador corresponde al punto publicado en el anuncio de Airbnb. La
          plataforma lo indica como ubicación aproximada: no identifica un
          edificio confirmado. La dirección exacta debe consultarse en la
          reserva. No se atribuye un radio de precisión que el anuncio no
          proporciona.
        </p>
        <div className="map-data-links">
          <a
            className="text-link"
            href={europePlaces.source.naturalEarth.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Natural Earth · dominio público <ArrowUpRight size={14} />
          </a>
          <a
            className="text-link"
            href={europePlaces.source.geonames.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            GeoNames · CC BY 4.0 <ArrowUpRight size={14} />
          </a>
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
          <button
            className="text-link"
            onClick={() =>
              downloadMapData({
                coordinates: trip.airbnb.coordinates,
                precision: trip.airbnb.locationPrecision,
                isExactLocation: false,
                uncertaintyMeters: null,
                source: trip.airbnb.url,
              })
            }
          >
            Descargar datos cartográficos <ArrowDown size={14} />
          </button>
        </div>
      </dialog>
    </section>
  );
}
