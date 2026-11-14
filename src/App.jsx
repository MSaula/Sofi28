import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Menu,
  Plane,
  X,
  Check,
} from "lucide-react";
import { trip, cityIdeas, site } from "./content";
import {
  useReveal,
  useReducedMotion,
  useResponsiveScrollAnchor,
} from "./hooks";
import { downloadCalendar } from "./calendar";
import { tripDateLabels } from "./dates";
import CalendarScene from "./components/CalendarScene";
import JourneyScene from "./components/JourneyScene";
import OperaScene, { OperaDetails } from "./components/OperaScene";
import Picture from "./components/Picture";
import Stay from "./components/Stay";

function App() {
  useReveal();
  useResponsiveScrollAnchor();
  const reduced = useReducedMotion();
  const menu = useRef(null);
  const credits = useRef(null);
  const [chapter, setChapter] = useState(site.name);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setChapter(entry.target.dataset.chapter);
        });
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    document
      .querySelectorAll("[data-chapter]")
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const navigate = (id) => {
    menu.current.close();
    document
      .querySelector(id)
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <>
      <a className="skip-link" href="#carta">
        Saltar a la carta
      </a>
      <header className="site-header">
        <a href="#inicio" className="wordmark" aria-label="Volver al inicio">
          {site.name}
          <span>•</span>
        </a>
        <span className="header-chapter" aria-hidden="true">
          {chapter}
        </span>
        <button
          className="menu-button"
          onClick={() => menu.current.showModal()}
          aria-label="Abrir el recorrido"
        >
          <span>El recorrido</span>
          <Menu size={17} />
        </button>
      </header>
      <main>
        <section className="hero" id="inicio" data-chapter={site.name}>
          <div className="hero-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              <span className="blue-dot" /> UN DÍA A TU ALTURA
            </span>
            <h1>
              Hoy cumples <br />
              <span>28 años.</span>
            </h1>
            <p>{site.heroSubtitle}</p>
          </div>
          <div className="hero-bottom">
            <span>
              Un regalo.
              <br />
              Una historia por descubrir.
            </span>
            <a href="#carta" className="scroll-invitation">
              <span>Sin prisa. Sigue bajando.</span>
              <span className="round-arrow">
                <ArrowDown size={19} />
              </span>
            </a>
            <span className="hero-edition">
              HECHO PARA TI
              <br />
              CON MUCHO AMOR
            </span>
          </div>
        </section>

        <section
          className="letter-section section-pad"
          id="carta"
          data-chapter="Unas palabras"
        >
          <div className="letter-rule">
            <span>UNAS PALABRAS</span>
            <Heart size={15} strokeWidth={1.5} />
          </div>
          <div className="letter-copy">
            <h2>{trip.letterTitle}</h2>
            {trip.letter.length ? (
              trip.letter.map((paragraph, i) => <p key={i}>{paragraph}</p>)
            ) : (
              <div className="letter-placeholder">
                <p>Este espacio es para tu carta.</p>
                <p>
                  Las palabras las pondrás tú.
                  <br />
                  Lo que viene después, lo descubrimos juntos.
                </p>
              </div>
            )}
            <span className="letter-signature">Para ti. Siempre.</span>
          </div>
          <div className="letter-end">
            <span>Y ahora…</span>
            <ArrowDown size={18} />
          </div>
        </section>

        <div data-chapter="Unos días para nosotros">
          <CalendarScene />
        </div>
        <div data-chapter="¿A dónde iremos?">
          <JourneyScene />
        </div>
        <Stay />
        <City />
        <div data-chapter="Una noche especial">
          <OperaScene />
          <OperaDetails />
        </div>
        <Summary />
      </main>
      <footer className="site-footer">
        <a className="wordmark" href="#inicio">
          {site.name}
          <span>•</span>
        </a>
        <p>El próximo recuerdo lo hacemos juntos.</p>
        <div>
          <button onClick={() => credits.current.showModal()}>Imágenes</button>
          <a href="#inicio" aria-label="Volver arriba">
            <ArrowUp size={17} />
          </a>
        </div>
      </footer>

      <dialog
        ref={menu}
        className="navigation-dialog"
        aria-labelledby="menu-title"
      >
        <div className="dialog-top">
          <span className="wordmark">
            {site.name}
            <span>•</span>
          </span>
          <button
            className="icon-button"
            onClick={() => menu.current.close()}
            aria-label="Cerrar recorrido"
          >
            <X />
          </button>
        </div>
        <span className="eyebrow" id="menu-title">
          A TU RITMO
        </span>
        <nav>
          {[
            ["#carta", "Unas palabras"],
            ["#fechas", "Unos días"],
            ["#destino", "Un destino"],
            ["#estancia", "Nuestro lugar"],
            ["#ballet", "Una noche"],
            ["#resumen", "Todo, aquí"],
          ].map(([id, label], i) => (
            <button key={id} onClick={() => navigate(id)}>
              <span>0{i + 1}</span>
              {label}
              <ArrowUpRight size={22} />
            </button>
          ))}
        </nav>
      </dialog>
      <dialog
        ref={credits}
        className="credits-dialog"
        aria-labelledby="credits-title"
      >
        <button
          className="icon-button close-dialog"
          onClick={() => credits.current.close()}
          aria-label="Cerrar créditos"
        >
          <X />
        </button>
        <span className="eyebrow">DIRECCIÓN VISUAL</span>
        <h2 id="credits-title">Las imágenes.</h2>
        <p>
          Las ilustraciones de esta primera versión son originales y
          conceptuales. No representan las instalaciones del apartamento ni una
          escena del ballet.
        </p>
        <p>
          Esta versión utiliza imágenes locales para que el recorrido y la
          versión descargable tengan el mismo aspecto, incluso sin conexión.
        </p>
        <p className="muted">
          Las fotografías del apartamento proceden del anuncio de Airbnb
          compartido y analizado. Son imágenes reales; las escenas de la ciudad
          y del ballet siguen siendo ilustraciones conceptuales.
        </p>
      </dialog>
    </>
  );
}

