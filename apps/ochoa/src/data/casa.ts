// La casa de Ochoa: las diez fotos del mosaico vivo, en el orden en que salen.
// Viven aquí para que las dos homes enseñen la misma serie, como la portada.
//
// Las cuatro primeras abren el mosaico —el cristal en la grande, como antes
// abrazaba el titular— y las demás esperan turno. Son las cuatro fotos del local
// de 2021 y las seis de Instagram que entraron con el muro el 2026-10-28
// (docs/fotografia.md §Fotos de la casa).
//
// `nombre` es la etiqueta que lleva la foto grande, como una chapa. Mario cambió
// dos el 2026-10-29 porque no se entendían: «La ronda» (el chico con dos cañas por
// gafas) pasó a «Las gafas», que es lo que se ve, y «El delantal» (Guille) a «El
// equipo». Las que le cuadran nombran lo que sale. En inglés, traducidas tal cual.
//
// `encuadre` coloca la foto en su ventana como un `object-position`: las
// verticales lo necesitan para que el recorte no se lleve la cara.
import rotulo from "../assets/casa/rotulo.jpg";
import barra from "../assets/casa/barra.jpg";
import canas from "../assets/casa/canas.jpg";
import vermu from "../assets/casa/vermu.jpg";
import bandeja from "../assets/casa/bandeja.jpg";
import cafe from "../assets/casa/cafe.jpg";
import comedor from "../assets/casa/comedor.jpg";
import futbol from "../assets/casa/futbol.jpg";
import gafasDeCana from "../assets/casa/gafas-de-cana.jpg";
import delantal from "../assets/casa/delantal.jpg";

export const casa: {
  src: ImageMetadata;
  encuadre?: string;
  nombre: { es: string; en: string };
  alt: { es: string; en: string };
}[] = [
  {
    src: rotulo,
    encuadre: "50% 20%",
    nombre: { es: "El cristal", en: "The glass" },
    alt: {
      es: "Rótulo de Los Ochoa pintado en el cristal, con la terraza al otro lado",
      en: "The Los Ochoa sign painted on the window, with the terrace on the other side",
    },
  },
  {
    src: barra,
    nombre: { es: "La barra", en: "The bar" },
    alt: {
      es: "Barra de Los Ochoa con las botellas y el espejo rotulado a mano: tortilla, gildas, ensaladilla, patatas bravas",
      en: "The bar at Los Ochoa with its bottles and hand-lettered mirror: tortilla, gildas, Russian salad, patatas bravas",
    },
  },
  {
    src: canas,
    nombre: { es: "Las cañas", en: "The beers" },
    alt: {
      es: "Camarero tirando cañas con clientes en la barra",
      en: "A waiter pulling beers with customers at the bar",
    },
  },
  {
    src: vermu,
    nombre: { es: "El vermú", en: "The vermouth" },
    alt: {
      es: "Vermú con hielo y una banderilla de anchoa y aceituna sobre mármol",
      en: "Vermouth on the rocks with an anchovy and olive skewer on marble",
    },
  },
  {
    src: bandeja,
    encuadre: "50% 30%",
    nombre: { es: "Las bravas", en: "The bravas" },
    alt: {
      es: "Camarero llevando unas bravas",
      en: "A waiter carrying a plate of bravas",
    },
  },
  {
    src: cafe,
    encuadre: "50% 45%",
    nombre: { es: "El café", en: "The coffee" },
    alt: {
      es: "Camarera sirviendo la leche en el café",
      en: "A waitress pouring the milk into the coffee",
    },
  },
  {
    src: comedor,
    nombre: { es: "El comedor", en: "The dining room" },
    alt: {
      es: "Interior del local: banco corrido rojo, mesas de mármol y el rótulo visto desde dentro",
      en: "Inside the bar: red banquette, marble tables and the sign seen from within",
    },
  },
  {
    src: futbol,
    nombre: { es: "El fútbol", en: "The football" },
    alt: {
      es: "Clientes viendo el fútbol en la barra",
      en: "Customers watching football at the bar",
    },
  },
  {
    src: gafasDeCana,
    encuadre: "50% 30%",
    nombre: { es: "Las gafas", en: "The glasses" },
    alt: {
      es: "Un cliente con la camiseta de Los Ochoa y dos cañas por gafas",
      en: "A customer in a Los Ochoa T-shirt, with two beers for glasses",
    },
  },
  {
    src: delantal,
    encuadre: "50% 18%",
    nombre: { es: "El equipo", en: "The team" },
    alt: {
      es: "Un camarero poniéndose el delantal de la casa",
      en: "A waiter putting on the house apron",
    },
  },
];
