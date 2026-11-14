import data from "./data/vienna-places.json" with { type: "json" };

// Literal paths are embedded by the existing standalone exporter.
const photoSources = {
  stephansdom: "/images/vienna-stephansdom.jpg",
  graben: "/images/vienna-graben.jpg",
  peterskirche: "/images/vienna-peterskirche.jpg",
  kohlmarkt: "/images/vienna-kohlmarkt.jpg",
  hofburg: "/images/vienna-hofburg.jpg",
  prunksaal: "/images/vienna-prunksaal.jpg",
  albertina: "/images/vienna-albertina.jpg",
  staatsoper: "/images/vienna-staatsoper.jpg",
  burggarten: "/images/vienna-burggarten.jpg",
  "maria-theresien": "/images/vienna-maria-theresien.jpg",
  kunsthistorisches: "/images/vienna-kunsthistorisches.jpg",
  museumsquartier: "/images/vienna-museumsquartier.jpg",
  volksgarten: "/images/vienna-volksgarten.jpg",
  parlament: "/images/vienna-parlament.jpg",
  rathaus: "/images/vienna-rathaus.jpg",
  freyung: "/images/vienna-freyung.jpg",
  "am-hof": "/images/vienna-am-hof.jpg",
  judenplatz: "/images/vienna-judenplatz.jpg",
  ankeruhr: "/images/vienna-ankeruhr.jpg",
  franziskanerplatz: "/images/vienna-franziskanerplatz.jpg",
  karlskirche: "/images/vienna-karlskirche.jpg",
  musikverein: "/images/vienna-musikverein.jpg",
  secession: "/images/vienna-secession.jpg",
  naschmarkt: "/images/vienna-naschmarkt.jpg",
  stadtpark: "/images/vienna-stadtpark.jpg",
  belvedere: "/images/vienna-belvedere.jpg",
  hundertwasserhaus: "/images/vienna-hundertwasserhaus.jpg",
  kunsthaus: "/images/vienna-kunsthaus.jpg",
  "cafe-central": "/images/vienna-cafe-central.jpg",
  "cafe-sacher": "/images/vienna-cafe-sacher.jpg",
  demel: "/images/vienna-demel.jpg",
  justizpalast: "/images/vienna-justizpalast.jpg",
};
export const placesData = data;
export const places = data.places.map((place) => ({
  ...place,
  image: photoSources[place.id],
}));
