import listing from "./data/airbnb-listing.json" with { type: "json" };
import { performanceDateLabels, tripDateLabels } from "./dates.js";

const travelDates = { startDate: "2027-01-22", endDate: "2027-01-24" };
const performanceStartsAt = "2027-01-22T19:00:00+01:00";
const travelLabels = tripDateLabels(travelDates);
const performanceLabels = performanceDateLabels(performanceStartsAt);
const includeLetter = import.meta.env?.VITE_WITH_LETTER !== "false";

export const site = {
  name: "Sofi 28",
  heroSubtitle: "Y eso merece un regalo a la altura.",
  includeLetter,
};

// All personal content lives here. Never add ticket PDFs, barcodes or booking credentials.
export const trip = {
  dates: travelLabels.long,
  shortDates: travelLabels.compact,
  ...travelDates,
  origin: "Sant Vicenç de Montalt",
  destination: "Viena",
  // Each string becomes one normal, unanimated paragraph.
  letter: includeLetter
    ? [
        "Hello, SofiSofi. Hoy cumples 28 años, y como siempre, estar celebrándolo a tu lado es lo que más ilusión me hace en el mundo. Así como poderte dar por fin el regalo, después de tantas semanas de preparación e investigación. Esta vez he decidido cambiar ligeramente el formato de como darte el regalo y exprimir un poco los tokens que tengo de ChatGPT y así poder darte una experiencia más inmersiva con el proceso de que se trata este año el regalo… Te diría que siguieras ya scrollenado la página e ir descubriendo poco a poco de que se trata esta vez, pero como siempre… primero quiero dedicarte unas palabras como es ya tradición.",
        "Esta es ya la sexta vez que te escribo un mensaje de celebración. Y, como siempre, hay algunas cosas que no han cambiado nada desde la primera vez. Te quiero infinitamente y eres la persona más importante en el mundo para mí. Y por ello, siempre estaré a tu lado para ayudarte y hacer lo que haga falta para que estés feliz y todo vaya de la mejor manera.",
        "Este año tu cumpleaños justo esta cayendo en una etapa un poco difícil… hay que reconocer que aunque hayas pasado por momentos intensos anteriormente, ahora mismo la situación en general esta siendo de las más intensas vividas hasta ahora. Y es duro que justamente esto caiga por estas fechas en específico. Aún así, aquí el mensaje no es de pesimismo ni mucho menos. Lo que te quiero decir son dos cosas.",
        "Primero, que eres una profesional de la hostia y que toda la currada que estas realizando ahora te va a compensar en el futuro. A cada día que pasa te admiro más y te respeto más. No eres consciente de lo orgulloso que me hace como tu novio de verte en la grabación interviniendo en la Audiencia Nacional en un caso de tal magnitud. Te lo has currado como nadie y haces un trabajazo espectacular. Y no puedo estar más que orgulloso que ver como avanzas, creces y te conviertes en una profesional que sé que va a llegar muy lejos. No paras de crecer y mejorar constantemente y nunca dejas de asombrarme.",
        "Segundo, aquí estamos, celebrándolo los dos juntos una vez más. Recibiendo el regalo de manera especial y a punto de irlo a celebrar mano a mano. Y lo único que espero y que quiero es que al menos, dentro de toda esta situación, pueda conseguir que este cumpleaños pueda ser especial para ti y que lo disfrutes y te haga la máxima ilusión posible. Como siempre, aquí mi objetivo es ayudarte a dar la vuelta al estrés y el cansancio y conseguir que juntos podamos ser la batería de energía del otro. Definitivamente, estar contigo me cura todos los males y es lo que más feliz me hace y espero que yo pueda ayudarte de la misma manera que haces conmigo.",
        "Nunca dejaré de admirarte y de creer que eres mi persona favorita del mundo. Realmente es de estas cosas que cuánto más lo pienso, más cualidades veo en ti y mas motivos tengo para quererte. Eres una persona con juicio, razonamiento y extremadamente inteligente. Tienes una inteligencia emocional que admiro profundamente. Y todo esto al final lo que hace es que tenga una confianza total en ti, confío en tus decisiones, confío en tus acciones, en tus preferencias, en tus consejos y confío en que la mejor vida que puedo llegar a tener es una vida a tu lado y por ello vale la pena valorar de la mejor manera posible esta relación que estamos construyendo juntos.",
        "Aunque el último párrafo parezca que te vaya a pedir matrimonio (not yet), esta felicitación tiene dos objetivos. Uno es mirar de ponerle palabras a todo lo que siento por ti (lo cual es imposible, pero cada año voy poniendo un trozito nuevo) y la otra obviamente es para poderte dar el tan ansioso trabajo que llevo tanto tiempo preparando a tus espaldas. Realmente es una locura las celebraciones que llevamos a las espaldas. Niza, Londres, Islandia, Dolomitas, Toscana… Cada uno de ellos ha sido una experiencia totalmente distinta que nos ha podido dar unos recuerdos que llevaremos dentro nuestro hasta el resto de nuestras vidas. Todo lo que hemos podido viajar juntos es algo que no pensaba que fuera posible, pero que a cada nuevo que hacemos, más me reafirma lo mucho que disfruto de conocer el mundo contigo y de vivir juntos todas estas experiencias. Y aquí estamos para seguir sumando recuerdos y álbumes y posts de Instagram para dar envidia a nuestros familiares y amigos a cada comida o cena que tengamos.",
        "Espero que disfrutes de este formato más digitalizado que se viene a continuación. Por ahora tu solo debes conocer 2 cosas:",
        "Que te quiero,",
        "Y que ahora te toca deslizar poco a poco por el resto de la página…",
      ]
    : [],
  letterTitle: includeLetter ? "Antes de nada..." : "",
  airbnb: {
    url: "https://www.airbnb.es/rooms/1083895869289261763",
    name: "Nuestro lugar en Viena",
    neighborhood: "Landstraße · 1030 Viena",
    address: null,
    addressReference: listing.location.userAddressReference,
    coordinates: listing.location.coordinates,
    locationPrecision: "approximate-listing",
    locationSource:
      "Punto publicado por Airbnb en la copia del anuncio del 14/11/2026; la plataforma lo indica como aproximado.",
    uncertaintyMeters: null,
    benefits: [
      {
        icon: "light",
        title: "Luz por ambos lados.",
        text: "Grandes ventanales y techos inclinados. Viena, al otro lado del cristal.",
      },
      {
        icon: "bed",
        title: "Alargar la mañana.",
        text: "Una cama doble grande y un baño con bañera para cambiar de ritmo.",
      },
      {
        icon: "coffee",
        title: "El primer café, aquí.",
        text: "Cocina equipada para preparar el desayuno a nuestro ritmo.",
      },
      {
        icon: "place",
        title: "Volver sin prisas.",
        text: "En Landstraße, cerca de Hundertwasserhaus. Con ascensor y llegada autónoma.",
      },
    ],
    photos: [
      {
        src: "/images/apartment-bedroom.jpg",
        title: "Nuestro ático en Viena.",
        description:
          "Una cama doble, grandes ventanales y un rincón para bajar el ritmo.",
        alt: "Vista general del dormitorio del ático, con cama doble, dos butacas y grandes ventanas",
      },
      {
        src: "/images/apartment-bedroom-window.jpg",
        tag: "01 — EL DORMITORIO",
        title: "Un ratito más.",
        description:
          "Una cama doble grande y dos butacas junto a la ventana. Para empezar el día sin correr.",
        alt: "Cama doble y dos butacas junto a los ventanales del dormitorio, bajo el techo inclinado",
      },
      {
        src: "/images/apartment-kitchen.jpg",
        tag: "02 — LA COCINA",
        title: "El primer café.",
        description:
          "Cocina equipada, cafetera y espacio para preparar algo juntos antes de salir.",
        alt: "Cocina blanca con placa, microondas, fregadero y cafetera junto a la mesa de comedor",
      },
      {
        src: "/images/apartment-dining.jpg",
        tag: "03 — EL COMEDOR",
        title: "Sin mirar el reloj.",
        description:
          "Una mesa junto a la luz del ático. Desayunos tranquilos y planes que pueden esperar.",
        alt: "Comedor del ático con cuatro sillas, ventana de cubierta y puerta acristalada",
      },
      {
        src: "/images/apartment-daybed.jpg",
        tag: "04 — EL ESTAR",
        title: "También, no hacer nada.",
        description:
          "Un rincón con televisión y una cama auxiliar abatible. Un descanso antes de volver a salir.",
        alt: "Cama individual auxiliar desplegada bajo el mueble del televisor, junto al ventanal",
      },
    ],
  },
  flight: { outbound: null, inbound: null },
  ballet: {
    title: "Living Legacies",
    theatre: "Wiener Staatsoper",
    ...performanceLabels,
    startsAt: performanceStartsAt,
    choreographers: ["Balanchine", "Wheeldon", "Ashton"],
    area: "Mittelloge",
    row: "3",
    seats: "23 y 24",
    address: "Opernring 2, 1010 Wien",
  },
};

