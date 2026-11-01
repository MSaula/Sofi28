import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useScene } from "../hooks";
import { trip } from "../content";
import { mix, range, smooth } from "../motion";

export default function OperaScene() {
  const { ref, progress: p, reduced } = useScene();
  const opening = smooth(range(p, 0.08, 0.63));
  const title = smooth(range(p, 0.65, 0.82));
  const intro = 1 - range(p, 0.12, 0.31);
  return (
    <section
      className={`scroll-scene opera-scene ${reduced ? "reduced-scene" : ""}`}
      ref={ref}
      id="ballet"
      aria-label={`${trip.ballet.title} en la Ópera Estatal de Viena`}
    >
      <div className="scene-sticky" style={{ backgroundColor: "#f5f5f7" }}>
        <div className="opera-intro" style={{ opacity: intro }}>
          <span className="eyebrow">
            <span className="blue-dot" /> 03 — UNA NOCHE
          </span>
          <h2>Hay una cosa más.</h2>
        </div>
        <div
          className="opera-aperture"
          style={{
            clipPath: `inset(${mix(39, 0, opening)}% ${mix(8, 0, opening)}% round ${mix(18, 0, opening)}px)`,
          }}
        >
          <img
            src="/images/opera.svg"
            alt="Ilustración conceptual de un auditorio de ópera, con palcos y escenario"
            style={{ transform: `scale(${mix(1.16, 1, opening)})` }}
          />
          <div className="opera-vignette" />
        </div>
        <div
          className="opera-content"
          style={{
            opacity: title,
            transform: `translateY(${mix(40, 0, title)}px)`,
          }}
        >
          <span className="eyebrow opera-kicker">
            WIENER STAATSOPER · VIENA
          </span>
          <h2>
            {trip.ballet.title.split(" ")[0]} <br />
            <span>{trip.ballet.title.split(" ").slice(1).join(" ")}.</span>
          </h2>
          <div className="opera-bottom-content">
            <p>{trip.ballet.choreographers.join(" · ")}</p>
            <div className="opera-date">
              <span>{trip.ballet.date}</span>
              <strong>{trip.ballet.time}</strong>
            </div>
          </div>
        </div>
        <div
          className="scene-bottom"
          style={{ color: opening > 0.95 ? "#c1c1c8" : "#636b78" }}
        >
          <span>
            {p > 0.6
              ? "Dos entradas. Una noche para recordar."
              : "Sigue bajando. Lo mejor está por abrirse."}
          </span>
          <span className="opera-art-note">Ilustración conceptual</span>
          <ArrowDown size={15} />
        </div>
      </div>
    </section>
  );
}

export function OperaDetails() {
  return (
    <section className="opera-details section-pad" id="ballet-detalles">
      <div className="opera-details-inner" data-reveal>
        <div>
          <span className="eyebrow">UNA NOCHE EN LA ÓPERA</span>
          <h2>
            Dos sitios.
            <br />Y todo por sentir.
          </h2>
          <p>
            Tres grandes nombres del ballet.
            <br />
            Un escenario extraordinario. Nosotros, allí.
          </p>
        </div>
        <div className="seat-detail">
          <div className="seat-miniature" aria-hidden="true">
            <span />
            <span />
          </div>
          <span className="tiny-label">NUESTROS SITIOS</span>
          <h3>{trip.ballet.area}</h3>
          <div className="seat-numbers">
            <p>
              <span>FILA</span>
              <strong>{trip.ballet.row}</strong>
            </p>
            <p>
              <span>ASIENTOS</span>
              <strong>{trip.ballet.seats}</strong>
            </p>
          </div>
          <a
            className="text-link light-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.ballet.theatre + " " + trip.ballet.address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {trip.ballet.address} <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
