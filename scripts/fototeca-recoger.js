// Recoge las fotos Y LOS VÍDEOS de una cuenta de Instagram desde su propia página, en un navegador
// normal. Versión 2, del 2026-10-30 (Cokima); desde el 2026-11-04 vale para cualquier cuenta.
//
// QUÉ CAMBIA RESPECTO A LA V1, Y POR QUÉ:
// - Mario pidió también los vídeos y todas las diapositivas de cada carrusel, a la mayor calidad.
//   La v1 leía las <img> de la pantalla: los vídeos ahí son un `blob:` sin dirección, y el carrusel
//   había que pasarlo a clics. La página de cada publicación, cargada entera, trae dentro (en sus
//   <script type="application/json">) los datos de la publicación: todas las diapositivas, cada
//   foto a 1440 y cada vídeo. No se pide nada a Instagram: se lee lo que la página ya tiene.
// - Vídeos: en pantalla salen a 720p (la versión «progresiva», imagen y sonido juntos), pero la
//   página trae también la versión DASH a 1080p, con imagen y sonido por separado. Se mandan las
//   pistas mejores de las dos y fototeca.py las junta sin recomprimir. Medido el 2026-10-30 en un
//   reel: progresiva 720x1280; DASH hasta 1080x1920 (VP9, 2,6 Mb/s) más una pista de sonido.
// - Perfil: deja de bajar al pasar de SINCE (con Ochoa bajaba hasta el final), y vale también en
//   la pestaña de reels (/<cuenta>/reels/), por si algún reel no sale en la rejilla.
// - Se queda un rato en cada publicación (DWELL) antes de seguir: Mario prefiere ir despacio a que
//   Instagram bloquee la cuenta.
//
// CÓMO SE USA: igual que la v1, con scripts/fototeca-receptor.py (v2) escuchando en 127.0.0.1:8765.
// La extensión del navegador tapa en sus respuestas todo lo que parece un código de publicación o
// una dirección firmada, así que lo que devuelve este script es solo un resumen con números; los
// datos de verdad viajan al receptor en la dirección, como en la v1.
(async () => {
  const ENVIAR = true;
  const RECEPTOR = "http://127.0.0.1:8765";
  // La cuenta sale de la dirección del perfil y se recuerda para las publicaciones, que no la
  // llevan siempre en la suya. Lo que manda es la cuenta recogida, no el autor: una publicación en
  // colaboración puede ser de otro. Por eso hay que pasar antes por el perfil.
  const enPerfil = !/\/(?:p|reel)\//.test(location.pathname);
  if (enPerfil) localStorage.setItem("fototeca_cuenta", location.pathname.split("/")[1]);
  const CUENTA = localStorage.getItem("fototeca_cuenta");
  const SINCE = "2024-01-01";
  const DWELL = [5000, 11000];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = ([a, b]) => a + Math.random() * (b - a);
  const send = (path, data) => {
    if (ENVIAR) setTimeout(() => { location.href = `${RECEPTOR}${path}?d=${encodeURIComponent(JSON.stringify(data))}`; }, 100);
  };
  // El código de la publicación es su id en base 64; los bits altos son milisegundos desde la
  // época de Instagram. Comprobado contra dos fechas conocidas (v1).
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const dateOf = (code) => {
    let n = 0n;
    for (const ch of code.slice(0, 11)) n = n * 64n + BigInt(ALPHABET.indexOf(ch));
    return new Date(Number(n >> 23n) + 1314220021721).toISOString().slice(0, 10);
  };
  // Si Instagram pide iniciar sesión o una comprobación, se para: no se navega a ningún sitio.
  const blocked = () => !!document.querySelector('input[name="username"]') || /\/(challenge|accounts\/login|accounts\/suspended)/.test(location.pathname);
  if (blocked()) return { error: "Instagram pide sesión o una comprobación: parar" };

  if (!CUENTA) return { error: "falta la cuenta: ejecutar antes en su perfil" };
  const postMatch = location.pathname.match(/\/(?:p|reel)\/([^/]+)/);

  if (!postMatch) {
    await sleep(1500);
    const tab = /\/reels\/?$/.test(location.pathname) ? "reels" : "posts";
    const posts = new Map();
    const grab = () => {
      for (const a of document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')) {
        const m = new URL(a.href).pathname.match(/\/(p|reel)\/([^/]+)/);
        if (!m || posts.has(m[2])) continue;
        const labels = [...a.querySelectorAll("svg[aria-label]")].map((s) => s.getAttribute("aria-label"));
        posts.set(m[2], { code: m[2], date: dateOf(m[2]), reel: tab === "reels" || m[1] === "reel" || labels.includes("Clip") });
      }
    };
    // Las fijadas van arriba y pueden ser antiguas; lo que manda es la cola de la rejilla.
    const pastSince = () => { const all = [...posts.values()]; return all.length >= 6 && all.slice(-6).every((p) => p.date < SINCE); };
    // Paso a paso, sin saltar al fondo: el pie de página es largo y la rejilla carga al acercarse su
    // borde. Saltando al fondo se atascó el 2026-11-04 en Ochoa, en 120 y en 132 publicaciones, y
    // así llegó hasta el corte de fecha en menos de un minuto.
    for (let last = -1, same = 0; same < 60 && !pastSince(); ) {
      grab();
      window.scrollBy({ top: rand([500, 800]), behavior: "instant" });
      await sleep(rand([900, 1800]));
      if (innerHeight + scrollY >= document.body.scrollHeight - 1500) { window.scrollBy({ top: -900, behavior: "instant" }); await sleep(1200); }
      grab();
      if (posts.size === last) same++; else { same = 0; last = posts.size; }
    }
    const all = [...posts.values()];
    send("/lista", { account: CUENTA, tab, since: SINCE, posts: all });
    return { tab, total: all.length, desde: all.filter((p) => p.date >= SINCE).length, reels: all.filter((p) => p.reel).length, masAntigua: all.map((p) => p.date).sort()[0] };
  }

  const code = postMatch[1];
  const search = (o, d = 0) => {
    if (!o || typeof o !== "object" || d > 80) return null;
    if (o.code === code && (o.image_versions2 || o.carousel_media)) return o;
    for (const v of Object.values(o)) { const r = search(v, d + 1); if (r) return r; }
    return null;
  };
  const findItem = () => {
    for (const s of document.querySelectorAll('script[type="application/json"]')) {
      const t = s.textContent;
      if (!t.includes(code) || !t.includes("image_versions2")) continue;
      try { const r = search(JSON.parse(t)); if (r) return r; } catch (e) { /* otro bloque */ }
    }
    return null;
  };
  let item = null;
  for (let i = 0; i < 30 && !item; i++) { item = findItem(); if (!item) await sleep(500); }
  if (!item) {
    if (blocked()) return { error: "Instagram pide sesión o una comprobación: parar" };
    // Publicación borrada, o la página no trae los datos: se apunta y se sigue; se reintenta al final.
    const error = "la página no trae los datos de la publicación";
    send("/save", { kind: "post", v: 2, account: CUENTA, code, url: `https://www.instagram.com/p/${code}/`, date: dateOf(code), error, media: [] });
    return { error, date: dateOf(code) };
  }

  const area = (c) => (c?.width || 0) * (c?.height || 0);
  const best = (arr) => (arr || []).reduce((a, b) => (area(b) > area(a) ? b : a), null);
  const pick = (c) => c && { url: c.url, width: c.width, height: c.height };
  const dash = (xml) => {
    if (!xml) return null;
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const reps = [...doc.getElementsByTagName("Representation")].map((r) => {
      const set = r.parentNode;
      const mime = r.getAttribute("mimeType") || set.getAttribute("mimeType") || set.getAttribute("contentType") || "";
      return {
        kind: mime.includes("audio") ? "audio" : "video",
        url: r.getElementsByTagName("BaseURL")[0]?.textContent.trim(),
        width: +r.getAttribute("width") || 0,
        height: +r.getAttribute("height") || 0,
        bandwidth: +r.getAttribute("bandwidth") || 0,
        codecs: r.getAttribute("codecs") || set.getAttribute("codecs") || "",
      };
    }).filter((r) => r.url);
    const top = (list) => list.sort((a, b) => area(b) - area(a) || b.bandwidth - a.bandwidth)[0] || null;
    const video = top(reps.filter((r) => r.kind === "video"));
    // Si la mejor no es H.264, también la mejor H.264: se reproduce en todas partes (QuickTime, Fotos).
    const h264 = video && !video.codecs.startsWith("avc1") ? top(reps.filter((r) => r.kind === "video" && r.codecs.startsWith("avc1"))) : null;
    return {
      video, h264,
      audio: top(reps.filter((r) => r.kind === "audio")),
      // Lo que había, sin direcciones, para saber después qué se eligió.
      reps: reps.map(({ kind, width, height, bandwidth, codecs }) => ({ kind, width, height, bandwidth, codecs })),
    };
  };
  const music = (it) => {
    const mi = it.clips_metadata?.music_info?.music_asset_info;
    if (mi) return [mi.display_artist, mi.title].filter(Boolean).join(" · ");
    const os = it.clips_metadata?.original_sound_info;
    return os ? `audio original: ${os.original_audio_title || ""}`.trim() : "";
  };
  const slides = item.carousel_media?.length ? item.carousel_media : [item];
  const media = slides.map((m, i) => {
    const isVideo = m.media_type === 2 || (m.video_versions?.length || 0) > 0;
    return {
      n: i + 1,
      type: isVideo ? "video" : "image",
      image: pick(best(m.image_versions2?.candidates)),
      alt: m.accessibility_caption || "",
      tags: (m.usertags?.in || []).map((t) => t.user?.username).filter(Boolean),
      video: isVideo ? { progressive: pick(best(m.video_versions)), dash: dash(m.video_dash_manifest), duration: m.video_duration ?? null, audio: m.has_audio ?? null } : null,
    };
  });
  const data = {
    kind: "post", v: 2, account: CUENTA, code,
    url: `https://www.instagram.com/p/${code}/`,
    owner: item.user?.username || item.owner?.username || "",
    coauthors: (item.coauthor_producers || []).map((u) => u.username).filter(Boolean),
    date: item.taken_at ? new Date(item.taken_at * 1000).toISOString() : dateOf(code),
    product: item.product_type || "",
    caption: item.caption?.text || "",
    edited: !!item.caption_is_edited,
    location: item.location?.name || "",
    likes: item.like_count ?? null,
    comments: item.comment_count ?? null,
    plays: item.play_count ?? item.ig_play_count ?? item.view_count ?? null,
    music: music(item),
    paid: !!item.is_paid_partnership,
    media,
  };
  await sleep(rand(DWELL));
  send("/save", data);
  return {
    date: data.date.slice(0, 10), product: data.product,
    fotos: media.filter((m) => m.type === "image").length,
    videos: media.filter((m) => m.type === "video").length,
    dash1080: media.filter((m) => (m.video?.dash?.video?.height || 0) >= 1080 || (m.video?.dash?.video?.width || 0) >= 1080).length,
    sinImagen: media.filter((m) => !m.image).length,
  };
})();
