import listing from "./data/airbnb-listing.json" with { type: "json" };
import { performanceDateLabels, tripDateLabels } from "./dates.js";

const travelDates = { startDate: "2027-01-22", endDate: "2027-01-24" };
const performanceStartsAt = "2027-01-22T19:00:00+01:00";
const travelLabels = tripDateLabels(travelDates);
const performanceLabels = performanceDateLabels(performanceStartsAt);

export const site = {
  name: "Sofi 28",
  heroSubtitle: "Y eso merece un regalo a la altura.",
};

// All personal content lives here. Never add ticket PDFs, barcodes or booking credentials.
export const trip = {
  dates: travelLabels.long,
  shortDates: travelLabels.compact,
  ...travelDates,
  origin: "Sant Vicenç de Montalt",
  destination: "Viena",
  // Fill with the final letter. Each string becomes one normal, unanimated paragraph.
  letter: [],
  letterTitle: "Antes de empezar,",
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

export const cityIdeas = [
  {
    title: "Perder la noción del tiempo.",
    subtitle: "Calles con historia. Paseos sin prisa.",
    tag: "01 / EXPLORAR",
    image: "/images/vienna-city.svg",
    remote: null,
    alt: "Una vista de Viena y su arquitectura",
  },
  {
    title: "Un café. Y todo el tiempo.",
    subtitle: "Una mesa para dos en un café vienés.",
    tag: "02 / PARAR",
    image: "/images/vienna-cafe.svg",
    remote: null,
    alt: "Ilustración de una pausa para tomar café",
  },
  {
    title: "Dejarnos sorprender.",
    subtitle: "El resto lo iremos descubriendo allí.",
    tag: "03 / IMPROVISAR",
    image: "/images/vienna-palace.svg",
    remote: null,
    alt: "Ilustración arquitectónica inspirada en Viena",
  },
];
