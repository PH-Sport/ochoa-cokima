#!/usr/bin/env python3
"""Receptor local para recoger Instagram con sesión iniciada, v2 (docs/fotografia.md §La fototeca).

El porqué del receptor no cambia desde la v1: con la sesión de Mario en Brave, la única salida
que funciona para los datos es que la página NAVEGUE a http://127.0.0.1:8765/save?d=<json>.

QUÉ CAMBIA RESPECTO A LA V1:
- La cola incluye los reels: Mario pidió también los vídeos (la v1 los saltaba).
- La cola junta TODAS las listas recibidas (la rejilla del perfil y la pestaña de reels), no
  solo la última.
- La siguiente publicación es la primera de la cola que aún no se ha intentado, no la que va
  detrás de la actual: si la recogida se corta, se retoma sola donde se quedó.
- Admite direcciones de hasta 4 MB: un carrusel con varios vídeos pasa de los 64 KB que acepta
  la biblioteca estándar.
- /estado devuelve cuánto queda (para consultarlo con curl, no desde el navegador).

  python3 scripts/fototeca-receptor.py <carpeta> [desde]   # desde: 2024-01-01 por defecto
Solo escucha en 127.0.0.1.
"""
import json
import socket
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

OUT = Path(sys.argv[1])
SINCE = sys.argv[2] if len(sys.argv) > 2 else "2024-01-01"
MAX_LINE = 4 * 1024 * 1024


def records(name):
    path = OUT / name
    if not path.exists():
        return []
    # Solo «\n»: algún texto de Instagram lleva U+2028, que splitlines() toma por salto de línea.
    return [json.loads(line) for line in path.read_text(encoding="utf-8").split("\n") if line.strip()]


def queue():
    """Publicaciones desde SINCE de todas las listas (rejilla y reels), de la más nueva a la más vieja."""
    posts = {}
    for lista in records("lista.jsonl"):
        for p in lista["posts"]:
            if p["date"] >= SINCE:
                posts.setdefault(p["code"], p)
    return [p["code"] for p in sorted(posts.values(), key=lambda p: p["date"], reverse=True)]


def tried():
    return {r.get("code") for r in records("recogida.jsonl")}


def profile_url():
    listas = records("lista.jsonl")
    account = listas[-1]["account"] if listas else ""
    return f"https://www.instagram.com/{account}/"


def next_code():
    done = tried()
    return next((code for code in queue() if code not in done), None)


def estado():
    q, done = queue(), tried()
    errores = [r["code"] for r in records("recogida.jsonl") if r.get("error")]
    return {"cola": len(q), "hechas": len([c for c in q if c in done]), "quedan": len([c for c in q if c not in done]),
            "siguiente": next_code(), "errores": errores}


class Handler(BaseHTTPRequestHandler):
    def handle_one_request(self):
        # Como el de la biblioteca estándar, pero con un límite de 4 MB para la línea de la petición.
        try:
            self.raw_requestline = self.rfile.readline(MAX_LINE + 1)
            if len(self.raw_requestline) > MAX_LINE:
                self.send_error(414)
                return
            if not self.raw_requestline:
                self.close_connection = True
                return
            if not self.parse_request():
                return
            method = getattr(self, "do_" + self.command, None)
            if method is None:
                self.send_error(501)
                return
            method()
            self.wfile.flush()
        except socket.timeout as e:
            self.log_error("Request timed out: %r", e)
            self.close_connection = True

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/estado":
            return self.reply(200, "application/json", json.dumps(estado(), ensure_ascii=False))
        data = parse_qs(url.query).get("d", [""])[0]
        status, msg, obj = 400, "sin datos", {}
        if url.path in ("/save", "/lista") and data:
            try:
                obj = json.loads(data)
                name = "recogida.jsonl" if url.path == "/save" else "lista.jsonl"
                with open(OUT / name, "a", encoding="utf-8") as f:
                    f.write(json.dumps(obj, ensure_ascii=False) + "\n")
                status = 200
                count = len(obj.get("media", obj.get("posts", [])))
                msg = f"ok {obj.get('code', obj.get('tab', ''))} {count}"
                with open(OUT / "progreso.log", "a", encoding="utf-8") as f:
                    f.write(f"{datetime.now():%Y-%m-%d %H:%M:%S} {url.path} {msg} {obj.get('error', '')}\n")
            except Exception as e:  # noqa: BLE001
                msg = f"error {e}"
        # Devuelve el navegador a Instagram AL INSTANTE: si la pestaña se queda en esta página, la
        # extensión no sabe clasificar el sitio y bloquea cualquier acción hasta cerrarla a mano.
        nxt = next_code() if status == 200 and url.path == "/save" else None
        dest = f"https://www.instagram.com/p/{nxt}/" if nxt else profile_url()
        body = (f"<!doctype html><meta charset=utf-8><meta http-equiv=refresh content=\"0;url={dest}\">"
                f"<title>{msg}</title><pre>{msg}</pre>")
        self.reply(status, "text/html; charset=utf-8", body)

    def reply(self, status, ctype, text):
        body = text.encode()
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


HTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
