// Recoge las fotos de una cuenta de Instagram desde su propia página, en un navegador normal.
//
// POR QUÉ EXISTE. Las webs necesitan las fotos recientes que el equipo sube a Instagram, y
// Instagram no deja descargarlas. El 2026-10-26 no había acceso a las cuentas (ni exportación
// oficial ni API de Meta), y leer el perfil con una petición directa a su API interna quedó
// descartado: es saltarse sus protecciones. Esto es lo mismo que hacer a mano con el inspector,
// pero de una vez: lee lo que la página ya enseña a cualquiera, sin iniciar sesión.
//
// CÓMO SE USA. Se ejecuta en la consola del navegador (o lo ejecuta el agente en el suyo):
//   1. En el perfil (instagram.com/cokimamadrid/) devuelve la lista de publicaciones visibles.
//   2. En cada publicación (instagram.com/p/XXXX/) devuelve sus fotos en alta, pasando el
//      carrusel entero, con el texto y la fecha.
// En la consola: `copy(await <este fichero entero>)` deja el resultado en el portapapeles, y se
// guarda en un .json para `scripts/fototeca.py`, que es quien descarga. Las URLs de las fotos van
// firmadas y caducan en unos días: hay que descargar justo después de recoger.
//
// LÍMITES MEDIDOS el 2026-10-26: sin sesión el perfil enseña solo las 12 publicaciones más
// recientes; las publicaciones sueltas sí se abren todas. Las fotos llegan a 1440 px de ancho
// (1440×1919 o 1440×1800), más que la exportación oficial. Los vídeos se marcan y no se recogen.
// Si Instagram cambia su página, lo que se rompe es esto: los selectores de abajo.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const postMatch = location.pathname.match(/\/(?:p|reel)\/([^/]+)/);
  await sleep(1500);

  if (!postMatch) {
    const seen = new Set();
    const posts = [];
    for (const a of document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')) {
      const href = new URL(a.getAttribute("href"), location.origin).pathname;
      const code = href.match(/\/(?:p|reel)\/([^/]+)/)[1];
      if (seen.has(code)) continue;
      seen.add(code);
      const labels = [...a.querySelectorAll("svg[aria-label]")].map((s) => s.getAttribute("aria-label"));
      posts.push({
        code,
        url: `${location.origin}/p/${code}/`,
        video: href.includes("/reel/") || labels.includes("Clip"),
      });
    }
    return { kind: "profile", account: location.pathname.split("/")[1], posts };
  }

  const meta = (p) => document.querySelector(`meta[property="${p}"]`)?.content ?? "";
  const ogUrl = new URL(meta("og:url") || location.href);
  const title = meta("og:title");
  // El título es «Nombre en Instagram: "texto"»; el texto es lo que nombra el plato.
  const quote = title.indexOf(': "');
  const caption = quote === -1 ? "" : title.slice(quote + 3).replace(/"$/, "");
  // La fecha va en la descripción, en inglés aunque la interfaz esté en castellano.
  const date = meta("og:description").match(/ (?:el|on) ([A-Z][a-z]+ \d{1,2}, \d{4}):/)?.[1] ?? "";

  // Solo las imágenes grandes son de la publicación: las de «más publicaciones» llegan a 640.
  const images = new Map();
  const grab = () => {
    for (const img of document.querySelectorAll("main img")) {
      if (img.naturalWidth < 1000) continue;
      const key = img.currentSrc.split("?")[0];
      if (!images.has(key)) {
        images.set(key, { url: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight, alt: img.alt });
      }
    }
  };
  // La foto grande a veces tarda más que la página: una espera fija dejó una publicación vacía.
  for (let i = 0; i < 16 && images.size === 0; i++) {
    grab();
    if (images.size === 0) await sleep(500);
  }
  // El carrusel carga cada foto al llegar a ella, así que hay que pasarlo entero.
  for (let i = 0; i < 20; i++) {
    const next = document.querySelector('button[aria-label="Siguiente"], button[aria-label="Next"]');
    if (!next) break;
    next.click();
    await sleep(900);
    grab();
  }

  return {
    kind: "post",
    account: ogUrl.pathname.split("/").filter(Boolean)[0],
    code: postMatch[1],
    url: `${location.origin}/p/${postMatch[1]}/`,
    date,
    caption,
    images: [...images.values()],
  };
})();
