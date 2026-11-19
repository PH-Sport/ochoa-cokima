// La imagen que sale al compartir el enlace de Cokima (WhatsApp y demás): apps/cokima/public/images/compartir.jpg.
// Desde el 2026-11-19 lleva el logo en lugar del nombre escrito; la receta y el porqué de cada número, en
// docs/fotografia.md («En Cokima, desde el 2026-11-03, la imagen al compartir»). La de antes se pintó desde un HTML
// que no se guardó; esta se guarda para que la próxima salga igual, chispas incluidas (van con semilla).
//
// CÓMO SE USA, desde la raíz del repo:
//   1. pnpm --filter cokima build
//   2. Los tres fotogramas, de los vídeos de la portada ya oscurecidos (scripts/video-entrada.sh). Cada columna
//      del ordenador va adelantada (DESFASE_2 = 1 s, DESFASE_3 = 2 s), así que el segundo del archivo no es el
//      del plano: el ceviche en su 1,6 es el 0,6 de la columna 2; en la 3, el enoki en su 0,8 es el 7,8 y la
//      tarta en su 1,6, el 2,6. Si cambia el reparto de columnas, cambian estos segundos.
//        D=apps/cokima/.vercel/output/static/__compartir; mkdir -p $D; V=apps/cokima/src/assets/video
//        ffmpeg -ss 0.6 -i $V/entrada-col-2.mp4 -frames:v 1 -q:v 1 $D/ceviche.jpg
//        ffmpeg -ss 7.8 -i $V/entrada-col-3.mp4 -frames:v 1 -q:v 1 $D/enoki.jpg
//        ffmpeg -ss 2.6 -i $V/entrada-col-3.mp4 -frames:v 1 -q:v 1 $D/tarta.jpg
//   3. Servir el build (el `cokima-build` de .claude/launch.json, en el puerto 4331), abrir cualquier página,
//      pegar esto en la consola y guardar el archivo que descarga en apps/cokima/public/images/compartir.jpg.
//      __compartir/ es del build: el siguiente build lo borra.
(async () => {
  const W = 1200, H = 630, GROUND = [14, 9, 7];
  const carga = (src) => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => mal(src); i.src = src; });
  const fuente = new FontFace("BricolageShare", "url(/fonts/bricolage-400.woff2)", { weight: "200 800" });
  document.fonts.add(await fuente.load());
  const [ceviche, enoki, tarta, logo] = await Promise.all(
    ["/__compartir/ceviche.jpg", "/__compartir/enoki.jpg", "/__compartir/tarta.jpg", "/images/cokima-logo.png"].map(carga));
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d");
  const rg = (a) => `rgba(${GROUND},${a})`;

  // Tres columnas de 400, escaladas a 400 de ancho y recortadas al centro, con 3 px de --ground entre ellas.
  [ceviche, enoki, tarta].forEach((im, n) => { const h = im.height * 400 / im.width; c.drawImage(im, n * 400, (H - h) / 2, 400, h); });
  c.fillStyle = `rgb(${GROUND})`; c.fillRect(398.5, 0, 3, H); c.fillRect(798.5, 0, 3, H);

  // El velo de la portada, de arriba abajo, y un óvalo detrás del logo para que se lea en pequeño.
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, rg(0.42)); g.addColorStop(0.5, rg(0.5)); g.addColorStop(0.85, rg(0.8)); g.addColorStop(1, rg(0.92));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.translate(600, 300); c.scale(1, 0.42);
  const ov = c.createRadialGradient(0, 0, 0, 0, 0, 420);
  ov.addColorStop(0, rg(0.5)); ov.addColorStop(0.6, rg(0.32)); ov.addColorStop(1, rg(0));
  c.fillStyle = ov; c.fillRect(-600, -760, 1200, 1520); c.restore();

  // Las chispas del fondo de brasa.js, quietas: el mismo vuelo y el mismo trazo, con un azar fijo (mulberry32,
  // semilla 7) en lugar de Math.random, 150 pasos de 1/30 s y 132 chispas (2,1 veces la densidad de la web).
  // El trazo, un 60 % más largo y un 20 % más grueso: en una imagen quieta es lo que dice que vuelan.
  let s = 7;
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const azar = (a, b) => a + rnd() * (b - a);
  const TONOS = [[110, 22, 8], [214, 62, 18], [255, 140, 45], [255, 214, 140]];
  const tono = (k) => { const x = Math.min(0.999, Math.max(0, k)) * 3, i = Math.floor(x), f = x - i, a = TONOS[i], b = TONOS[i + 1]; return a.map((v, n) => Math.round(v + (b[n] - v) * f)).join(","); };
  const nueva = () => { const z = azar(0.45, 1), abajo = rnd() < 0.6; return { z, x: azar(0, W), y: abajo ? H + azar(4, 40) : azar(H * 0.2, H), vx: azar(-15, 15), vy: -azar(70, 170) * z, edad: 0, vida: azar(1.8, 4.6), entra: abajo ? 0.12 : 0.5, calor: azar(0.75, 1), grueso: rnd() < 0.12 ? azar(2, 2.6) : azar(1.1, 1.6), f1: azar(1.2, 2.6), f2: azar(3.2, 6.5), p1: azar(0, 6.3), p2: azar(0, 6.3), luz: azar(0, 100) }; };
  const mover = (q, dt, t) => { q.edad += dt; q.vx += (Math.sin(t * q.f1 + q.p1) + 0.6 * Math.sin(t * q.f2 + q.p2)) * 70 * q.z * dt; if (rnd() < 0.6 * dt) q.vx += azar(-70, 70) * q.z; q.vx *= Math.exp(-1.2 * dt); q.vy = (q.vy - 25 * q.z * dt) * Math.exp(-0.45 * dt); q.x += q.vx * dt; q.y += q.vy * dt; };
  const suaveF = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
  const chispas = []; for (let i = 0; i < 132; i++) chispas.push(nueva());
  for (let n = 0; n < 150; n++) chispas.forEach((q, i) => { mover(q, 1 / 30, n / 30); if (q.edad > q.vida || q.y < -30 || q.x < -40 || q.x > W + 40) chispas[i] = nueva(); });
  const cs = document.createElement("canvas"); cs.width = W; cs.height = H; const x = cs.getContext("2d");
  x.globalCompositeOperation = "lighter"; x.lineCap = "round";
  const t = 150 / 30, largo = 0.05 * 1.6;
  for (const q of chispas) {
    const vida = q.edad / q.vida, k = q.calor * Math.pow(1 - vida, 0.6);
    const parpadeo = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 13 + q.luz)) * (0.5 + 0.5 * Math.sin(t * 29 + q.luz * 1.7));
    const alfa = suaveF(q.edad / q.entra) * (1 - suaveF((vida - 0.7) / 0.3)) * suaveF(q.y / (H * 0.2)) * parpadeo * (0.5 + 0.5 * k) * (0.6 + 0.4 * q.z);
    if (alfa < 0.01) continue;
    x.strokeStyle = `rgba(${tono(k)},${Math.min(1, alfa).toFixed(3)})`; x.lineWidth = q.grueso * q.z * 1.2;
    x.beginPath(); x.moveTo(q.x - q.vx * largo, q.y - q.vy * largo); x.lineTo(q.x, q.y); x.stroke();
    if (k > 0.45) {
      x.strokeStyle = `rgba(${tono(Math.min(1, k + 0.3))},${Math.min(1, alfa * (k - 0.45) * 1.8).toFixed(3)})`;
      x.beginPath(); x.moveTo(q.x - q.vx * largo * 0.35, q.y - q.vy * largo * 0.35); x.lineTo(q.x, q.y); x.stroke();
    }
  }
  c.drawImage(cs, 0, 0);

  // El logo, a 560 de ancho: cabe con margen en el cuadrado del centro (de 285 a 915), que es lo que se ve si un
  // chat la recorta. Va a la altura a la que iba el nombre escrito.
  const LW = 560, LH = Math.round(logo.height * LW / logo.width), LX = (W - LW) / 2, LY = 234;
  c.drawImage(logo, LX, LY, LW, LH);
  // El calor: el degradado de la imagen anterior (de abajo arriba, a 0,85), solo en las letras. La «x» se queda
  // en su rojo: el logo solo tiene dos colores, y la máscara quita los píxeles rojos (los de verde < 120).
  const m = document.createElement("canvas"); m.width = logo.width; m.height = logo.height; const mx = m.getContext("2d");
  mx.drawImage(logo, 0, 0);
  const d = mx.getImageData(0, 0, m.width, m.height);
  for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3] && d.data[i + 1] < 120) d.data[i + 3] = 0;
  mx.putImageData(d, 0, 0);
  const cal = document.createElement("canvas"); cal.width = LW; cal.height = LH; const cc = cal.getContext("2d");
  const gc = cc.createLinearGradient(0, LH, 0, 0);
  gc.addColorStop(0, "#ffd890"); gc.addColorStop(0.45, "#ffa94e"); gc.addColorStop(1, "#ff7f2a");
  cc.fillStyle = gc; cc.fillRect(0, 0, LW, LH); cc.globalCompositeOperation = "destination-in"; cc.drawImage(m, 0, 0, LW, LH);
  c.globalAlpha = 0.85; c.drawImage(cal, LX, LY); c.globalAlpha = 1;

  // «Kitchen Madness»: Bricolage 500 a 23 px, mayúsculas, 0,32 em, --bone-2. Se centra sin el espacio que deja
  // la última letra, como en la portada.
  c.font = "500 23px BricolageShare"; c.letterSpacing = 0.32 * 23 + "px"; c.fillStyle = "rgba(243,234,221,0.72)";
  const sub = "KITCHEN MADNESS", sw = c.measureText(sub).width - 0.32 * 23;
  c.fillText(sub, (W - sw) / 2, 416);

  // JPEG de calidad 86, como la anterior.
  const a = document.createElement("a"); a.href = cv.toDataURL("image/jpeg", 0.86); a.download = "compartir.jpg"; a.click();
})();
