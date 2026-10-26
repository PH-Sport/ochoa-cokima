#!/usr/bin/env python3
"""Receptor local para recoger Instagram con sesión iniciada (docs/fotografia.md §La fototeca).

POR QUÉ EXISTE. Sin sesión, Instagram solo enseña las 12 últimas publicaciones;
con la sesión de Mario en Brave se ven todas, pero el 2026-10-26 se comprobó que
desde ahí no hay forma de sacar los datos: Brave bloquea en silencio las descargas
que lanza una página (incluso tras un clic simulado), la extensión del navegador
no deja pasar las direcciones firmadas de las fotos, y la página de Instagram no
puede pedir nada a localhost (su CSP lo impide). Lo que sí puede es NAVEGAR: el
fragmento de cada publicación se va a http://127.0.0.1:8765/save?d=<json> con los
datos en la dirección, y este receptor los apunta en recogida.jsonl.

  python3 scripts/fototeca-receptor.py <carpeta> [desde]   # desde: 2024-01-01 por defecto
  python3 scripts/fototeca.py <carpeta>/recogida.jsonl       # luego, la descarga

/lista?d=<json> guarda la lista del perfil ({"account", "posts": [{code, date, reel}]}).
/save?d=<json> guarda una publicación y devuelve el navegador AL INSTANTE a la
siguiente de la lista: si la pestaña se queda en esta página, la extensión no sabe
clasificar el sitio y bloquea cualquier acción hasta que alguien la cierre a mano.
Solo escucha en 127.0.0.1.
"""
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

OUT = Path(sys.argv[1])
SINCE = sys.argv[2] if len(sys.argv) > 2 else "2024-01-01"


def last_list():
    lines = (OUT / "lista.jsonl").read_text().split("\n")
    return json.loads([line for line in lines if line.strip()][-1])


def queue():
    """Publicaciones con foto desde SINCE, en el orden del perfil (de nueva a vieja)."""
    return [p["code"] for p in last_list()["posts"] if not p["reel"] and p["date"] >= SINCE]


def profile_url():
    try:
        return f"https://www.instagram.com/{last_list()['account']}/"
    except (OSError, KeyError, IndexError, ValueError):
        return "https://www.instagram.com/"


def next_url(code):
    q = queue()
    if code in q and q.index(code) + 1 < len(q):
        return f"https://www.instagram.com/p/{q[q.index(code) + 1]}/"
    return profile_url()


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        data = parse_qs(url.query).get("d", [""])[0]
        status, msg = 400, "sin datos"
        if url.path in ("/save", "/lista") and data:
            try:
                obj = json.loads(data)
                name = "recogida.jsonl" if url.path == "/save" else "lista.jsonl"
                with open(OUT / name, "a", encoding="utf-8") as f:
                    f.write(json.dumps(obj, ensure_ascii=False) + "\n")
                status = 200
                msg = f"ok {obj.get('code', '')} {len(obj.get('images', obj.get('posts', [])))}"
            except Exception as e:  # noqa: BLE001
                msg = f"error {e}"
        # Devuelve el navegador a Instagram al instante: la pestaña no se queda en esta página.
        dest = next_url(obj.get("code", "")) if status == 200 and url.path == "/save" else profile_url()
        body = (f"<!doctype html><meta charset=utf-8><meta http-equiv=refresh content=\"0;url={dest}\">"
                f"<title>{msg}</title><pre>{msg}</pre>").encode()
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


HTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
