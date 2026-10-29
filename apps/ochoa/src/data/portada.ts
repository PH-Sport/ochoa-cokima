// La portada de Ochoa: ocho fotos de su Instagram. Viven aquí y no en el
// componente para que la versión en inglés no se quede con otra serie.
//
// La serie es la tercera ronda del probador (2026-10-29). La de antes —seis fotos
// de la casa con gente, puesta el 2026-10-27— no le convencía a Mario,
// «principalmente por las fotos». Estas ocho no salen en el resto de la home: dos
// brindis, una clienta, un camarero con un brioche, un vermú con su gilda, una
// caña tirándose, el rótulo del cristal y vino en la mesa. Salen de la fototeca
// (docs/fotografia.md §La fototeca) tal cual, a su tamaño de Instagram. El orden
// es el de la serie.
//
// Se enseñan distinto según la pantalla (docs/ochoa-inicio-vivo.md):
//  · en el móvil, una a una a pantalla completa, con el telón. La foto llena el
//    alto y se recorta por los lados, así que cada una lleva su encuadre;
//  · en el ordenador, todas en fila y enteras, en «la tira». Ahí no se recorta
//    nada y el encuadre no cuenta.
import brindis from "../assets/portada/brindis.jpg";
import clienta from "../assets/portada/clienta.jpg";
import brioche from "../assets/portada/brioche.jpg";
import vermuGilda from "../assets/portada/vermu-gilda.jpg";
import brindisBarra from "../assets/portada/brindis-barra.jpg";
import cana from "../assets/portada/cana.jpg";
import cristal from "../assets/portada/cristal.jpg";
import vino from "../assets/portada/vino.jpg";

export const portada: {
  src: ImageMetadata;
  alt: { es: string; en: string };
  /** El encuadre en el móvil (`object-position`): lo que se queda cuando el
   *  recorte se come los lados. Va a lo que cuenta cada foto, no al centro. */
  encuadre?: string;
  /** Cuánto se acerca la foto en el móvil, hacia su encuadre (`scale`). */
  acerca?: number;
  /** Solo en la tira del ordenador. */
  soloOrdenador?: boolean;
}[] = [
  {
    src: brindis,
    encuadre: "42% 50%",
    alt: {
      es: "Brindis con una copa de vino y una caña sobre una mesa con tapas",
      en: "A toast with a glass of wine and a beer over a table with tapas",
    },
  },
  {
    src: clienta,
    encuadre: "42% 50%",
    alt: {
      es: "Una clienta bebiendo en una mesa de mármol",
      en: "A customer drinking at a marble table",
    },
  },
  {
    src: brioche,
    encuadre: "50% 50%",
    alt: {
      es: "Un camarero con el delantal de la casa y un brioche en el plato",
      en: "A waiter in the house apron, with a brioche on the plate",
    },
  },
  {
    src: vermuGilda,
    encuadre: "95% 50%",
    alt: {
      es: "Un vermú y una gilda sobre el papel de la casa",
      en: "A vermouth and a gilda on the house paper",
    },
  },
  {
    src: brindisBarra,
    encuadre: "46% 50%",
    alt: {
      es: "Brindis con una caña y un vermú",
      en: "A toast with a beer and a vermouth",
    },
  },
  {
    src: cana,
    encuadre: "15% 50%",
    alt: {
      es: "Tirando una caña, con el delantal de la casa",
      en: "Pulling a beer, in the house apron",
    },
  },
  // El rótulo no cabe en vertical: recortado para el móvil se leía «S OCHO».
  // Entero, en la tira del ordenador, sí.
  {
    src: cristal,
    soloOrdenador: true,
    alt: {
      es: "El rótulo de Tasquita Los Ochoa en el cristal, con la sala detrás",
      en: "The Tasquita Los Ochoa sign on the glass, with the dining room behind",
    },
  },
  // Pegada a la derecha, en el móvil aún asomaba el servilletero con «HOA»
  // cortado en el borde izquierdo; acercándola un 15% hacia la copa desaparece
  // el texto (medido en WebKit a 390×844 a 3×, en el probador).
  {
    src: vino,
    encuadre: "100% 50%",
    acerca: 1.15,
    alt: {
      es: "Sirviendo vino tinto en una mesa de mármol",
      en: "Pouring red wine at a marble table",
    },
  },
];
