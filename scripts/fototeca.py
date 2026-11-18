#!/usr/bin/env python3
"""La fototeca, v2: descarga las fotos Y LOS VÍDEOS recogidos de Instagram y lleva su catálogo.

Versión 2, del 2026-10-30 (Cokima). Lo de la v1 sigue igual —qué es la fototeca, por qué va fuera
de git, cómo se nombran las fotos—; lo que cambia:

- VÍDEOS. Mario pidió también los vídeos, a la mayor calidad. Instagram los enseña a 720p, pero la
  página trae la versión DASH, hasta 1080p, con la imagen y el sonido en pistas separadas. Se bajan
  las dos y ffmpeg las junta sin recomprimir (-c copy). Si la progresiva es más grande (pasa en
  los vídeos de 2025 y antes: DASH a 360, progresiva a 1080), la progresiva. Manda el tamaño.
  Las portadas de los vídeos se bajan también, como <código>-<n>-portada.<ext>. Y si la mejor
  versión no es H.264 (a 1080 suele ser VP9, que el Mac no abre), una copia que sí lo sea, como
  <código>-<n>-compatible.mp4 (de dónde sale, en «compatible_origen»). Medido el 2026-10-30: el
  sonido es el mismo en la DASH y en la progresiva (HE-AAC a ~63 kb/s).
- FORMATO REAL. Se mira el principio del fichero, no la dirección: si Instagram manda WebP, se
  guarda como .webp en vez de convertirlo (convertir es recomprimir; con Ochoa llegaron tres WebP
  con nombre .jpg).
- PUBLICACIONES Y TEXTOS. Además del catálogo (una entrada por foto o vídeo), cada cuenta tiene
  publicaciones.json (todo lo de cada publicación: texto, fecha exacta, lugar, etiquetas, música,
  me gusta…) y textos.txt (los textos tal cual, con su fecha y su código, para leerlos).
- DIAPOSITIVAS NUMERADAS POR SU SITIO EN EL CARRUSEL, vídeos incluidos. La v1 numeraba solo las
  fotos, así que en un carrusel con vídeo el número de una foto puede cambiar: si una entrada ya
  existente no casa (era foto y ahora es vídeo, o cambian las medidas), no se toca y se avisa.

- SOLO VÍDEOS (2026-11-04, Ochoa). Con --solo-videos no se baja ni se toca ninguna foto: las fotos
  de Ochoa se recogieron con la v1, numeradas sin contar los vídeos, y sus fichas ya están revisadas.
  Las fotos sí constan en publicaciones.json, sin fichero, para saber cómo era la publicación.

  FOTOTECA=<carpeta> python3 scripts/fototeca.py [--solo-videos] <recogida.jsonl> [...]
  FOTOTECA=<carpeta> python3 scripts/fototeca.py --nombrar     # carpeta: fototeca/ por defecto
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(os.environ["FOTOTECA"]) if "FOTOTECA" in os.environ else Path(__file__).resolve().parent.parent / "fototeca"
CATALOG = ROOT / "catalogo.json"
FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"

# Campos que rellena una persona (o el agente) al revisar; el script no los toca nunca.
REVIEW_FIELDS = {"kind": None, "label": None, "dish": None, "slot": None, "status": "sin revisar", "note": ""}


def iso_date(text):
    """«October 15, 2026» o «2026-10-15T17:10:07.000Z» → «2026-10-15»; vacío si no se reconoce."""
    if len(text) >= 10 and text[4] == "-" and text[7] == "-":
        return text[:10]
    try:
        return datetime.strptime(text, "%B %d, %Y").date().isoformat()
    except ValueError:
        return ""


def read_posts(path):
    """Un .json (objeto o lista) o un .jsonl con una publicación por línea."""
    text = Path(path).read_text(encoding="utf-8")
    if path.endswith(".jsonl"):
        # Solo «\n»: splitlines() también parte por U+2028, que aparece en algún texto de Instagram.
        return [json.loads(line) for line in text.split("\n") if line.strip()]
    data = json.loads(text)
    return data if isinstance(data, list) else [data]


def media_of(post):
    """Las diapositivas de la publicación; las recogidas v1 solo traen «images»."""
    if "media" in post:
        return post["media"]
    return [{"n": n, "type": "image", "image": img} for n, img in enumerate(post.get("images", []), start=1)]


def download(url, dest, tries=3):
    for attempt in range(1, tries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as res:
                dest.write_bytes(res.read())
            time.sleep(0.3)  # sin prisa, también con el CDN
            return
        except Exception:  # noqa: BLE001
            if attempt == tries:
                raise
            time.sleep(2 * attempt)


def real_ext(path):
    head = path.read_bytes()[:16]
    if head[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return ".webp"
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if head[4:8] == b"ftyp":
        return ".heic" if head[8:12] in (b"heic", b"heix", b"mif1") else ".mp4"
    return ".bin"


def fetch_image(url, stem):
    """Baja la imagen a <stem>.<extensión real> y devuelve la ruta."""
    tmp = stem.with_name(stem.name + ".part")
    download(url, tmp)
    dest = stem.with_name(stem.name + real_ext(tmp))
    tmp.rename(dest)
    return dest


def probe(path):
    out = subprocess.run([FFPROBE, "-v", "error", "-show_entries",
                          "stream=codec_type,codec_name,width,height,bit_rate,sample_rate:format=duration,bit_rate",
                          "-of", "json", str(path)], capture_output=True, text=True, check=True)
    info = json.loads(out.stdout)
    video = next((s for s in info.get("streams", []) if s["codec_type"] == "video"), {})
    audio = next((s for s in info.get("streams", []) if s["codec_type"] == "audio"), {})
    return {
        "width": video.get("width"), "height": video.get("height"), "codec": video.get("codec_name"),
        "audio": audio.get("codec_name"), "duration": round(float(info.get("format", {}).get("duration", 0) or 0), 2),
        "kbps": round(int(info.get("format", {}).get("bit_rate", 0) or 0) / 1000),
    }


def mux(video, audio, dest):
    """Junta imagen y sonido sin recomprimir."""
    cmd = [FFMPEG, "-v", "error", "-y", "-i", str(video)]
    if audio:
        cmd += ["-i", str(audio), "-map", "0:v:0", "-map", "1:a:0"]
    else:
        cmd += ["-map", "0:v:0"]
    cmd += ["-c", "copy", "-movflags", "+faststart", str(dest)]
    subprocess.run(cmd, check=True, capture_output=True)


def area(rep):
    return (rep or {}).get("width", 0) * (rep or {}).get("height", 0)


def fetch_video(video, dest):
    """La mejor versión del vídeo en dest (.mp4). Devuelve de dónde salió."""
    dash = video.get("dash") or {}
    best, h264, audio = dash.get("video"), dash.get("h264"), dash.get("audio")
    # A igual tamaño, H.264 antes que VP9: se ve igual y se reproduce en todas partes.
    if best and h264 and area(h264) >= area(best):
        best = h264
    prog = video.get("progressive")
    # La DASH no siempre es la mejor. Medido el 2026-10-30 en Cokima: en los vídeos de 2026 la DASH
    # llega a 1080 y la progresiva a 720; en los de 2025 y antes es al revés, la DASH solo trae
    # 360 y la progresiva 1080. La primera versión de este script se quedó con la DASH siempre y
    # bajó 27 vídeos a 360. Manda el tamaño.
    if prog and prog.get("url") and area(prog) > area(best):
        best = None
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        if best and best.get("url"):
            download(best["url"], tmp / "v.mp4")
            if audio and audio.get("url"):
                download(audio["url"], tmp / "a.mp4")
            mux(tmp / "v.mp4", tmp / "a.mp4" if audio and audio.get("url") else None, tmp / "out.mp4")
            shutil.move(str(tmp / "out.mp4"), str(dest))
            return f"dash {best['width']}x{best['height']} {best['codecs'].split('.')[0]}"
        if prog and prog.get("url"):
            download(prog["url"], dest)
            return f"progresiva {prog['width']}x{prog['height']}"
    return None


def make_compatible(video, master, dest, source):
    """Copia H.264 de un vídeo VP9. Si la progresiva de Instagram es H.264 (en los de 2026 lo es, a
    720), esa, sin recomprimir; si no (en los de 2025 la progresiva de 1080 también es VP9), se
    convierte aquí la principal a H.264 con calidad alta."""
    prog = video.get("progressive") or {}
    if prog.get("url") and not (source or "").startswith("progresiva"):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "p.mp4"
            download(prog["url"], candidate)
            if probe(candidate)["codec"] == "h264":
                shutil.move(str(candidate), str(dest))
                return "progresiva de Instagram, sin recomprimir"
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(master), "-c:v", "libx264", "-preset", "slow", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", str(dest)], check=True, capture_output=True)
    return "convertida aquí de la principal: H.264, CRF 18"


def existing(stem):
    """El fichero de este stem, con la extensión que tenga, si ya se bajó."""
    for ext in (".jpg", ".webp", ".png", ".heic", ".mp4"):
        if stem.with_name(stem.name + ext).exists():
            return stem.with_name(stem.name + ext)
    return None


def rel(path):
    return str(Path(path).relative_to(ROOT))


def main(paths, only_videos=False):
    catalog = json.loads(CATALOG.read_text()) if CATALOG.exists() else {}
    new, conflicts, failed = 0, [], []
    posts_by_account = {}
    for path in paths:
        for post in read_posts(path):
            if post.get("kind") != "post" or post.get("error"):
                continue
            account, code = post["account"], post["code"]
            folder = ROOT / "instagram" / account
            folder.mkdir(parents=True, exist_ok=True)
            summary = []
            for m in media_of(post):
                n, is_video = m["n"], m["type"] == "video"
                if only_videos and not is_video:
                    img = m.get("image") or {}
                    summary.append({"n": n, "type": m["type"], "file": None, "width": img.get("width"),
                                    "height": img.get("height"), "duration": None, "alt": m.get("alt", ""),
                                    "tags": m.get("tags", [])})
                    continue
                key = f"{account}/{code}-{n}"
                entry = catalog.get(key, {})
                img = m.get("image") or {}
                if entry.get("file"):
                    was_video = entry["file"].endswith(".mp4")
                    same_size = is_video or (entry.get("width"), entry.get("height")) == (img.get("width"), img.get("height"))
                    if was_video != is_video or not same_size:
                        conflicts.append(f"{key}: el catálogo tiene {entry['file']} ({entry.get('width')}x{entry.get('height')}), "
                                         f"y ahora es {'vídeo' if is_video else 'foto'} {img.get('width')}x{img.get('height')}")
                        continue
                stem = folder / f"{code}-{n}"
                try:
                    if is_video:
                        dest = ROOT / entry["file"] if entry.get("file") else stem.with_name(stem.name + ".mp4")
                        source = entry.get("source")
                        if not dest.exists():
                            source = fetch_video(m["video"], dest)
                            new += 1
                        cover_stem = stem.with_name(stem.name + "-portada")
                        cover = ROOT / entry["cover"] if entry.get("cover") else existing(cover_stem)
                        if (cover is None or not cover.exists()) and img.get("url"):
                            cover = fetch_image(img["url"], cover_stem)
                        info = probe(dest)
                        entry.update({"file": rel(dest), "media": "video", "source": source, "width": info["width"],
                                      "height": info["height"], "codec": info["codec"], "audio": info["audio"],
                                      "duration": info["duration"], "kbps": info["kbps"]})
                        if cover is not None and cover.exists():
                            entry["cover"] = rel(cover)
                        # El Mac no abre VP9 (QuickLook se colgó con él el 2026-10-30; con H.264, al
                        # instante). Si la mejor no es H.264, se guarda también una copia que lo sea.
                        if info["codec"] != "h264":
                            compat = ROOT / entry["compatible"] if entry.get("compatible") else stem.with_name(stem.name + "-compatible.mp4")
                            if compat.exists() and probe(compat)["codec"] != "h264":
                                compat.unlink()  # una copia VP9 no es compatible: se rehace
                            if not compat.exists():
                                entry["compatible_origen"] = make_compatible(m["video"], dest, compat, source)
                            entry.setdefault("compatible_origen", "progresiva de Instagram, sin recomprimir")
                            entry["compatible"] = rel(compat)
                    else:
                        dest = ROOT / entry["file"] if entry.get("file") else existing(stem)
                        if dest is None or not dest.exists():
                            dest = fetch_image(img["url"], stem)
                            new += 1
                        entry.update({"file": rel(dest), "width": img.get("width"), "height": img.get("height")})
                except Exception as e:  # noqa: BLE001
                    failed.append(f"{key}: {e}")
                    continue
                entry.update({
                    "post": post["url"],
                    "date": iso_date(post.get("date", "")),
                    "caption": post.get("caption", ""),
                    "alt": m.get("alt", ""),
                    "tags": m.get("tags", []),
                })
                for field, default in REVIEW_FIELDS.items():
                    entry.setdefault(field, default)
                catalog[key] = entry
                summary.append({"n": n, "type": m["type"], "file": entry["file"], "width": entry.get("width"),
                                "height": entry.get("height"), "duration": entry.get("duration"), "alt": m.get("alt", ""),
                                "tags": m.get("tags", [])})
            if post.get("v") == 2:
                posts_by_account.setdefault(account, {})[code] = {
                    "date": post.get("date", ""), "url": post["url"], "product": post.get("product", ""),
                    "owner": post.get("owner", ""), "coauthors": post.get("coauthors", []),
                    "caption": post.get("caption", ""), "edited": post.get("edited", False),
                    "location": post.get("location", ""), "likes": post.get("likes"), "comments": post.get("comments"),
                    "plays": post.get("plays"), "music": post.get("music", ""), "paid": post.get("paid", False),
                    "media": summary,
                }
    save(catalog)
    for account, posts in posts_by_account.items():
        write_posts(ROOT / "instagram" / account, posts)
    print(f"{new} ficheros nuevos · {len(catalog)} en el catálogo")
    for line in conflicts:
        print("NO CASA", line)
    for line in failed:
        print("FALLÓ", line)


def write_posts(folder, posts):
    """publicaciones.json (se mezcla con lo que hubiera) y textos.txt, que se rehace entero."""
    index_path = folder / "publicaciones.json"
    index = json.loads(index_path.read_text()) if index_path.exists() else {}
    index.update(posts)
    index = dict(sorted(index.items(), key=lambda kv: kv[1]["date"], reverse=True))
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    blocks = []
    for code, p in index.items():
        kinds = [m["type"] for m in p["media"]]
        fotos, videos = kinds.count("image"), kinds.count("video")
        what = ("reel" if p["product"] == "clips" else "carrusel" if len(kinds) > 1 else "vídeo" if videos else "foto")
        if len(kinds) > 1:
            what += f": {fotos} foto{'s' * (fotos != 1)}, {videos} vídeo{'s' * (videos != 1)}"
        head = f"{p['date'][:10]}  {code}  ({what})"
        extra = [x for x in (p["location"] and f"Lugar: {p['location']}", p["music"] and f"Música: {p['music']}") if x]
        blocks.append("\n".join([head, p["url"], *extra, "", p["caption"] or "(sin texto)"]))
    sep = "\n\n" + "=" * 72 + "\n\n"
    (folder / "textos.txt").write_text(
        f"Textos de las publicaciones de @{folder.name}, tal cual, de la más nueva a la más vieja.\n"
        f"{len(index)} publicaciones. Generado por fototeca.py; no editar a mano.\n" + sep + sep.join(blocks) + "\n")


def save(catalog):
    ordered = dict(sorted(catalog.items(), key=lambda kv: (kv[1]["date"], kv[0]), reverse=True))
    CATALOG.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n")


def rename():
    """Pone a cada foto o vídeo revisado el nombre <kind>_<label>__<código>-<n>.<ext> (y su portada)."""
    catalog = json.loads(CATALOG.read_text())
    moved = 0
    for key, entry in catalog.items():
        if not entry.get("kind") or not entry.get("label") or "/" not in key:
            continue
        stem = f"{entry['kind']}_{entry['label']}__{key.rsplit('/', 1)[1]}"
        for field, suffix in (("file", ""), ("cover", "-portada"), ("compatible", "-compatible")):
            if not entry.get(field):
                continue
            old = ROOT / entry[field]
            new = old.with_name(f"{stem}{suffix}{old.suffix}")
            if old != new and old.exists():
                old.rename(new)
                entry[field] = rel(new)
                moved += 1
    save(catalog)
    print(f"{moved} ficheros renombrados")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if sys.argv[1] == "--nombrar":
        rename()
    elif sys.argv[1] == "--solo-videos":
        main(sys.argv[2:], only_videos=True)
    else:
        main(sys.argv[1:])
