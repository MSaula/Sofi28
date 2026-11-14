import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Coffee,
  MapPin,
  Plus,
  Sun,
  X,
} from "lucide-react";
import { trip } from "../content";
import { useMediaQuery, useScene } from "../hooks";
import { stayState } from "../stayMotion";
import "./Stay.css";

const benefitIcons = {
  light: Sun,
  bed: BedDouble,
  coffee: Coffee,
  place: MapPin,
};

export default function Stay() {
  const { ref, progress, reduced } = useScene();
  const state = stayState(reduced ? 1 : progress);
  const rail = useRef(null),
    lightbox = useRef(null),
    opener = useRef(null);
  const photos = trip.airbnb.photos;
  const portrait = useMediaQuery("(max-width: 700px)");
  const heroIndex = portrait ? 1 : 0;
  const hero = photos[heroIndex];
  const [selected, setSelected] = useState(0);
  const [edges, setEdges] = useState({ first: true, last: false });

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const update = () => {
      setEdges({
        first: node.scrollLeft < 2,
        last: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2,
      });
    };
    const resize = new ResizeObserver(update);
    resize.observe(node);
    node.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      resize.disconnect();
      node.removeEventListener("scroll", update);
    };
  }, [photos.length]);

  const move = (direction) => {
    const node = rail.current;
    const step =
      node.firstElementChild.getBoundingClientRect().width +
      parseFloat(getComputedStyle(node).gap);
    node.scrollBy({
      left: direction * step,
      behavior: reduced ? "instant" : "smooth",
    });
  };
  const openPhoto = (index, event) => {
    opener.current = event.currentTarget;
    setSelected(index);
    lightbox.current.showModal();
  };
  const selectPhoto = (direction) =>
    setSelected(
      (current) => (current + direction + photos.length) % photos.length,
    );

  return (
    <section
      className="stay-section stay-experience"
      id="estancia"
      data-chapter="Nuestro ático en Viena"
      aria-labelledby="stay-title"
    >
      <div className="stay-heading section-pad">
        <span className="eyebrow">
          <span className="blue-dot" /> EL APARTAMENTO
        </span>
        <div className="stay-heading-row">
          <h2 id="stay-title">
            Un ático.
            <br />
            <span>Para nosotros.</span>
          </h2>
          <p>
            Un lugar al que volver después de perdernos por Viena.
            <br />Y dos mañanas para empezar sin prisa.
          </p>
        </div>
      </div>
      <section
        ref={ref}
        id="estancia-reveal"
        className={
          "scroll-scene stay-scene" + (reduced ? " reduced-scene" : "")
        }
        aria-label="Una primera mirada a nuestro apartamento"
      >
        <div className="scene-sticky stay-stage">
          <div
            className="stay-film"
            style={{
              clipPath:
                "inset(" +
                state.insetY +
                "% " +
                state.insetX +
                "% round " +
                state.radius +
                "px)",
              "--stay-image-scale": state.imageScale,
              "--stay-shade": state.shadeOpacity,
              "--stay-copy": state.copyOpacity,
              "--stay-copy-y": state.copyY + "px",
            }}
          >
            <img
              className="stay-hero-image"
              src={hero.src}
              alt={hero.alt}
              decoding="async"
              loading="eager"
            />
            <div className="stay-film-shade" aria-hidden="true" />
            <div className="stay-film-copy">
              <span className="tiny-label">NUESTRO LUGAR EN LANDSTRASSE</span>
              <p className="stay-film-title">
                Despertar
                <br />
                <span>en Viena.</span>
              </p>
              <p className="stay-film-detail">
                Luz natural. Una gran cama.
                <br />Y toda una ciudad por delante.
              </p>
              <a
                href="#estancia-fotos"
                className="stay-film-link"
                tabIndex={state.copyOpacity > 0.95 ? 0 : -1}
                aria-hidden={state.copyOpacity < 0.95}
              >
                Descubrir sus rincones <ArrowDown size={16} />
              </a>
            </div>
            <button
              className="stay-hero-zoom"
              onClick={(event) => openPhoto(heroIndex, event)}
              aria-label={"Ampliar fotografía: " + hero.title}
              tabIndex={state.copyOpacity > 0.95 ? 0 : -1}
              aria-hidden={state.copyOpacity < 0.95}
              style={{
                opacity: state.copyOpacity,
                visibility: state.copyOpacity < 0.01 ? "hidden" : "visible",
              }}
            >
              <Plus size={21} />
            </button>
            <span
              className="stay-film-dates"
              style={{ opacity: state.copyOpacity }}
            >
              {trip.shortDates}
            </span>
          </div>
        </div>
      </section>

      <div
        className="stay-benefits section-pad"
        aria-label="Lo que nos espera en el apartamento"
      >
        {trip.airbnb.benefits.map((benefit) => {
          const Icon = benefitIcons[benefit.icon];
          return (
            <article className="stay-benefit" key={benefit.icon} data-reveal>
              <Icon size={25} strokeWidth={1.4} aria-hidden="true" />
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="stay-gallery section-pad" id="estancia-fotos">
        <div className="stay-gallery-heading" data-reveal>
          <div>
            <span className="eyebrow">POR DENTRO</span>
            <h3>
              Cuatro rincones.
              <br />
              <span>Un mismo plan.</span>
            </h3>
          </div>
          <p>
            Preparar algo juntos.
            <br />
            Alargar un desayuno. Volver a descansar.
          </p>
        </div>
        <div className="gallery-controls stay-gallery-controls">
          <span aria-live="polite">04 rincones para descubrir</span>
          <div className="rail-buttons">
            <button
              onClick={() => move(-1)}
              disabled={edges.first}
              aria-label="Ver rincones anteriores"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              onClick={() => move(1)}
              disabled={edges.last}
              aria-label="Ver rincones siguientes"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        <p className="sr-only" id="stay-rail-help">
          Desliza las fotografías o usa las flechas izquierda y derecha. Pulsa
          una imagen para ampliarla.
        </p>
        <div
          className="stay-photo-rail"
          ref={rail}
          tabIndex={0}
          role="region"
          aria-label="Rincones del apartamento"
          aria-describedby="stay-rail-help"
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              move(event.key === "ArrowRight" ? 1 : -1);
            }
            if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              rail.current.scrollTo({
                left: event.key === "Home" ? 0 : rail.current.scrollWidth,
                behavior: reduced ? "instant" : "smooth",
              });
            }
          }}
        >
          {photos.slice(1).map((photo, index) => (
            <article className="stay-photo-card" key={photo.src}>
              <button
                className="stay-card-image"
                onClick={(event) => openPhoto(index + 1, event)}
                aria-label={"Ampliar fotografía: " + photo.title}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  decoding="async"
                  loading="eager"
                />
                <span className="stay-card-plus" aria-hidden="true">
                  <Plus size={20} />
                </span>
              </button>
              <div className="stay-card-copy">
                <span className="tiny-label">{photo.tag}</span>
                <h4>{photo.title}</h4>
                <p>{photo.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="stay-caption">
          <span>
            <MapPin size={14} />
            {trip.airbnb.neighborhood} · referencia aproximada
          </span>
          <a
            className="text-link"
            href={trip.airbnb.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver el apartamento <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      <dialog
        ref={lightbox}
        className="stay-lightbox"
        aria-label="Fotografías del apartamento"
        onClose={() => opener.current?.focus({ preventScroll: true })}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            selectPhoto(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <button
          className="icon-button stay-lightbox-close"
          onClick={() => lightbox.current.close()}
          aria-label="Cerrar fotografía"
        >
          <X />
        </button>
        <div className="stay-lightbox-image">
          <img src={photos[selected].src} alt={photos[selected].alt} />
        </div>
        <div className="stay-lightbox-caption">
          <button
            className="icon-button"
            onClick={() => selectPhoto(-1)}
            aria-label="Fotografía anterior"
          >
            <ChevronLeft />
          </button>
          <div aria-live="polite">
            <p className="stay-lightbox-title">
              {photos[selected].title}{" "}
              <span>
                {selected + 1} / {photos.length}
              </span>
            </p>
            <p>{photos[selected].description}</p>
          </div>
          <button
            className="icon-button"
            onClick={() => selectPhoto(1)}
            aria-label="Fotografía siguiente"
          >
            <ChevronRight />
          </button>
        </div>
      </dialog>
    </section>
  );
}
