import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  Plus,
  X,
} from "lucide-react";
import { cityById, cityKinds, cityPlaces } from "../cityContent.js";
import { cityState } from "../cityMotion.js";
import { useReducedMotion, useScene } from "../hooks.js";
import "./City.css";

const acts = [
  {
    label: "Una primera mirada",
    title: (
      <>
        La ciudad
        <br />
        que impresiona.
      </>
    ),
    text: "Palacios, grandes fachadas y una primera razón para levantar la mirada.",
  },
  {
    label: "Perdernos un poco",
    title: (
      <>
        Y de pronto,
        <br />
        otra Viena.
      </>
    ),
    text: "Una esquina. Un farol. Una calle por la que todavía no hemos pasado.",
  },
  {
    label: "Una pausa también es un plan",
    title: (
      <>
        Un café.
        <br />Y que pase el rato.
      </>
    ),
    text: "Parar porque sí. Elegir una mesa. Tener tiempo para nosotros.",
  },
  {
    label: "Cambiar de perspectiva",
    title: (
      <>
        Viena.
        <br />A nuestra manera.
      </>
    ),
    text: "Lo que nos apetezca. Lo que aparezca. Lo que acabemos recordando.",
  },
];

// The viewer keeps the full photograph; these two editorial crops improve the
// portrait cards without changing or recompressing their source files.
const cardFraming = {
  hofburg: { scale: 1.28, origin: "50% 86%" },
  kaffeefabrik: { position: "70% 50%" },
};

function Shot({ id, className = "", caption = true, style }) {
  const place = cityById[id];
  const [ready, setReady] = useState(false);
  return (
    <figure
      className={"city-shot " + className}
      data-city-shot={id}
      data-photo-ready={ready}
      style={style}
    >
      <img
        src={place.image}
        alt=""
        loading="eager"
        fetchPriority="low"
        decoding="async"
        onLoad={(event) => {
          event.currentTarget
            .decode()
            .then(() => setReady(true))
            .catch(() => {});
        }}
      />
      {caption && <figcaption>{place.name}</figcaption>}
    </figure>
  );
}

