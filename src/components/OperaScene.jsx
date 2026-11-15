import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Expand,
  Eye,
  MapPin,
  X,
} from "lucide-react";
import { useMediaQuery, useScene } from "../hooks";
import { trip } from "../content";
import {
  operaPhotos,
  operaProgramme,
  operaProgrammeUrl,
} from "../operaContent";
import { operaState } from "../operaMotion";
import seating from "../data/opera-seating.json";
import "./Opera.css";

function Photo({ name, onReady, ...props }) {
  const photo = operaPhotos[name];
  return (
    <img
      src={photo.src}
      alt={photo.title}
      width={photo.width}
      height={photo.height}
      loading="eager"
      decoding="async"
      fetchPriority="low"
      data-opera-photo={name}
      onLoad={async (event) => {
        const image = event.currentTarget;
        try {
          await image.decode();
        } catch {
          /* The loaded image remains usable. */
        }
        image.dataset.ready = "true";
        onReady?.();
      }}
      {...props}
    />
  );
}
function Credit({ name }) {
  return (
    <span className="opera-photo-credit">© {operaPhotos[name].author}</span>
  );
}
export function OperaCredits() {
  return (
    <div className="opera-source-credits">
      <h3>Una noche en la Ópera</h3>
      <p>
        Fotografías de producción: Ashley Taylor / Wiener Staatsballett.
        Documentan las piezas del programa; no confirman el reparto de nuestra
        función.
      </p>
      <ul>
        {Object.entries(operaPhotos).map(([key, p]) => (
          <li key={key}>
            <a href={p.sourcePage} target="_blank" rel="noreferrer">
              {p.title}
            </a>{" "}
            — {p.author}
            {p.licenseUrl && (
              <>
                {" "}
                ·{" "}
                <a href={p.licenseUrl} target="_blank" rel="noreferrer">
                  {p.license}
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
      <p>
        Plano reconstruido a partir del diagrama oficial de venta, versión{" "}
        {seating.sourceVersion}. Representa niveles desplegados, no distancias
        arquitectónicas ni disponibilidad.
      </p>
    </div>
  );
}
function useOperaChrome(chapter) {
  useEffect(() => {
    let frame = 0;
    const root = document.documentElement;
    const update = () => {
      frame = 0;
      const node = chapter.current;
      if (!node) return;
      const box = node.getBoundingClientRect(),
        scene = node.querySelector(".opera-scene");
      const sticky = scene.querySelector(".scene-sticky"),
        r = scene.getBoundingClientRect();
      const p = scene.classList.contains("reduced-scene")
        ? 1
        : Math.max(0, -r.top / (r.height - sticky.clientHeight));
      const tone = operaState(p).tone;
      // Native anchors reserve 72px above their target. Switch before that
      // boundary so a thin remainder of the chapter cannot retain its theme.
      if (box.top < 85 && box.bottom > 85 && tone > 0.55) {
        root.dataset.operaChrome = "true";
        root.style.setProperty("--opera-chrome-bg", "rgba(14,12,11,.96)");
        root.style.setProperty("--opera-chrome-fg", "#f5eee0");
      } else {
        delete root.dataset.operaChrome;
        root.style.removeProperty("--opera-chrome-bg");
        root.style.removeProperty("--opera-chrome-fg");
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      delete root.dataset.operaChrome;
      root.style.removeProperty("--opera-chrome-bg");
      root.style.removeProperty("--opera-chrome-fg");
    };
  }, [chapter]);
}
function useEditorialGeometry(stage, target) {
  const [geometry, setGeometry] = useState({
    size: { width: 1, height: 1 },
    target: null,
  });
  useLayoutEffect(() => {
    let active = true;
    const measure = () => {
      if (!active || !stage.current || !target.current) return;
      const a = stage.current.getBoundingClientRect(),
        b = target.current.getBoundingClientRect();
      setGeometry({
        size: { width: a.width, height: a.height },
        target: {
          x: b.x - a.x,
          y: b.y - a.y,
          width: b.width,
          height: b.height,
        },
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current);
    observer.observe(target.current);
    document.fonts.ready.then(measure);
    measure();
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [stage, target]);
  return geometry;
}
function Programme({ heroRef, state, staticMode, open }) {
  const interactive = staticMode || state.interactive;
  return (
    <div
      className="opera-programme"
      style={{
        opacity: staticMode ? 1 : state.editorialOpacity,
        pointerEvents: interactive ? "auto" : "none",
      }}
      aria-hidden={!staticMode && state.editorialOpacity < 0.01}
    >
      <div className="opera-programme-mosaic">
        <button
          ref={heroRef}
          className="opera-editorial-hero"
          data-opera-target
          onClick={(e) => open("jump", e.currentTarget)}
          tabIndex={interactive ? 0 : -1}
          aria-label="Ampliar Divertimento No. 15"
        >
          <Photo
            name="jump"
            style={{ visibility: staticMode ? "visible" : "hidden" }}
          />
          <span className="opera-image-expand">
            <Expand size={16} />
          </span>
        </button>
        <div
          className="opera-editorial-support"
          style={{ opacity: staticMode ? 1 : state.supportOpacity }}
        >
          {["duet", "rhapsody"].map((name) => (
            <button
              key={name}
              onClick={(e) => open(name, e.currentTarget)}
              tabIndex={interactive ? 0 : -1}
              aria-label={`Ampliar ${operaPhotos[name].title}`}
            >
              <Photo name={name} />
            </button>
          ))}
        </div>
        <p className="opera-mosaic-caption">
          Tres miradas. Una misma pasión. <Credit name="jump" />
        </p>
      </div>
      <div className="opera-programme-copy">
        <span className="opera-label">BALLET · WIENER STAATSBALLETT</span>
        <h2>
          Living
          <br />
          <em>Legacies.</em>
        </h2>
        <p className="opera-programme-lead">Una noche para ver la música.</p>
        <p>
          Tres obras, tres formas de entender la danza. La elegancia de
          Balanchine, la luz de Wheeldon y el virtuosismo de Ashton, en el
          escenario de la Ópera Estatal de Viena.
        </p>
        <div className="opera-programme-facts">
          <p>
            <strong>Tres grandes coreógrafos.</strong>
            <span>Un programa que conecta generaciones del ballet.</span>
          </p>
          <p>
            <strong>Un escenario extraordinario.</strong>
            <span>La Wiener Staatsoper, inaugurada en 1869.</span>
          </p>
        </div>
        <a
          className="opera-text-link"
          href="#ballet-detalles"
          tabIndex={interactive ? 0 : -1}
        >
          Y nosotros, allí. <ArrowDown size={17} />
        </a>
      </div>
    </div>
  );
}
function OperaCinema({ open }) {
  const { ref, progress, reduced: baseReduced } = useScene();
  const compact = useMediaQuery("(max-width: 700px) and (max-height: 740px)");
  const reduced = baseReduced || compact;
  const stage = useRef(null),
    target = useRef(null);
  const geometry = useEditorialGeometry(stage, target);
  const state = operaState(
    reduced ? 1 : progress,
    geometry.size,
    geometry.target,
  );
  const [ready, setReady] = useState({});
  const markReady = (name) =>
    setReady((previous) =>
      previous[name] ? previous : { ...previous, [name]: true },
    );
  const toProgramme = () => {
    const node = ref.current;
    window.scrollTo({
      top:
        node.getBoundingClientRect().top +
        scrollY +
        node.offsetHeight -
        stage.current.clientHeight -
        68,
      behavior: "instant",
    });
  };
  return (
    <section
      id="ballet"
      ref={ref}
      className={`scroll-scene opera-scene ${reduced ? "reduced-scene" : ""}`}
      aria-label="Una noche en la Ópera"
      data-opera-progress={state.p.toFixed(4)}
    >
      <div ref={stage} className="scene-sticky opera-stage">
        {reduced ? (
          <div className="opera-static-opening">
            <span className="opera-label">03 — UNA NOCHE</span>
            <h2>Hay una cosa más.</h2>
            <Photo name="room" />
            <Credit name="room" />
          </div>
        ) : (
          <>
            <div
              className="opera-prologue"
              style={{ opacity: state.introOpacity }}
            >
              <span className="opera-label">03 — UNA NOCHE</span>
              <h2>Hay una cosa más.</h2>
              <p>Lo mejor está por abrirse.</p>
            </div>
            <div
              className="opera-room"
              style={{
                clipPath: `inset(${state.roomInsetY}% ${state.roomInsetX}% round ${state.roomRadius}px)`,
                opacity: ready.jump ? state.roomOpacity : 1,
              }}
            >
              <Photo
                name="room"
                onReady={() => markReady("room")}
                style={{ transform: `scale(${state.roomScale})` }}
              />
              <div className="opera-room-shade" />
            </div>
            <div
              className="opera-dance-layers"
              style={{ opacity: ready.jump ? state.earlierOpacity : 1 }}
              aria-hidden="true"
            >
              <div
                className="opera-portal"
                style={{
                  opacity: ready.duet ? state.portalOpacity : 0,
                  clipPath: `inset(${state.portalInsetTop}% ${state.portalInsetX}% ${state.portalInsetBottom}% round ${18 * (1 - state.portal)}px)`,
                }}
              >
                <Photo name="duet" onReady={() => markReady("duet")} />
                <Credit name="duet" />
              </div>
              <div
                className="opera-ensemble"
                style={{ opacity: ready.ensemble ? state.ensembleOpacity : 0 }}
              >
                <Photo name="ensemble" onReady={() => markReady("ensemble")} />
                <Credit name="ensemble" />
              </div>
            </div>
            <div
              className="opera-cinema-hud"
              style={{ opacity: state.chromeOpacity }}
              aria-hidden="true"
            >
              <span>WIENER STAATSOPER</span>
              <span>
                {ready.jump && state.jumpOpacity > 0.5
                  ? "III — EL VUELO"
                  : ready.ensemble && state.ensembleOpacity > 0.5
                    ? "II — EL ENCUENTRO"
                    : "I — LA LUZ"}
              </span>
              <ArrowDown size={16} />
            </div>
          </>
        )}
        <Programme
          heroRef={target}
          state={state}
          staticMode={reduced}
          open={open}
        />
        {!reduced && (
          <>
            <div
              className="opera-moving-photo"
              data-opera-moving-photo
              data-handoff={state.handoff.toFixed(4)}
              style={{
                left: state.hero.x,
                top: state.hero.y,
                width: state.hero.width,
                height: state.hero.height,
                opacity: ready.jump ? state.jumpOpacity : 0,
                borderRadius: 6 * state.handoff,
              }}
              aria-hidden="true"
            >
              <Photo name="jump" onReady={() => markReady("jump")} />
              <Credit name="jump" />
              <span
                className="opera-image-expand"
                style={{ opacity: state.supportOpacity }}
              >
                <Expand size={16} />
              </span>
            </div>
            <button
              className="opera-skip"
              onClick={toProgramme}
              style={{
                opacity: 1 - state.editorialOpacity,
                visibility: state.interactive ? "hidden" : "visible",
              }}
            >
              Ir al programa <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
export const OperaSeatingMap = memo(function OperaSeatingMap({
  expanded = false,
}) {
  return (
    <svg
      className="opera-seat-map"
      viewBox="400 450 7800 7800"
      role="img"
      aria-label={`Plano completo de butacas: ${trip.ballet.area}, fila ${trip.ballet.row}, asientos ${trip.ballet.seats}`}
      data-opera-map
      data-seat-count={seating.seats.length}
    >
      <title>
        Nuestros sitios en el plano completo de la Wiener Staatsoper
      </title>
      <desc>
        Diagrama de venta con los niveles desplegados. Mittelloge está en el eje
        central. Dos puntos claros señalan los asientos 23 y 24 de la fila 3; no
        representan disponibilidad.
      </desc>
      <rect
        x="400"
        y="450"
        width="7800"
        height="7800"
        rx="180"
        fill="#171511"
      />
      {seating.blocks.map((b) => (
        <g key={b.id} data-opera-block={b.id}>
          {b.hulls.map((h, i) => (
            <polygon
              key={i}
              points={h.map((p) => p.join(",")).join(" ")}
              fill={b.id === 489 ? "#55452d" : "#26231e"}
              stroke={b.id === 489 ? "#d5b77c" : "#464034"}
              strokeWidth="13"
            />
          ))}
        </g>
      ))}
      {seating.seats.map(([id, x, y, block]) => (
        <circle
          key={id}
          data-opera-seat={id}
          data-selected={id === 500 || id === 501 ? "true" : undefined}
          cx={x}
          cy={y}
          r={id === 500 || id === 501 ? 39 : 24}
          fill={
            id === 500 || id === 501
              ? "#fff4d9"
              : block === 489
                ? "#ceb37b"
                : "#847967"
          }
          stroke={id === 500 || id === 501 ? "#fff4d9" : "none"}
          strokeWidth="15"
        />
      ))}
      <g
        className="opera-plan-annotations"
        fill="#d4c4a8"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
      >
        <text x="4115" y="1045" fontSize="175" letterSpacing="20">
          ESCENARIO
        </text>
        <text x="4115" y="1975" fontSize="135" letterSpacing="15">
          PARTERRE
        </text>
        <text x="4115" y="6760" fontSize="125" letterSpacing="14">
          BALCÓN
        </text>
        <text x="4115" y="7920" fontSize="135" letterSpacing="15">
          GALERÍA
        </text>
        <rect
          x="3065"
          y="4290"
          width="2100"
          height="510"
          rx="70"
          fill="#e9d6ad"
        />
        <text x="4115" y="4500" fontSize="132" fill="#211c13" fontWeight="600">
          NUESTROS SITIOS
        </text>
        <text x="4115" y="4690" fontSize="110" fill="#211c13">
          MITTELLOGE · FILA {trip.ballet.row}
        </text>
        <path
          d="M4115 4800 V5320"
          stroke="#e9d6ad"
          strokeWidth="16"
          fill="none"
        />
      </g>
      {expanded && (
        <text
          x="4115"
          y="8180"
          textAnchor="middle"
          fontSize="85"
          fill="#c8baa2"
        >
          Diagrama de venta · niveles desplegados · no indica disponibilidad
        </text>
      )}
    </svg>
  );
});
function OperaTickets({ open, explorerRef }) {
  const date = new Date(trip.ballet.startsAt),
    format = (options) =>
      new Intl.DateTimeFormat("es-ES", {
        ...options,
        timeZone: "Europe/Vienna",
      }).format(date);
  return (
    <section className="opera-tickets" id="ballet-detalles">
      <div className="opera-tickets-heading">
        <span className="opera-label">LA NOCHE YA TIENE SU LUGAR</span>
        <h2>
          Dos sitios.
          <br />
          <em>Todo por sentir.</em>
        </h2>
        <p>Una fecha. Un escenario. Nosotros, en el centro de la historia.</p>
      </div>
      <div className="opera-ticket-layout">
        <div className="opera-ticket-copy">
          <div className="opera-ticket-date">
            <strong>{format({ day: "numeric" })}</strong>
            <div>
              <span>{format({ month: "long", year: "numeric" })}</span>
              <p>
                {trip.ballet.time} <small>h · hora de Viena</small>
              </p>
            </div>
          </div>
          <div className="opera-ticket-seat">
            <span className="opera-label">NUESTROS SITIOS</span>
            <h3>{trip.ballet.area}</h3>
            <div>
              <p>
                <span>FILA</span>
                <strong>{trip.ballet.row}</strong>
              </p>
              <p>
                <span>ASIENTOS</span>
                <strong>{trip.ballet.seats.replace(" y ", " + ")}</strong>
              </p>
            </div>
            <p>En el palco central, frente al escenario.</p>
          </div>
          <button
            className="opera-view-button"
            onClick={(e) => open("room", e.currentTarget)}
          >
            <Photo name="room" />
            <span>
              <Eye size={18} />
              <strong>Ver la vista desde Mittelloge</strong>
              <small>Una perspectiva real desde el mismo palco.</small>
            </span>
            <ArrowUpRight size={18} />
          </button>
          <div className="opera-ticket-address">
            <MapPin size={18} />
            <p>
              <strong>{trip.ballet.theatre}</strong>
              <span>{trip.ballet.address}</span>
              <button
                className="opera-text-link"
                onClick={(e) =>
                  explorerRef?.current?.open("staatsoper", e.currentTarget)
                }
              >
                Cómo llegar a la Ópera <ArrowUpRight size={14} />
              </button>
            </p>
          </div>
        </div>
        <div className="opera-map-panel">
          <div className="opera-map-top">
            <span className="opera-label">
              EL TEATRO ENTERO. NUESTRO PEQUEÑO LUGAR.
            </span>
            <button
              className="opera-map-expand"
              onClick={(e) => open("map", e.currentTarget)}
              aria-label="Ampliar plano completo de butacas"
            >
              <Expand size={17} />
            </button>
          </div>
          <OperaSeatingMap />
          <p className="opera-map-caption">
            <span className="opera-selected-dot" /> Asientos {trip.ballet.seats}{" "}
            · {trip.ballet.area} · fila {trip.ballet.row}
          </p>
          <p className="opera-map-note">
            Plano completo de venta con los niveles desplegados. No representa
            distancias reales ni disponibilidad.
          </p>
        </div>
      </div>
      <details className="opera-programme-details">
        <summary>
          Las tres obras de la noche{" "}
          <span>
            Ver programa <ArrowDown size={15} />
          </span>
        </summary>
        <div className="opera-piece-grid">
          {operaProgramme.map((p, i) => (
            <article key={p.id}>
              <span className="opera-label">
                0{i + 1} · {p.year}
              </span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="opera-piece-music">
                Coreografía · {p.choreographer}
                <br />
                Música · {p.music}
              </p>
            </article>
          ))}
        </div>
        <p className="opera-programme-duration">
          Duración anunciada aproximada: 2 h 45 min, con dos entreactos.{" "}
          <a href={operaProgrammeUrl} target="_blank" rel="noreferrer">
            Programa oficial <ArrowUpRight size={13} />
          </a>
        </p>
      </details>
      <p className="opera-chapter-credit">
        Fotografías de producción: Ashley Taylor / Wiener Staatsballett.
        Auditorio: C.Stadler/Bwag ·{" "}
        <a href={operaPhotos.room.licenseUrl} target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>
        .
      </p>
    </section>
  );
}
const OperaViewer = forwardRef(function OperaViewer(_, ref) {
  const dialog = useRef(null),
    trigger = useRef(null),
    context = useRef(null);
  const [selection, setSelection] = useState(null);
  useImperativeHandle(
    ref,
    () => ({
      open(key, element) {
        trigger.current = element;
        const section = element.closest("section[id]");
        context.current = {
          width: innerWidth,
          height: innerHeight,
          section,
          triggerTop: element.getBoundingClientRect().top,
          progress: Number(section?.dataset.operaProgress || 1),
        };
        setSelection({ key, nonce: Date.now() });
      },
    }),
    [],
  );
  useLayoutEffect(() => {
    if (selection && !dialog.current.open) dialog.current.showModal();
  }, [selection]);
  const isMap = selection?.key === "map",
    photo = selection && !isMap ? operaPhotos[selection.key] : null;
  return (
    <dialog
      ref={dialog}
      className="opera-viewer"
      aria-labelledby="opera-viewer-title"
      onClose={() => {
        const saved = context.current;
        if (
          saved?.section &&
          (saved.width !== innerWidth || saved.height !== innerHeight)
        ) {
          if (saved.section.classList.contains("opera-scene")) {
            if (saved.section.classList.contains("reduced-scene")) {
              saved.section
                .querySelector(".opera-programme")
                .scrollIntoView({ block: "start", behavior: "instant" });
            } else {
              const b = saved.section.getBoundingClientRect(),
                sticky = saved.section.querySelector(".scene-sticky");
              window.scrollTo({
                top:
                  b.top +
                  scrollY +
                  Math.min(0.98, saved.progress) *
                    (b.height - sticky.clientHeight),
                behavior: "instant",
              });
            }
          } else {
            const b = trigger.current.getBoundingClientRect();
            window.scrollTo({
              top:
                scrollY +
                b.top -
                Math.max(85, Math.min(saved.triggerTop, innerHeight - 120)),
              behavior: "instant",
            });
          }
        }
        trigger.current?.focus({ preventScroll: true });
      }}
    >
      <div className="opera-viewer-top">
        <div>
          <span className="opera-label">UNA NOCHE EN LA ÓPERA</span>
          <h2 id="opera-viewer-title">
            {isMap
              ? "Nuestros sitios en el teatro."
              : selection?.key === "room"
                ? "Desde el mismo palco."
                : photo?.title}
          </h2>
        </div>
        <button
          className="opera-map-expand"
          aria-label="Cerrar imagen de la Ópera"
          onClick={() => dialog.current.close()}
        >
          <X />
        </button>
      </div>
      <div className={`opera-viewer-image ${isMap ? "is-map" : ""}`}>
        {isMap ? (
          <OperaSeatingMap expanded />
        ) : (
          photo && <Photo name={selection.key} />
        )}
      </div>
      {photo && (
        <div className="opera-viewer-caption">
          <p>
            {selection.key === "room"
              ? "Vista frontal real desde Mittelloge. La fila y el asiento de la cámara no están documentados; no es una simulación exacta de nuestras butacas. Fotografía de 2023, con otra escenografía."
              : "Fotografía oficial de esta producción, anterior a nuestra función. El reparto del 22 de enero no se deduce de la imagen."}
          </p>
          <a href={photo.sourcePage} target="_blank" rel="noreferrer">
            © {photo.author} · Fuente{" "}
            {photo.licenseUrl && `· ${photo.license}`}{" "}
            <ArrowUpRight size={13} />
          </a>
        </div>
      )}
    </dialog>
  );
});
export default function OperaScene({ explorerRef }) {
  const chapter = useRef(null),
    viewer = useRef(null);
  useOperaChrome(chapter);
  const open = (key, trigger) => viewer.current?.open(key, trigger);
  return (
    <div
      ref={chapter}
      className="opera-chapter"
      data-chapter="Una noche especial"
    >
      <OperaCinema open={open} />
      <OperaTickets open={open} explorerRef={explorerRef} />
      <OperaViewer ref={viewer} />
    </div>
  );
}
