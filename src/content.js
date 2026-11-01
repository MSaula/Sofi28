import { vienna } from "./geography.js";
import { performanceDateLabels, tripDateLabels } from "./dates.js";

const travelDates = { startDate: "2027-01-22", endDate: "2027-01-24" };
const performanceStartsAt = "2027-01-22T19:00:00+01:00";
const travelLabels = tripDateLabels(travelDates);
const performanceLabels = performanceDateLabels(performanceStartsAt);

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
  { name: "Grecia", year: 2024, month: 7 },
  { name: "País Vasco", year: 2024, month: 8 },
  { name: "Dolomitas", year: 2025, month: 0 },
  { name: "Indonesia", year: 2025, month: 7 },
  { name: "Lanzarote", year: 2025, month: 9 },
  { name: "Florencia", year: 2026, month: 2 },
  { name: "Egipto", year: 2026, month: 5 },
  { name: "México", year: 2026, month: 7 },
  { name: "Lisboa", year: 2026, month: 8 },
];

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