function CityCinema() {
  const { ref, progress, reduced } = useScene();
  const state = cityState(progress);

  return (
    <section
      ref={ref}
      id="ciudad-reveal"
      className={"scroll-scene city-scene" + (reduced ? " reduced-scene" : "")}
      aria-label="Una primera mirada a Viena"
      data-city-act={state.active}
      data-city-progress={progress}
    >
      {reduced ? (
        <div className="scene-sticky city-static-stage">
          <figure className="city-static-hero">
            <img
              src={cityById.belvedere.image}
              alt={cityById.belvedere.photo.alt}
              loading="lazy"
            />
            <figcaption>
              <span className="tiny-label">UNA PRIMERA MIRADA</span>
              <h3>
                Viena.
                <br />A nuestra manera.
              </h3>
              <p>
                Palacios, calles y un buen café. El resto, lo descubrimos
                juntos.
              </p>
            </figcaption>
          </figure>
          <div className="city-static-tiles">
            {["griechengasse", "balthasar", "flora"].map((id) => (
              <figure key={id}>
                <img
                  src={cityById[id].image}
                  alt={cityById[id].photo.alt}
                  loading="lazy"
                />
                <figcaption>{cityById[id].name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <div className="scene-sticky city-stage">
          <div
            className="city-film"
            aria-hidden="true"
            style={{
              clipPath: `inset(${state.insetY}% ${state.insetX}% round ${state.radius}px)`,
              "--city-caption-opacity": state.chromeOpacity,
            }}
          >
            {state.plates.map((plate, index) => (
              <div
                key={index}
                className={"city-plate city-plate-" + index}
                data-city-plate={index}
                style={{
                  transform: `translate3d(${plate.x}%, 0, 0)`,
                  zIndex: index,
                  "--city-camera-scale": plate.cameraScale,
                  "--city-camera-y": plate.cameraY + "%",
                }}
              >
                {index === 0 && (
                  <div className="city-palaces">
                    <Shot
                      id="belvedere"
                      className="city-palace-main"
                      style={{ width: 100 - state.mosaic * 31 + "%" }}
                    />
                    <div
                      className="city-palace-side"
                      style={{
                        transform: `translate3d(${(1 - state.mosaic) * 100}%,0,0)`,
                        opacity: state.mosaic,
                      }}
                    >
                      <Shot id="hofburg" />
                      <Shot id="karlskirche" />
                    </div>
                  </div>
                )}
                {index === 1 && (
                  <div className="city-street-duo">
                    <Shot id="griechengasse" />
                    <Shot id="gutenberggasse" />
                  </div>
                )}
                {index === 2 && (
                  <>
                    <Shot id="balthasar" className="city-coffee-backdrop" />
                    <Shot id="flora" className="city-cafe-inset" />
                  </>
                )}
                {index === 3 && <Shot id="das-loft" className="city-skyline" />}
                <div className="city-plate-shade" />
                <div
                  className="city-plate-copy"
                  data-city-copy={index}
                  style={{
                    opacity: plate.copyOpacity,
                    transform: `translate3d(0,${plate.copyY}px,0)`,
                  }}
                >
                  <span className="tiny-label">
                    0{index + 1} / {acts[index].label}
                  </span>
                  <p className="city-film-title">{acts[index].title}</p>
                  <p className="city-film-description">{acts[index].text}</p>
                </div>
                <div
                  className="city-plate-dim"
                  style={{ opacity: plate.dim }}
                />
              </div>
            ))}
            <div
              className="city-film-topline"
              style={{ opacity: state.chromeOpacity }}
            >
              <span>LA CIUDAD TAMBIÉN ES PARTE DEL REGALO.</span>
              <span>SOFI 28 / VIENA</span>
            </div>
            <ol
              className="city-film-progress"
              style={{ opacity: state.chromeOpacity }}
            >
              {acts.map((act, index) => (
                <li key={act.label}>
                  <span className="city-act-track">
                    <i
                      style={{
                        transform: `scaleX(${state.plates[index].progress})`,
                      }}
                    />
                  </span>
                  <span>
                    0{index + 1}
                    <b>{act.label}</b>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

function PhotoCredit({ place }) {
  return (
    <span>
      {place.photo.credit || place.photo.artist} · {place.photo.license}.{" "}
      <a
        href={place.photo.sourcePage}
        target="_blank"
        rel="noopener noreferrer"
      >
        Procedencia <ArrowUpRight size={11} aria-hidden="true" />
      </a>
      {place.photo.licenseUrl && (
        <>
          {" "}
          ·{" "}
          <a
            href={place.photo.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Licencia
          </a>
        </>
      )}
    </span>
  );
}

export function CityCredits() {
  return (
    <details className="city-image-sources">
      <summary>Fotografías del paseo por Viena</summary>
      <ul>
        {cityPlaces.map((place) => (
          <li key={place.id}>
            <strong>{place.name}</strong>
            <PhotoCredit place={place} />
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function City({ explorerRef }) {
  const [kind, setKind] = useState("all");
  const [selectedId, setSelectedId] = useState(cityPlaces[0].id);
  const [position, setPosition] = useState({
    first: true,
    last: false,
    index: 0,
  });
  const rail = useRef(null),
    lightbox = useRef(null),
    opener = useRef(null),
    mapButton = useRef(null);
  const reduced = useReducedMotion();
  const filtered = useMemo(
    () => cityPlaces.filter((p) => kind === "all" || p.kind === kind),
    [kind],
  );
  const selected = cityById[selectedId];
  useLayoutEffect(() => {
    const node = rail.current;
    if (!node) return;
    node.scrollLeft = 0;
    const update = () => {
      const first = node.firstElementChild;
      const step = first
        ? first.getBoundingClientRect().width +
          parseFloat(getComputedStyle(node).gap)
        : 1;
      const next = {
        first: node.scrollLeft < 2,
        last: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2,
        index: Math.min(
          filtered.length - 1,
          Math.round(node.scrollLeft / step),
        ),
      };
      setPosition((previous) =>
        previous.first === next.first &&
        previous.last === next.last &&
        previous.index === next.index
          ? previous
          : next,
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", update);
    };
  }, [filtered]);

  const move = (direction) => {
    const node = rail.current,
      first = node?.firstElementChild;
    if (!first) return;
    const step =
      first.getBoundingClientRect().width +
      parseFloat(getComputedStyle(node).gap);
    node.scrollBy({
      left: direction * step,
      behavior: reduced ? "instant" : "smooth",
    });
  };
  const openPhoto = (id, event) => {
    opener.current = event.currentTarget;
    setSelectedId(id);
    lightbox.current.showModal();
  };
  const nextPhoto = (direction) => {
    const index = filtered.findIndex((p) => p.id === selectedId);
    setSelectedId(
      filtered[(index + direction + filtered.length) % filtered.length].id,
    );
  };
  const openMap = (id) => explorerRef.current?.open(id, mapButton.current);
  const mapFromPhoto = () => {
    lightbox.current.close();
    requestAnimationFrame(() => openMap(selected.mapPlaceId));
  };

  return (
    <section
      className="city-section city-experience"
      id="ciudad"
      data-chapter="Viena, a nuestra manera"
      aria-labelledby="city-title"
    >
      <div className="city-heading section-pad" data-reveal>
        <span className="eyebrow">
          <span className="blue-dot" /> LA CIUDAD TAMBIÉN ES PARTE DEL REGALO
        </span>
        <div className="city-heading-row">
          <h2 id="city-title">
            Viena.
            <br />
            <span>A nuestra manera.</span>
          </h2>
          <div>
            <p>
              La que impresiona.
              <br />
              La que se encuentra sin buscar.
              <br />
              La que acabaremos recordando.
            </p>
            <a href="#ciudad-lugares" className="text-link city-skip">
              Ir directamente a los lugares{" "}
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <CityCinema />
      <section
        className="city-gallery section-pad"
        id="ciudad-lugares"
        aria-labelledby="city-gallery-title"
      >
        <div className="city-gallery-heading" data-reveal>
          <div>
            <span className="eyebrow">POR SI NOS APETECE</span>
            <h3 id="city-gallery-title">
              Unas cuantas ideas.
              <br />
              <span>Ninguna prisa.</span>
            </h3>
          </div>
          <div className="city-gallery-intro">
            <p>
              Palacios. Callejuelas. Un café. Una mesa.
              <br />
              Elegimos sobre la marcha.
            </p>
            <button
              ref={mapButton}
              className="city-map-button"
              onClick={() => openMap(null)}
            >
              <MapPinned size={17} aria-hidden="true" /> Abrir el mapa de Viena{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="city-gallery-toolbar">
          <div
            className="city-filters"
            role="group"
            aria-label="Filtrar los lugares de Viena"
          >
            {[["all", "Todo"], ...Object.entries(cityKinds)].map(
              ([id, name]) => (
                <button
                  key={id}
                  aria-pressed={kind === id}
                  onClick={() => setKind(id)}
                >
                  {name}
                  <span>
                    {id === "all"
                      ? cityPlaces.length
                      : cityPlaces.filter((p) => p.kind === id).length}
                  </span>
                </button>
              ),
            )}
          </div>
          <div className="rail-buttons">
            <button
              disabled={position.first}
              onClick={() => move(-1)}
              aria-label="Ver elementos anteriores"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              disabled={position.last}
              onClick={() => move(1)}
              aria-label="Ver elementos siguientes"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        <p className="sr-only" id="city-rail-help">
          Desliza las tarjetas o usa las flechas izquierda y derecha. Inicio y
          Fin llevan a los extremos. Pulsa una fotografía para verla completa.
        </p>
        <div
          className="city-rail"
          ref={rail}
          tabIndex={0}
          role="region"
          aria-label="Ideas para descubrir Viena"
          aria-describedby="city-rail-help"
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
              event.preventDefault();
              move(event.key === "ArrowRight" ? 1 : -1);
            }
            if (["Home", "End"].includes(event.key)) {
              event.preventDefault();
              rail.current.scrollTo({
                left: event.key === "Home" ? 0 : rail.current.scrollWidth,
                behavior: reduced ? "instant" : "smooth",
              });
            }
          }}
        >
          {filtered.map((place, index) => (
            <article
              className="city-card"
              key={place.id}
              data-city-place={place.id}
              data-city-kind={place.kind}
            >
              <button
                className="city-card-photo"
                style={{
                  "--city-card-scale": cardFraming[place.id]?.scale || 1,
                  "--city-card-hover-scale":
                    (cardFraming[place.id]?.scale || 1) * 1.025,
                  "--city-card-origin":
                    cardFraming[place.id]?.origin || "50% 50%",
                  "--city-card-position":
                    cardFraming[place.id]?.position || "50% 50%",
                }}
                onClick={(event) => openPhoto(place.id, event)}
                aria-label={
                  "Ver fotografía de " +
                  place.name +
                  " · " +
                  String(index + 1).padStart(2, "0")
                }
              >
                <img
                  src={place.image}
                  alt={place.photo.alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="city-card-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="city-card-plus" aria-hidden="true">
                  <Plus size={19} />
                </span>
              </button>
              <div className="city-card-copy">
                <span className="tiny-label">{cityKinds[place.kind]}</span>
                <h4>{place.name}</h4>
                <p>{place.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="city-gallery-caption">
          <span role="status" aria-live="polite">
            {String(position.index + 1).padStart(2, "0")} —{" "}
            {String(filtered.length).padStart(2, "0")} lugares
          </span>
          <span>Son ideas. El viaje lo hacemos nosotros.</span>
        </div>
      </section>
      <dialog
        ref={lightbox}
        className="city-lightbox"
        aria-label="Una mirada a Viena"
        onClose={() => opener.current?.focus({ preventScroll: true })}
        onKeyDown={(event) => {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            nextPhoto(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <button
          className="icon-button city-lightbox-close"
          onClick={() => lightbox.current.close()}
          aria-label="Cerrar fotografía de Viena"
          autoFocus
        >
          <X />
        </button>
        <div className="city-lightbox-image">
          <img src={selected.image} alt={selected.photo.alt} />
        </div>
        <div className="city-lightbox-details">
          <div>
            <span className="tiny-label">{cityKinds[selected.kind]}</span>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            {selected.note && (
              <p className="city-place-note">{selected.note}</p>
            )}
            {selected.mapPlaceId && (
              <button className="city-place-map" onClick={mapFromPhoto}>
                <MapPinned size={15} aria-hidden="true" /> Ver {selected.name}{" "}
                en el mapa <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            )}
            <p className="city-photo-credit">
              <PhotoCredit place={selected} />
            </p>
          </div>
          <div className="city-lightbox-controls">
            <button
              className="icon-button"
              onClick={() => nextPhoto(-1)}
              aria-label="Lugar anterior"
            >
              <ChevronLeft />
            </button>
            <span aria-live="polite">
              {filtered.findIndex((p) => p.id === selectedId) + 1} /{" "}
              {filtered.length}
            </span>
            <button
              className="icon-button"
              onClick={() => nextPhoto(1)}
              aria-label="Lugar siguiente"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
