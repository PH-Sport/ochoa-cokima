/**
 * ¿Se dibujan las rejillas guía de foto?
 *
 * Son una herramienta de trabajo: marcan dónde irá cada imagen para poder
 * decidir el encuadre antes de que exista la foto. **No pueden salir a
 * producción bajo ningún concepto**, así que la garantía no es acordarse de
 * apagarlas: es esta función, que solo las enciende cuando consta que el
 * despliegue NO es el público.
 *
 * Dos condiciones, y las dos tienen que fallar para que aparezcan en el sitio
 * real: que Vercel no diga que es producción, y que no haya `SITE_URL` —la
 * misma variable que ya bloquea el build de producción cuando falta
 * (`resolveSiteUrl`). Un dominio publicado siempre tiene una de las dos.
 *
 * Efecto práctico: se ven en `dev` y en las previews por rama, que es donde
 * hacen falta, y no se ven en producción ni en un build local que simule
 * producción pasando `SITE_URL`.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {boolean}
 */
export function showPhotoGuides(env = process.env) {
  if (env.VERCEL_ENV === "production") return false;
  if (env.SITE_URL?.trim()) return false;
  return true;
}
