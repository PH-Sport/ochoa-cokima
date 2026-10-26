// Recoge las fotos de una cuenta de Instagram desde su propia página, en un navegador normal.
//
// POR QUÉ EXISTE. Las webs necesitan las fotos recientes que el equipo sube a Instagram, y
// Instagram no deja descargarlas. El 2026-10-26 no había acceso a las cuentas (ni exportación
// oficial ni API de Meta), y leer el perfil con una petición directa a su API interna quedó
// descartado: es saltarse sus protecciones. Esto es lo mismo que hacer a mano con el inspector,
// pero de una vez: lee lo que la página ya enseña a quien la mira.
//
// CÓMO SE USA. Se ejecuta en la página de Instagram (el agente, o cualquiera en la consola):
//   1. En el perfil (instagram.com/<cuenta>/) baja hasta el final y lista las publicaciones con
//      su fecha, que sale del propio código de la publicación.
//   2. En cada publicación (instagram.com/p/XXXX/) devuelve sus fotos en alta, pasando el
//      carrusel entero, con el texto y la fecha.
// Con ENVIAR = true, además manda el resultado a scripts/fototeca-receptor.py navegando a
// 127.0.0.1:8765, que es la única salida que funciona con sesión iniciada (el porqué, en el
// receptor). Con ENVIAR = false solo lo devuelve: en la consola, `copy(await <este fichero>)`.
// Las URLs de las fotos van firmadas y caducan en unos días: hay que descargar justo después.
//
// MEDIDO el 2026-10-26: sin sesión el perfil enseña solo 12 publicaciones (las sueltas se abren
// todas); con sesión, el perfil entero. Las fotos llegan a 1440 px de ancho; alguna antigua se
// queda en 942. Con sesión, la página de cada publicación añade «Más publicaciones» con fotos
// igual de grandes: se distinguen porque van dentro de un enlace a otra publicación.
// Si Instagram cambia su página, lo que se rompe es esto: los selectores de abajo.
(async () => {
  const ENVIAR = true;
  const RECEPTOR = "http://127.0.0.1:8765";
  const MIN_WIDTH = 900;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const send = (path, data) => {
    if (ENVIAR) setTimeout(() => { location.href = `${RECEPTOR}${path}?d=${encodeURIComponent(JSON.stringify(data))}`; }, 50);
    return data;
  };
  // El código de la publicación es su id en base 64; los bits altos son milisegundos desde la
  // época de Instagram. Comprobado contra dos fechas conocidas.
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const dateOf = (code) => {
    let n = 0n;
    for (const ch of code.slice(0, 11)) n = n * 64n + BigInt(ALPHABET.indexOf(ch));
    return new Date(Number(n >> 23n) + 1314220021721).toISOString().slice(0, 10);
  };

  const postMatch = location.pathname.match(/\/(?:p|reel)\/([^/]+)/);
  await sleep(1500);

  if (!postMatch) {
    const posts = new Map();
    const grab = () => {
      for (const a of document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')) {
        const m = new URL(a.href).pathname.match(/\/(p|reel)\/([^/]+)/);
        if (!m || posts.has(m[2])) continue;
        const labels = [...a.querySelectorAll("svg[aria-label]")].map((s) => s.getAttribute("aria-label"));
        posts.set(m[2], { code: m[2], date: dateOf(m[2]), reel: m[1] === "reel" || labels.includes("Clip") });
      }
    };
    // Sin sesión no pasa de 12; con sesión carga a medida que se baja.
    for (let last = -1, same = 0; same < 3; ) {
      grab();
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(1500);
      grab();
      if (posts.size === last) same++; else { same = 0; last = posts.size; }
    }
    return send("/lista", { account: location.pathname.split("/")[1], posts: [...posts.values()] });
  }

  const code = postMatch[1];
  const images = new Map();
  const grab = () => {
    for (const img of document.querySelectorAll("main img")) {
      if (img.naturalWidth < MIN_WIDTH || img.closest('a[href*="/p/"], a[href*="/reel/"]')) continue;
      const key = img.currentSrc.split("?")[0];
      if (!images.has(key)) images.set(key, { url: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight });
    }
  };
  // La foto grande a veces tarda más que la página: una espera fija dejó una publicación vacía.
  for (let i = 0; i < 20 && images.size === 0; i++) {
    grab();
    if (images.size === 0) await sleep(500);
  }
  // El carrusel carga cada foto al llegar a ella, así que hay que pasarlo entero. Las diapositivas
  // de vídeo no tienen foto grande y se quedan fuera solas.
  for (let i = 0; i < 20; i++) {
    const next = document.querySelector('main button[aria-label="Siguiente"], main button[aria-label="Next"]');
    if (!next) break;
    next.click();
    await sleep(900);
    grab();
  }

  const meta = (p) => document.querySelector(`meta[property="${p}"]`)?.content ?? "";
  const title = meta("og:title");
  // El título es «Nombre en Instagram: "texto"»; el texto es lo que nombra el plato.
  const quote = title.indexOf(': "');
  const caption = quote === -1 ? document.querySelector("main h1")?.innerText ?? "" : title.slice(quote + 3).replace(/"$/, "");
  const ogUrl = new URL(meta("og:url") || location.href);

  return send("/save", {
    kind: "post",
    account: ogUrl.pathname.split("/").filter(Boolean)[0],
    code,
    url: `${location.origin}/p/${code}/`,
    date: document.querySelector("main time")?.dateTime || dateOf(code),
    caption,
    images: [...images.values()],
  });
})();
