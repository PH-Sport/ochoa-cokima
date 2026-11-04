// La carta de Brasa, para las páginas. Los platos salen de menu-es.json en el build, sin copia aquí, y esto
// añade lo que la carta no dice: las fotos y las frases. Hasta el 2026-11-04 lo pintaba brasa.js, y sin
// ejecutar JavaScript no había ni un plato.
import { getCollection } from "astro:content";

export const platosDeLaCarta = async () => (await getCollection("menu-es")).map(({ id, data }) => ({ id, ...data }));
export const precio = (p: number) => (Number.isInteger(p) ? p + " €" : p.toFixed(2).replace(".", ",") + " €");

// Los platos con foto en la fototeca, y la frase que la casa ha publicado de cada uno.
export const FOTOS: Record<string, { img: string; w: number; h: number; alt: string; frase: string | null }> = {
  "compartir-01": { img: "croquetas", w: 825, h: 1100, alt: "Una croqueta con su velo de papada", frase: "Han pasado por casi todas nuestras cartas. Y siguen aquí" },
  "compartir-04": { img: "gyozas", w: 1100, h: 1100, alt: "Gyozas de langostino con salsa de chorizo", frase: "Compartir es vivir." },
  "compartir-06": { img: "dumpling", w: 880, h: 1100, alt: "Dumpling de chipirones", frase: "Madrid cabe en un dumpling." },
  "compartir-10": { img: "tacos", w: 1100, h: 1100, alt: "Una mano sostiene un taco de gambón", frase: null },
  "terminar-02": { img: "katsu", w: 880, h: 1100, alt: "Katsu sando con patatas", frase: "Hay dos tipos de clientes en Cokima." },
  "terminar-04": { img: "arroz", w: 720, h: 1280, alt: "Arroz meloso de carabinero", frase: "Este plato cambia el ritmo de la mesa…" },
  "postres-01": { img: "tarta", w: 1100, h: 1100, alt: "Una mujer se come la tarta de queso", frase: "La mejor crítica nunca ha necesitado palabras." },
  "postres-02": { img: "torrija", w: 880, h: 1100, alt: "La torrija servida bajo el neón", frase: "Un postre que no se comparte, se saborea lento." },
};
// Platos sin foto que también tienen frase propia publicada: llevan la voz en vez de la foto.
export const VOCES: Record<string, string> = { "terminar-05": "Hay platos que entran en carta. Y otros que se agarran a ella." };
export const PARTES = [["compartir", "Compartir es vivir"], ["terminar", "Para terminar o no…"], ["postres", "Y por fin, los postres"]] as const;
// Cada parte de la carta se abre con uno de sus platos en foto —con su nombre, su precio y su frase— y,
// debajo, los demás. Mario la eligió entre tres maneras el 2026-11-02, «con el resto de platos abajo»;
// hasta que vio el plato de la foto repetido en la lista, que sobraba (docs/cokima-el-rediseno.md §3).
export const PORTADILLAS: Record<(typeof PARTES)[number][0], string> = { compartir: "compartir-04", terminar: "terminar-04", postres: "postres-02" };
