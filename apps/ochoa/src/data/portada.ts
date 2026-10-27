// La portada de Ochoa: seis fotos de la casa que se relevan con el telón. Viven
// aquí y no en el componente para que la versión en inglés no se quede con otra
// serie.
//
// Mario la cambió el 2026-10-26: «realmente no nos hace falta una foto del local
// en la portada», y propuso un collage o un carrusel con lo que sube el equipo a
// Instagram. Eligió el carrusel con telón entre cinco bocetos. Son fotos del
// local con gente —camareros, clientas, el cocinero— y no de platos: los platos
// ya los enseña «Lo que más sale», justo debajo. Salen de la fototeca
// (docs/fotografia.md §La fototeca), a los 1440 px con los que las sirve
// Instagram. El orden es el de la ronda: la sala con el rótulo de la casa abre.
import sala from "../assets/portada/sala.jpg";
import barraClientas from "../assets/portada/barra-clientas.jpg";
import cocinero from "../assets/portada/cocinero.jpg";
import barraRotulos from "../assets/portada/barra-rotulos.jpg";
import sirviendo from "../assets/portada/sirviendo.jpg";
import rotuloExterior from "../assets/portada/rotulo-exterior.jpg";

export const portada: {
  src: ImageMetadata;
  alt: { es: string; en: string };
  // Solo cuenta en pantallas anchas: en el móvil la portada es vertical y las
  // fotos se recortan por los lados, nunca por arriba. En el ordenador es al
  // revés —1440×682 a 1440 px de ancho—, y centradas, al camarero de la barra y
  // al cocinero se les iba la cara por arriba. Medido el 2026-10-27 sobre el
  // build. La del camarero sirviendo se deja al centro a propósito: subiéndola
  // entraba él, pero se iba la clienta, que es la que mira a cámara.
  position?: string;
}[] = [
  {
    src: sala,
    alt: {
      es: "La sala con el rótulo «La tasca que te mereces» y clientes",
      en: "The dining room under the «La tasca que te mereces» sign, with customers",
    },
  },
  {
    src: barraClientas,
    position: "50% 20%",
    alt: {
      es: "Camarero sonriendo a dos clientas en la barra",
      en: "A waiter smiling at two customers at the bar",
    },
  },
  {
    src: cocinero,
    position: "50% 12%",
    alt: {
      es: "El cocinero con un cuchillo sobre la cortina roja",
      en: "The cook holding a knife against the red curtain",
    },
  },
  {
    src: barraRotulos,
    alt: {
      es: "Camarero en la barra con los rótulos pintados detrás",
      en: "A waiter at the bar with the hand-painted signs behind him",
    },
  },
  {
    src: sirviendo,
    alt: {
      es: "Camarero sirviendo a una clienta en su mesa",
      en: "A waiter serving a customer at her table",
    },
  },
  {
    src: rotuloExterior,
    alt: {
      es: "El cartel colgante de la fachada",
      en: "The hanging sign outside",
    },
  },
];
