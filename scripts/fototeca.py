#!/usr/bin/env python3
"""La fototeca: descarga las fotos recogidas de Instagram y lleva su catálogo.

POR QUÉ EXISTE ESTE SCRIPT. Las webs se quieren con las fotos recientes que el
equipo sube a Instagram, no con las de la web vieja (de 2021-2022). Instagram no
deja descargarlas, y sin acceso a las cuentas no hay exportación oficial ni API.
`scripts/fototeca-recoger.js` lee las fotos desde la propia página en un
navegador; este script hace lo demás: baja cada foto y apunta en el catálogo de
dónde sale, cuándo se publicó y qué decía el texto, que es lo que suele nombrar
el plato.

  python3 scripts/fototeca.py recogida.json [otra.json ...]

`recogida.json` es lo que devuelve `fototeca-recoger.js` en las publicaciones:
un objeto o una lista de objetos `{"kind": "post", ...}`.

TODO FUERA DE GIT, A PROPÓSITO:
  fototeca/instagram/<cuenta>/<código>-<n>.jpg   las fotos. Pesan, y se pueden
      volver a bajar abriendo la publicación (el catálogo guarda su enlace). Las
      URLs firmadas caducan en días, así que no sirven para eso.
  fototeca/catalogo.json   lo que se ha decidido de cada foto. Tampoco va al repo:
      el repo es público y el catálogo lleva notas internas (Mario, 2026-10-26).
      Vive solo en la máquina donde se hizo la recogida.

Volver a ejecutarlo no pisa nada: no baja lo que ya está y conserva lo que se
haya escrito a mano en el catálogo (tipo, etiqueta, plato, hueco, estado, nota).

NOMBRES QUE DICEN QUÉ ES. Mario pidió poder saber qué es cada foto por su nombre.
Al revisar se rellenan «kind» (plato, local, gente…) y «label» (lo que sale), y

  python3 scripts/fototeca.py --nombrar

renombra cada foto a <kind>_<label>__<código>-<n>.jpg: se agrupan por tipo al
ordenar la carpeta, y el código sigue ahí para volver a la publicación.
"""

import json
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "fototeca"
CATALOG = ROOT / "catalogo.json"

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
    text = Path(path).read_text()
    if path.endswith(".jsonl"):
        # Solo «\n»: splitlines() también parte por U+2028, que aparece en algún texto de Instagram.
        return [json.loads(line) for line in text.split("\n") if line.strip()]
    data = json.loads(text)
    return data if isinstance(data, list) else [data]


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as res:
        dest.write_bytes(res.read())


def main(paths):
    catalog = json.loads(CATALOG.read_text()) if CATALOG.exists() else {}
    new = 0
    for path in paths:
        for post in read_posts(path):
            if post.get("kind") != "post":
                continue
            folder = ROOT / "instagram" / post["account"]
            folder.mkdir(parents=True, exist_ok=True)
            for n, img in enumerate(post["images"], start=1):
                key = f"{post['account']}/{post['code']}-{n}"
                entry = catalog.get(key, {})
                # Si ya se renombró, el catálogo sabe dónde está: no se vuelve a bajar.
                dest = ROOT / entry["file"] if entry.get("file") else folder / f"{post['code']}-{n}.jpg"
                if not dest.exists():
                    download(img["url"], dest)
                    new += 1
                entry.update({
                    "file": str(dest.relative_to(ROOT)),
                    "post": post["url"],
                    "date": iso_date(post.get("date", "")),
                    "caption": post.get("caption", ""),
                    "width": img["width"],
                    "height": img["height"],
                })
                for field, default in REVIEW_FIELDS.items():
                    entry.setdefault(field, default)
                catalog[key] = entry
    save(catalog)
    print(f"{new} fotos nuevas · {len(catalog)} en el catálogo")


def save(catalog):
    ordered = dict(sorted(catalog.items(), key=lambda kv: (kv[1]["date"], kv[0]), reverse=True))
    CATALOG.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n")


def rename():
    """Pone a cada foto revisada el nombre <kind>_<label>__<código>-<n>.jpg."""
    catalog = json.loads(CATALOG.read_text())
    moved = 0
    for key, entry in catalog.items():
        if not entry.get("kind") or not entry.get("label") or "/" not in key:
            continue
        old = ROOT / entry["file"]
        new = old.with_name(f"{entry['kind']}_{entry['label']}__{key.rsplit('/', 1)[1]}{old.suffix}")
        if old != new and old.exists():
            old.rename(new)
            entry["file"] = str(new.relative_to(ROOT))
            moved += 1
    save(catalog)
    print(f"{moved} fotos renombradas")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if sys.argv[1] == "--nombrar":
        rename()
    else:
        main(sys.argv[1:])
