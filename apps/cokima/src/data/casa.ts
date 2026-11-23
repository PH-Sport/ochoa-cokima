// «La casa» de la portada: cuatro fotos del local, no del plato. Viven aquí y no
// en cada página para que la versión en inglés no se quede con otra serie.
//
// Salen de la fototeca de Instagram (docs/fotografia.md §La fototeca) y las eligió
// el agente el 2026-10-26 con el criterio delegado por Mario. La sala no tiene foto
// propia en las publicaciones recientes: la cubre una mesa puesta, que es la sala
// vista de cerca. Sustituir una es dejar otro archivo con el mismo nombre.
import pase from "../assets/casa/pase.jpg";
import sala from "../assets/casa/sala.jpg";
import producto from "../assets/casa/producto.jpg";
import equipo from "../assets/casa/equipo.jpg";

export const casa: {
  src: ImageMetadata;
  alt: { es: string; en: string };
  // Las verticales se recortan a 4:3; sin esto el recorte va al centro y al
  // cocinero le corta la cara.
  position?: string;
}[] = [
  {
    src: pase,
    alt: {
      es: "Sartén en llamas sobre el fogón de la cocina de Cokima",
      en: "A pan in flames on the stove in Cokima's kitchen",
    },
  },
  {
    src: sala,
    alt: {
      es: "Vino blanco sirviéndose en una mesa puesta de Cokima",
      en: "White wine being poured at a set table in Cokima",
    },
  },
  {
    src: producto,
    alt: {
      es: "Maracuyá abierto, con sus pepitas, antes de pasar por cocina",
      en: "Passion fruit cut open, seeds and all, before it goes into the kitchen",
    },
  },
  {
    src: equipo,
    alt: {
      es: "Un cocinero de Cokima, con guantes negros, salseando un plato",
      en: "A Cokima cook in black gloves saucing a plate",
    },
    position: "50% 20%",
  },
];
