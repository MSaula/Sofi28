import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Footprints,
  Home,
  List,
  Maximize2,
  Minus,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { useElementSize, useReducedMotion } from "../hooks";
import { trip } from "../content";
import { places } from "../viennaPlaces";
import context from "../data/vienna-context.json";
import { ViennaContext, ViennaMarkers } from "./ViennaCartography";
import {
  buildViennaModel,
  constrainView,
  fitWalkingRoute,
  nearestMapPlace,
  projectedGeometryPath,
  viewTransform,
  walkingLabels,
  zoomView,
} from "../viennaMap";
import "./ViennaExplorer.css";

const initialView = { k: 1, x: 0, y: 0 };
const normalize = (s) =>
  s
    .toLowerCase()
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function MapSources() {
  return (
    <details className="v-map-sources">
      <summary>Sobre el mapa y los tiempos</summary>
      <p>
        Los recorridos a pie se han calculado sobre la red de OpenStreetMap.
        Metros redondeados y minutos orientativos, sin paradas. El origen es el
        punto aproximado del anuncio del apartamento.
      </p>
      <p>
        Cartografía:{" "}
        <a
          href="https://data.wien.gv.at/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stadt Wien · CC BY 3.0 AT
        </a>{" "}
        y{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenStreetMap contributors · ODbL
        </a>
        . Rutas peatonales: FOSSGIS / OSRM, preparadas el 14 de noviembre de
        2026.
      </p>
      <p>
        Las visitas interiores se eligen aparte y están sujetas a apertura. Las
        fotos son referencias de distintas fechas.
      </p>
    </details>
  );
}

function PlaceCard({ place, onBrowse }) {
  const [loaded, setLoaded] = useState(false);
  const walk = walkingLabels(place.walk);
  const directions = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${trip.airbnb.coordinates[1]}%2C${trip.airbnb.coordinates[0]}%3B${place.coordinates[1]}%2C${place.coordinates[0]}`;
  return (
    <article
      className="v-place-card"
      data-testid="vienna-place-card"
      data-place-id={place.id}
    >
      <div
        className={
          "v-place-photo" +
          (place.photo.height > place.photo.width ? " v-photo-portrait" : "")
        }
        aria-busy={!loaded}
      >
        <img
          src={place.image}
          alt={place.photo.caption}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
          decoding="async"
        />
        {place.featured && (
          <span className="v-photo-tag">
            <Star size={11} fill="currentColor" /> UNA PRIMERA MIRADA
          </span>
        )}
      </div>
      <div className="v-place-copy">
        <button className="v-back-link" onClick={onBrowse}>
          <ArrowLeft size={13} /> Todos los lugares
        </button>
        <p className="v-place-category">{place.categoryLabel}</p>
        <h3 tabIndex={-1}>{place.name}</h3>
        <p className="v-place-description">{place.description}</p>
        {place.statusNote && (
          <p className="v-place-status">{place.statusNote}</p>
        )}
        <div
          className="v-walk-metrics"
          data-testid="walking-distance"
          data-meters={place.walk.meters}
          data-seconds={place.walk.seconds}
        >
          <p>
            <Footprints size={14} /> Desde nuestro ático · aprox.
          </p>
          <div>
            <strong>{walk.distance}</strong>
            <span />
            <strong>
              {walk.minutes} <small>min andando</small>
            </strong>
          </div>
        </div>
        <a
          className="v-directions-link"
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir recorrido a pie <ArrowUpRight size={15} />
        </a>
        <p className="v-photo-credit">
          <a
            href={place.photo.commonsPage}
            target="_blank"
            rel="noopener noreferrer"
          >
            Foto: {place.photo.artist}
          </a>{" "}
          ·{" "}
          <a
            href={place.photo.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {place.photo.license}
          </a>
        </p>
        <MapSources />
      </div>
    </article>
  );
}

function WelcomeCard({ onSelect, onBrowse }) {
  const cover = places.find((p) => p.id === "belvedere");
  return (
    <div className="v-welcome-card">
      <div className="v-welcome-photo">
        <img src={cover.image} alt={cover.photo.caption} />
        <span>VIENA, A NUESTRO RITMO.</span>
      </div>
      <div className="v-place-copy">
        <span className="v-origin-pill">
          <Home size={13} /> Desde nuestro ático
        </span>
        <h3>
          Una ciudad.
          <br />
          Un montón de planes.
        </h3>
        <p className="v-place-description">
          Toca un lugar y descubriremos qué nos espera y cómo llegar andando.
          Podemos empezar por aquí.
        </p>
        <div className="v-first-places">
          {places
            .filter((p) => p.featured)
            .sort((a, b) => a.featuredOrder - b.featuredOrder)
            .map((p) => (
              <button key={p.id} onClick={() => onSelect(p.id)}>
                <span>{p.shortName}</span>
                <small>
                  {walkingLabels(p.walk).minutes} min <ArrowUpRight size={12} />
                </small>
              </button>
            ))}
        </div>
        <button className="v-all-places-link" onClick={onBrowse}>
          <List size={15} /> Explorar los 32 lugares
        </button>
        <p className="v-photo-credit">
          <a
            href={cover.photo.commonsPage}
            target="_blank"
            rel="noopener noreferrer"
          >
            Foto: {cover.photo.artist}
          </a>{" "}
          ·{" "}
          <a
            href={cover.photo.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {cover.photo.license}
          </a>
        </p>
        <MapSources />
      </div>
    </div>
  );
}

function ExplorerCanvas({ selected, onSelect, mapRef }) {
  const [sizeRef, size] = useElementSize();
  const model = useMemo(
    () =>
      size.width > 0 && size.height > 0
        ? buildViennaModel(
            size.width,
            size.height,
            places.map((p) => p.coordinates),
            trip.airbnb.coordinates,
          )
        : null,
    [size.width, size.height],
  );
  const [view, setView] = useState(initialView);
  const [hover, setHover] = useState(null);
  const [dragging, setDragging] = useState(false);
  const viewRef = useRef(view),
    frame = useRef(0),
    gesture = useRef(null),
    didDrag = useRef(false);
  const reduced = useReducedMotion();
  viewRef.current = view;
  const place = places.find((p) => p.id === selected);
  const route = useMemo(
    () =>
      model && place
        ? projectedGeometryPath(place.walk.geometry, model.projection)
        : null,
    [place, model],
  );
  const updateView = (target, animate = true) => {
    cancelAnimationFrame(frame.current);
    const next = constrainView(target, model, context.bbox);
    if (reduced || !animate) {
      viewRef.current = next;
      setView(next);
      return;
    }
    const from = viewRef.current,
      start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 460),
        t = p * p * (3 - 2 * p);
      const current = {
        k: from.k + (next.k - from.k) * t,
        x: from.x + (next.x - from.x) * t,
        y: from.y + (next.y - from.y) * t,
      };
      viewRef.current = current;
      setView(current);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  useEffect(() => {
    if (!model) return;
    updateView(
      place
        ? fitWalkingRoute(model, [
            trip.airbnb.coordinates,
            ...place.walk.geometry.coordinates,
            place.coordinates,
          ])
        : initialView,
      false,
    );
    return () => cancelAnimationFrame(frame.current);
  }, [model]);
  useEffect(() => {
    if (model)
      updateView(
        place
          ? fitWalkingRoute(model, [
              trip.airbnb.coordinates,
              ...place.walk.geometry.coordinates,
              place.coordinates,
            ])
          : initialView,
      );
  }, [selected]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const choose = (id, node, event) => {
    if (id && event?.detail > 0) {
      const rect = sizeRef.current.getBoundingClientRect();
      const nearest = nearestMapPlace(
        places,
        model.projection,
        viewRef.current,
        [event.clientX - rect.left, event.clientY - rect.top],
      );
      onSelect(nearest?.id || id);
    } else onSelect(id);
  };
  return (
    <div
      ref={sizeRef}
      className={"v-explorer-map" + (dragging ? " v-is-dragging" : "")}
      data-testid="explorer-map"
      data-zoom={view.k}
    >
      {model && (
        <>
          <svg
            ref={mapRef}
            className="v-interactive-svg"
            viewBox={`0 0 ${size.width} ${size.height}`}
            role="group"
            aria-label="Mapa interactivo de Viena: cinco lugares destacados, otros lugares y nuestro ático"
            aria-describedby="v-map-help"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (
                [
                  "+",
                  "=",
                  "-",
                  "Home",
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                ].includes(event.key)
              ) {
                event.preventDefault();
                if (event.key === "Home") updateView(initialView);
                else if (["+", "=", "-"].includes(event.key))
                  updateView(
                    zoomView(
                      viewRef.current,
                      event.key === "-" ? 0.8 : 1.25,
                      size.width,
                      size.height,
                    ),
                  );
                else
                  updateView(
                    {
                      ...viewRef.current,
                      x:
                        viewRef.current.x +
                        (event.key === "ArrowLeft"
                          ? 70
                          : event.key === "ArrowRight"
                            ? -70
                            : 0),
                      y:
                        viewRef.current.y +
                        (event.key === "ArrowUp"
                          ? 70
                          : event.key === "ArrowDown"
                            ? -70
                            : 0),
                    },
                    false,
                  );
              }
            }}
            onPointerDown={(event) => {
              if (event.button !== 0 || event.target.closest('[role="button"]'))
                return;
              cancelAnimationFrame(frame.current);
              didDrag.current = false;
              gesture.current = {
                x: event.clientX,
                y: event.clientY,
                view: viewRef.current,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const g = gesture.current;
              if (!g) return;
              const dx = event.clientX - g.x,
                dy = event.clientY - g.y;
              if (Math.hypot(dx, dy) > 4) {
                didDrag.current = true;
                setDragging(true);
              }
              if (didDrag.current)
                updateView(
                  { ...g.view, x: g.view.x + dx, y: g.view.y + dy },
                  false,
                );
            }}
            onPointerUp={(event) => {
              gesture.current = null;
              setDragging(false);
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => {
              gesture.current = null;
              setDragging(false);
            }}
            onClick={(event) => {
              if (didDrag.current) {
                didDrag.current = false;
                return;
              }
              const rect = sizeRef.current.getBoundingClientRect();
              const p = nearestMapPlace(
                places,
                model.projection,
                viewRef.current,
                [event.clientX - rect.left, event.clientY - rect.top],
                18,
              );
              if (p) onSelect(p.id);
            }}
          >
            <g transform={viewTransform(view)}>
              <ViennaContext projection={model.projection} />
              {route && (
                <g
                  key={selected}
                  className="v-walking-route"
                  data-vienna-route={selected}
                >
                  <path
                    className="v-walk-casing"
                    d={route}
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    className="v-walk-line"
                    d={route}
                    pathLength="1"
                    style={{ strokeWidth: 3 / view.k }}
                  />
                </g>
              )}
            </g>
            <ViennaMarkers
              projection={model.projection}
              view={view}
              width={size.width}
              height={size.height}
              selected={selected}
              hover={hover}
              onHover={setHover}
              onSelect={choose}
            />
          </svg>
          <p className="sr-only" id="v-map-help">
            Arrastra el mapa o usa las flechas del teclado para moverte. Los
            botones más y menos acercan o alejan. Inicio vuelve a la vista
            general. Selecciona un marcador o busca un lugar en la lista.
          </p>
          <div className="v-map-controls">
            <span className="v-north" aria-hidden="true">
              ↑<small>N</small>
            </span>
            <button
              aria-label="Acercar el mapa"
              onClick={() =>
                updateView(
                  zoomView(viewRef.current, 1.25, size.width, size.height),
                )
              }
              disabled={view.k >= 3.59}
            >
              <Plus size={18} />
            </button>
            <button
              aria-label="Alejar el mapa"
              onClick={() =>
                updateView(
                  zoomView(viewRef.current, 0.8, size.width, size.height),
                )
              }
              disabled={view.k <= 1.01}
            >
              <Minus size={18} />
            </button>
          </div>
          <div className="v-map-bottom-controls">
            <button onClick={() => updateView(initialView)}>
              <Maximize2 size={13} /> Vista general
            </button>
            {place && (
              <button
                onClick={() =>
                  updateView(
                    fitWalkingRoute(model, [
                      trip.airbnb.coordinates,
                      ...place.walk.geometry.coordinates,
                      place.coordinates,
                    ]),
                  )
                }
              >
                <Footprints size={13} /> Ver recorrido
              </button>
            )}
          </div>
          <div className="v-map-attribution">
            <a
              href="https://data.wien.gv.at/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stadt Wien
            </a>{" "}
            ·{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              © OpenStreetMap
            </a>
          </div>
        </>
      )}
    </div>
  );
}

const ViennaExplorer = forwardRef(function ViennaExplorer(_, ref) {
  const dialog = useRef(null),
    opener = useRef(null),
    search = useRef(null),
    map = useRef(null),
    entryViewport = useRef(null);
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState(null),
    [query, setQuery] = useState(""),
    [browse, setBrowse] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      open(id = null, trigger = document.activeElement) {
        opener.current = trigger;
        entryViewport.current = [innerWidth, innerHeight];
        setSelected(id);
        setQuery("");
        setBrowse(false);
        setOpen(true);
      },
    }),
    [],
  );
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
  }, [open]);
  const select = (id) => {
    setSelected(id);
    setQuery("");
    setBrowse(false);
  };
  const showList = () => {
    setBrowse(true);
    requestAnimationFrame(() => search.current?.focus());
  };
  const matching = useMemo(
    () =>
      places
        .filter((p) =>
          normalize(p.name + " " + p.description).includes(normalize(query)),
        )
        .sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            a.name.localeCompare(b.name, "es"),
        ),
    [query],
  );
  const place = places.find((p) => p.id === selected);
  const close = () => {
    setOpen(false);
    const resized =
      entryViewport.current &&
      (entryViewport.current[0] !== innerWidth ||
        entryViewport.current[1] !== innerHeight);
    requestAnimationFrame(() => {
      if (resized) {
        const section = document.getElementById("destino");
        if (section) {
          const top = section.getBoundingClientRect().top + scrollY;
          const staticMap =
            section.classList.contains("reduced-scene") &&
            section.querySelector(".vienna-static");
          const target = staticMap
            ? staticMap.getBoundingClientRect().bottom +
              scrollY -
              innerHeight +
              24
            : top +
              (section.offsetHeight -
                section.querySelector(".scene-sticky").getBoundingClientRect()
                  .height) *
                0.98;
          window.scrollTo({ top: target, behavior: "instant" });
        }
      }
      requestAnimationFrame(() =>
        (opener.current?.isConnected
          ? opener.current
          : document.querySelector(".v-compact-explore")
        )?.focus?.({ preventScroll: true }),
      );
    });
  };
  return (
    <dialog
      ref={dialog}
      className="vienna-explorer"
      id="vienna-explorer"
      data-testid="vienna-explorer"
      aria-labelledby="v-explorer-title"
      onClose={close}
    >
      {open && (
        <>
          <header className="v-explorer-header">
            <div>
              <span className="v-explorer-eyebrow">
                DESDE AQUÍ, TODA UNA CIUDAD.
              </span>
              <h2 id="v-explorer-title">Viena, a pie.</h2>
            </div>
            <div className="v-header-actions">
              <button className="v-locations-toggle" onClick={showList}>
                <List size={15} /> 32 lugares
              </button>
              <button
                className="v-close-explorer"
                onClick={() => dialog.current.close()}
                aria-label="Cerrar mapa de Viena"
                autoFocus
              >
                <X size={21} />
              </button>
            </div>
          </header>
          <div className="v-explorer-body">
            <ExplorerCanvas
              selected={selected}
              onSelect={select}
              mapRef={map}
            />
            <aside
              className="v-explorer-sidebar"
              aria-label="Lugares y detalles del mapa"
            >
              <div className="v-place-search">
                <Search size={15} />
                <label className="sr-only" htmlFor="v-place-search">
                  Buscar un lugar en Viena
                </label>
                <input
                  id="v-place-search"
                  ref={search}
                  type="search"
                  placeholder="Buscar un lugar…"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setBrowse(true);
                  }}
                />
                {(browse || query) && (
                  <button
                    onClick={() => {
                      setBrowse(false);
                      setQuery("");
                    }}
                    aria-label="Volver a la ficha"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="v-sidebar-content">
                {browse ? (
                  <div className="v-places-list">
                    <div className="v-list-heading">
                      <h3>Elige dónde perdernos.</h3>
                      <p role="status">{matching.length} lugares</p>
                    </div>
                    {matching.length ? (
                      matching.map((p) => (
                        <button
                          className={
                            "v-list-place" +
                            (selected === p.id ? " v-list-selected" : "")
                          }
                          key={p.id}
                          data-list-place={p.id}
                          onClick={() => select(p.id)}
                        >
                          <img src={p.image} alt="" loading="lazy" />
                          <span>
                            <strong>{p.name}</strong>
                            <small>
                              {p.featured && (
                                <Star size={10} fill="currentColor" />
                              )}
                              {walkingLabels(p.walk).distance} ·{" "}
                              {walkingLabels(p.walk).minutes} min a pie
                            </small>
                          </span>
                          <ArrowUpRight size={14} />
                        </button>
                      ))
                    ) : (
                      <p className="v-list-empty">
                        No encontramos ese lugar. Prueba otro nombre.
                      </p>
                    )}
                  </div>
                ) : place ? (
                  <PlaceCard place={place} key={place.id} onBrowse={showList} />
                ) : (
                  <WelcomeCard onSelect={select} onBrowse={showList} />
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </dialog>
  );
});

export default ViennaExplorer;