function RailButtons({ rail }) {
  const move = (direction) =>
    rail.current?.scrollBy({
      left: direction * rail.current.clientWidth * 0.78,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <div className="rail-buttons">
      <button onClick={() => move(-1)} aria-label="Ver elementos anteriores">
        <ChevronLeft size={19} />
      </button>
      <button onClick={() => move(1)} aria-label="Ver elementos siguientes">
        <ChevronRight size={19} />
      </button>
    </div>
  );
}

function City() {
  const rail = useRef(null);
  return (
    <section
      className="city-section section-pad"
      id="ciudad"
      data-chapter="Viena, sin prisa"
    >
      <div className="section-heading" data-reveal>
        <div>
          <span className="eyebrow">ENTRE UNA COSA Y OTRA</span>
          <h2>
            Una ciudad.
            <br />
            <span>Todo por descubrir.</span>
          </h2>
        </div>
        <p>
          Sin llenarlo todo de planes.
          <br />
          Con tiempo para lo que nos apetezca.
        </p>
      </div>
      <div className="city-rail" ref={rail}>
        {cityIdeas.map((idea) => (
          <article className="city-card" key={idea.title}>
            <Picture src={idea.image} remote={idea.remote} alt={idea.alt} />
            <div className="city-card-copy">
              <span className="tiny-label">{idea.tag}</span>
              <h3>{idea.title}</h3>
              <p>{idea.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="gallery-controls">
        <span>Pequeñas ideas. Ninguna prisa.</span>
        <RailButtons rail={rail} />
      </div>
    </section>
  );
}

function Summary() {
  const dates = tripDateLabels(trip);
  const [saved, setSaved] = useState(false);
  const save = () => {
    downloadCalendar();
    setSaved(true);
  };
  return (
    <section
      className="summary-section section-pad"
      id="resumen"
      data-chapter="Todo lo que nos espera"
    >
      <div className="summary-title" data-reveal>
        <span className="eyebrow">
          <span className="blue-dot" /> EL PRÓXIMO RECUERDO
        </span>
        <h2>
          Nos vamos
          <br />a <span>Viena.</span>
        </h2>
        <p>{trip.dates}</p>
      </div>
      <div className="summary-grid" data-reveal>
        <article>
          <span className="summary-icon">
            <CalendarDays size={21} />
          </span>
          <span className="tiny-label">EL FIN DE SEMANA</span>
          <h3>
            {dates.dayRange} {dates.month}
          </h3>
          <p>
            {dates.weekdays}
            <br />
            {dates.year}.
          </p>
        </article>
        <article>
          <span className="summary-icon">
            <Plane size={21} />
          </span>
          <span className="tiny-label">EL VIAJE</span>
          <h3>
            BCN <ArrowRight size={20} /> VIE
          </h3>
          <p>
            {trip.origin} → El Prat → Viena.
            <br />
            {trip.flight.outbound || "Horarios de vuelo por confirmar."}
          </p>
        </article>
        <article>
          <span className="summary-icon">
            <MapPin size={21} />
          </span>
          <span className="tiny-label">NUESTRO LUGAR</span>
          <h3>Un Airbnb en Viena.</h3>
          <p>
            Un ático en {trip.airbnb.neighborhood}.
            <br />
            Referencia aproximada · punto publicado por Airbnb.
          </p>
          <a
            href={trip.airbnb.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Ver el apartamento <ArrowUpRight size={14} />
          </a>
        </article>
        <article className="summary-ballet">
          <span className="summary-icon">
            <span className="ballet-mark">L.</span>
          </span>
          <span className="tiny-label">LA NOCHE ESPECIAL</span>
          <h3>{trip.ballet.title}</h3>
          <p>
            {trip.ballet.date} · {trip.ballet.time}
            <br />
            {trip.ballet.theatre}
          </p>
          <p className="summary-seat">
            {trip.ballet.area} · fila {trip.ballet.row} · asientos{" "}
            {trip.ballet.seats}
          </p>
        </article>
      </div>
      <div className="summary-actions">
        <button className="primary-button" onClick={save}>
          {saved ? <Check size={17} /> : <CalendarDays size={17} />}{" "}
          {saved ? "Volver a guardar las fechas" : "Guardar las fechas"}{" "}
          <ArrowDown size={15} />
        </button>
        <p role="status">
          {saved
            ? "Calendario preparado: viaje y ballet."
            : "Tres días para nosotros."}
        </p>
      </div>
      <div className="closing-note" data-reveal>
        <Heart size={21} strokeWidth={1.4} />
        <p>
          El destino es Viena.
          <br />
          <span>Lo mejor es ir contigo.</span>
        </p>
      </div>
    </section>
  );
}

export default App;