// Months are zero-based. Within-month days are deliberately unspecified.
export const memories = [
  // Original portrait photos supplied in s28p.zip, associated by filename.
  {
    name: "Niza",
    year: 2022,
    month: 2,
    birthdayAge: 23,
    photo: {
      src: "/images/niza.jpeg",
      alt: "Los dos en Niza, sentados en un salón de madera con un perro a nuestros pies",
    },
  },
  { name: "Mallorca", year: 2022, month: 7 },
  {
    name: "Londres",
    year: 2023,
    month: 0,
    birthdayAge: 24,
    photo: {
      src: "/images/londres.jpeg",
      alt: "Los dos delante de las fachadas de colores de Londres",
    },
  },
  { name: "Montenegro", year: 2023, month: 7 },
  { name: "Roma", year: 2023, month: 9 },
  {
    name: "Islandia",
    year: 2023,
    month: 11,
    birthdayAge: 25,
    photo: {
      src: "/images/islandia.jpeg",
      alt: "Los dos en un paisaje nevado de Islandia",
    },
  },
  { name: "Grecia", year: 2024, month: 7 },
  { name: "País Vasco", year: 2024, month: 8 },
  {
    name: "Dolomitas",
    year: 2025,
    month: 0,
    birthdayAge: 26,
    photo: {
      src: "/images/dolomitas.jpeg",
      alt: "Los dos con las montañas nevadas de las Dolomitas al fondo",
    },
  },
  { name: "Indonesia", year: 2025, month: 7 },
  { name: "Lanzarote", year: 2025, month: 9 },
  {
    name: "Florencia",
    year: 2026,
    month: 2,
    birthdayAge: 27,
    photo: {
      src: "/images/florencia.jpeg",
      alt: "Los dos junto al río Arno, con el Ponte Vecchio de Florencia detrás",
    },
  },
  { name: "Egipto", year: 2026, month: 5 },
  { name: "México", year: 2026, month: 7 },
  { name: "Lisboa", year: 2026, month: 8 },
];

export const timelineStart = { year: 2022, month: 0 };
const nextDate = new Date(`${trip.startDate}T12:00:00Z`);
export const currentBirthdayGift = {
  // Keep the destination reveal in the following map scene.
  name: "Lo próximo",
  year: nextDate.getUTCFullYear(),
  month: nextDate.getUTCMonth(),
  birthdayAge: 28,
  photo: null,
  current: true,
};
export const timelineEvents = [...memories, currentBirthdayGift];
