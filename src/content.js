import { vienna } from "./geography.js";
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
    address: "Untere Weißgerberstraße 37, 1030 Wien",
    coordinates: vienna.reference.coordinates,
    locationPrecision: "approximate-street",
    locationSource:
      "User-supplied approximate address; point derived from the real street geometry, not a verified building geocode.",
    uncertaintyMeters: vienna.reference.uncertaintyMeters,
    // Use local assets in /public/images. Example: { src: '/images/salon.webp', title: 'El salón', alt: '...' }
    photos: [],
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
