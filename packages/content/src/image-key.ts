/**
 * Clave de archivo de la foto de un plato, derivada de su nombre.
 *
 * Existe para que la rejilla guía pueda escribir el nombre exacto del archivo
 * que hay que dejar: sin esto, quien traiga las fotos tiene que adivinar cómo
 * llamarlas y media biblioteca acaba sin enganchar con su plato.
 *
 * "Croissant de rabo de toro" → "croissant-de-rabo-de-toro"
 */
export function dishImageKey(name: string): string {
  return name
    .normalize("NFD")
    // Fuera los acentos, que los sufren los sistemas de archivos y las URLs.
    // El rango es el de los diacríticos combinables que deja suelto NFD.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
