// Resuelve por glob para que añadir una foto sea dejar el archivo en la carpeta:
// la clave es el nombre del fichero sin extensión y coincide con el campo
// `image` de menu-*.json. Un plato sin archivo no rompe nada — Highlights
// pinta su ficha sin foto.
const files = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/dishes/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

export const dishImages: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [
    path.split("/").pop()!.replace(/\.[^.]+$/, ""),
    mod.default,
  ]),
);
