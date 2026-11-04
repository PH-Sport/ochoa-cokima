#!/usr/bin/env python3
"""El barrio de «La mecha», en Visítanos de Cokima: de OpenStreetMap a los datos del dibujo.

POR QUÉ EXISTE ESTE SCRIPT. La mecha que eligió Mario el 2026-11-04 tiene que arder por las calles de
verdad, y los metros de los que sale tienen que ser los más cercanos de verdad: nada inventado. Estos datos
se dibujan en un lienzo (apps/cokima/src/mecha.js), así que aquí no hay colores ni tamaños de pantalla:
metros respecto al portal, y nada más.

  python3 scripts/mapa-barrio.py                # regenera los datos desde la descarga guardada
  python3 scripts/mapa-barrio.py --descargar    # vuelve a pedirlos a OSM y regenera

Lo que produce: apps/cokima/src/data/mapa-barrio.json, con
  c: las calles, [clase, [x, y, x, y…]]; la clase (1 a 3) es su anchura
  e: los edificios, [x, y, x, y…]
  r: los caminos, {n: el metro, len: sus metros, p: [x, y…]}, de la boca de metro al portal
  t: los nombres de calle, {t, x, y, a}; a es su ángulo

LOS METROS NO SE ELIGEN A OJO. De los seis que hay cerca se calcula el camino más corto por las calles que
se dibujan, desde cada boca, y se quedan los cuatro primeros. El 2026-11-04 fueron Argüelles (256 m), Moncloa
(375), Islas Filipinas (742) y Quevedo (917); se quedaron fuera San Bernardo (970) y Canal (1.427). Las bocas
se escribieron a mano desde OSM porque allí no llevan dicho de qué estación son. El camino solo pasa por las
calles dibujadas, no por las aceras que OSM traza aparte: si no, la mecha iría por al lado de la calle.

Los datos son © colaboradores de OpenStreetMap (ODbL); la escena lleva el crédito en la esquina, que es lo
que la licencia pide.
"""
import heapq, json, math, subprocess, sys, time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "scripts" / "mapa-barrio.osm.json"
SALIDA = RAIZ / "apps" / "cokima" / "src" / "data" / "mapa-barrio.json"

# El portal, tal y como está en OSM (Calle de Andrés Mellado, 21).
LAT0, LON0 = 40.43258, -3.71461

# Lo que se descarga y lo que se dibuja: lo que se ve en una pantalla de 2560×1440 (la escala, en mecha.js), sin
# lo que queda bajo el velo del título. Cada kilómetro cuadrado de más son unos 20 KB que baja también un móvil.
SUR, OESTE, NORTE, ESTE = 40.4255, -3.7270, 40.4400, -3.7016
MARCO_X, MARCO_Y = (-1050, 1100), (-760, 790)
CONSULTA = (
    f"[out:json][timeout:120];"
    f'way["highway"~"^(primary|primary_link|trunk|trunk_link|secondary|secondary_link|tertiary|tertiary_link|residential|living_street|pedestrian|unclassified)$"]({SUR},{OESTE},{NORTE},{ESTE});'
    "out tags geom;"
    f'way["building"]({SUR},{OESTE},{NORTE},{ESTE});'
    "out skel geom;"
)

# La anchura con que se dibuja cada clase de calle.
CLASES = {
    "primary": 3, "trunk": 3, "secondary": 3,
    "primary_link": 2, "trunk_link": 2, "secondary_link": 2, "tertiary": 2, "tertiary_link": 2,
    "residential": 1, "living_street": 1, "pedestrian": 1, "unclassified": 1,
}

# Las bocas de cada metro cercano (OSM, 2026-11-04).
METROS = {
    "Argüelles": [(40.43054, -3.71422), (40.43055, -3.71442), (40.43068, -3.71564), (40.43149, -3.71702)],
    "Moncloa": [(40.43472, -3.71897), (40.43366, -3.71778)],
    "Islas Filipinas": [(40.43899, -3.71505), (40.43898, -3.71435), (40.43894, -3.71311)],
    "Quevedo": [(40.43337, -3.70465), (40.43316, -3.70434)],
    "San Bernardo": [(40.42985, -3.70609), (40.42971, -3.70531)],
    "Canal": [(40.43833, -3.70434), (40.43853, -3.7044)],
}

# Los nombres que se escriben: cerca de qué punto y cuántos metros correrlo por su calle. A «Alberto Aguilera»
# se le corre para que no pise el rótulo del metro Argüelles, que está en la misma esquina.
NOMBRES = {
    "Calle de Andrés Mellado": ("Andrés Mellado", (8, 170), 0),
    "Calle de Alberto Aguilera": ("Alberto Aguilera", (-190, -205), -72),
    "Calle de la Princesa": ("Princesa", (-290, 20), 0),
    "Calle de Meléndez Valdés": ("Meléndez Valdés", (180, 200), 0),
    "Calle de Guzmán el Bueno": ("Guzmán el Bueno", (240, 120), 0),
}

# Los cobertizos y patinillos no dibujan barrio, y son muchos polígonos.
AREA_MINIMA = 120
# Lo que se puede torcer una línea al simplificarla, en metros: a esta escala, menos de un píxel y medio.
TOLERANCIA = 1.5


def metros(lat, lon):
    return ((lon - LON0) * math.cos(math.radians(LAT0)) * 111320, (lat - LAT0) * 110540)


def descargar():
    # Overpass devuelve 406 a un GET sin User-Agent y 502 o 504 a ratos: POST, cabecera y reintentos. Con curl,
    # porque el Python del Mac no llega a negociar el cifrado con ese servidor (2026-11-04); curl está en las dos máquinas.
    for _ in range(4):
        try:
            salida = subprocess.run(
                ["curl", "-sS", "-f", "-m", "150", "-A", "ochoa-cokima-mapa/1.0", "--data-urlencode", f"data={CONSULTA}", "https://overpass-api.de/api/interpreter"],
                check=True, capture_output=True,
            ).stdout
            crudo = json.loads(salida)
            for e in crudo["elements"]:
                e.pop("bounds", None)
                e.pop("nodes", None)
                e["geometry"] = [{"lat": round(p["lat"], 6), "lon": round(p["lon"], 6)} for p in e.get("geometry", [])]
            DATOS.write_text(json.dumps(crudo, ensure_ascii=False, separators=(",", ":")))
            print(f"descargado: {DATOS} ({DATOS.stat().st_size // 1024} KB)")
            return
        except Exception as e:  # noqa: BLE001 — se reintenta lo que sea
            print(f"Overpass falló ({e}); reintento en 8 s", file=sys.stderr)
            time.sleep(8)
    sys.exit("Overpass no respondió; se regenera con la descarga guardada")


if "--descargar" in sys.argv:
    descargar()

elementos = json.loads(DATOS.read_text())["elements"]
calles = [e for e in elementos if "highway" in e.get("tags", {}) and e["tags"].get("tunnel") != "yes" and not e["tags"].get("layer", "0").startswith("-")]
edificios = [e for e in elementos if "tags" not in e]


# ----- El grafo de las calles dibujadas
def nodo(p):
    return (round(p["lat"], 6), round(p["lon"], 6))


G = {}
for w in calles:
    g = w["geometry"]
    for a, b in zip(g, g[1:]):
        A, B = nodo(a), nodo(b)
        c = math.dist(metros(*A), metros(*B))
        G.setdefault(A, []).append((B, c))
        G.setdefault(B, []).append((A, c))

# El portal: se proyecta sobre el tramo de Andrés Mellado que le queda delante, que es un nodo más del grafo.
mejor = None
for w in calles:
    if w["tags"].get("name") != "Calle de Andrés Mellado":
        continue
    g = w["geometry"]
    for a, b in zip(g, g[1:]):
        (xa, ya), (xb, yb) = metros(*nodo(a)), metros(*nodo(b))
        L2 = (xb - xa) ** 2 + (yb - ya) ** 2
        if not L2:
            continue
        t = max(0, min(1, (-xa * (xb - xa) - ya * (yb - ya)) / L2))
        px, py = xa + t * (xb - xa), ya + t * (yb - ya)
        d = math.hypot(px, py)
        if mejor is None or d < mejor[0]:
            mejor = (d, nodo(a), nodo(b), px, py)
_, A, B, PX, PY = mejor
PORTAL = ("portal", 0)


def pos(n):
    return (PX, PY) if n == PORTAL else metros(*n)


G[PORTAL] = [(A, math.dist((PX, PY), pos(A))), (B, math.dist((PX, PY), pos(B)))]
G[A].append((PORTAL, G[PORTAL][0][1]))
G[B].append((PORTAL, G[PORTAL][1][1]))


def cercano(lat, lon):
    x = metros(lat, lon)
    return min((n for n in G if n != PORTAL), key=lambda n: math.dist(pos(n), x))


def camino(origen):
    dist, previo, cola, i = {origen: 0}, {}, [(0, 0, origen)], 0
    while cola:
        c, _, u = heapq.heappop(cola)
        if u == PORTAL:
            break
        if c > dist[u]:
            continue
        for v, w in G[u]:
            n = c + w
            if n < dist.get(v, 1e18):
                dist[v], previo[v] = n, u
                i += 1
                heapq.heappush(cola, (n, i, v))
    r = [PORTAL]
    while r[-1] != origen:
        r.append(previo[r[-1]])
    return dist[PORTAL], r[::-1]


candidatos = []
for nombre, bocas in METROS.items():
    c, r, boca = min(((*camino(cercano(*b)), b) for b in bocas), key=lambda x: x[0])
    candidatos.append((c, nombre, r, boca))
candidatos.sort(key=lambda x: x[0])
for c, nombre, _, _ in candidatos:
    print(f"{nombre}: {c:.0f} m por las calles")

rutas = []
for _, nombre, r, boca in candidatos[:4]:
    pts = [metros(*boca)] + [pos(n) for n in r] + [(0.0, 0.0)]
    limpio = [pts[0]]
    for p in pts[1:]:
        if math.dist(p, limpio[-1]) > 1.5:
            limpio.append(p)
    largo = sum(math.dist(a, b) for a, b in zip(limpio, limpio[1:]))
    rutas.append({"n": nombre, "len": round(largo), "p": [round(v, 1) for q in limpio for v in q]})
    print(f"camino de {nombre}: {largo:.0f} m, {len(limpio)} puntos")


# ----- Lo que se dibuja
def area(p):
    return abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(p, p[1:] + p[:1]))) / 2


def dentro(p):
    return MARCO_X[0] <= p[0] <= MARCO_X[1] and MARCO_Y[0] <= p[1] <= MARCO_Y[1]


def simplifica(p):
    """Douglas-Peucker: quita los puntos que no cambian la forma."""
    if len(p) < 3:
        return p
    (xa, ya), (xb, yb) = p[0], p[-1]
    L = math.hypot(xb - xa, yb - ya) or 1
    d = [abs((xb - xa) * (ya - y) - (xa - x) * (yb - ya)) / L for x, y in p[1:-1]]
    i = max(range(len(d)), key=d.__getitem__)
    if d[i] <= TOLERANCIA:
        return [p[0], p[-1]]
    return simplifica(p[: i + 2])[:-1] + simplifica(p[i + 1 :])


c_sal = []
for w in calles:
    pts = [metros(p["lat"], p["lon"]) for p in w["geometry"]]
    i_dentro = [i for i, p in enumerate(pts) if dentro(p)]
    if not i_dentro:
        continue
    # Con un punto más a cada lado: la calle sale del marco, no se corta en su último cruce.
    pts = simplifica(pts[max(0, i_dentro[0] - 1) : i_dentro[-1] + 2])
    c_sal.append([CLASES[w["tags"]["highway"]], [round(v) for q in pts for v in q]])

e_sal = []
for b in edificios:
    pts = [metros(p["lat"], p["lon"]) for p in b.get("geometry", [])]
    if len(pts) < 3 or area(pts) < AREA_MINIMA or not any(dentro(p) for p in pts):
        continue
    # Un anillo empieza y acaba en el mismo punto: se parte por el más lejano para poder simplificarlo.
    lejos = max(range(len(pts)), key=lambda i: math.dist(pts[0], pts[i]))
    q = simplifica(pts[: lejos + 1])[:-1] + simplifica(pts[lejos:])
    if len(q) >= 3:
        e_sal.append([round(v) for r in q for v in r])

t_sal = []
for nombre, (texto, (ax, ay), corre) in NOMBRES.items():
    mejor = None
    for w in calles:
        if w["tags"].get("name") != nombre:
            continue
        g = [metros(p["lat"], p["lon"]) for p in w["geometry"]]
        for a, b in zip(g, g[1:]):
            L = math.dist(a, b)
            if L < 25:
                continue
            cx, cy = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            nota = math.hypot(cx - ax, cy - ay) - L * 0.3
            if mejor is None or nota < mejor[0]:
                mejor = (nota, cx, cy, math.atan2(b[1] - a[1], b[0] - a[0]))
    _, cx, cy, an = mejor
    # Que no se lea boca abajo.
    if an > math.pi / 2:
        an -= math.pi
    if an < -math.pi / 2:
        an += math.pi
    t_sal.append({"t": texto, "x": round(cx + corre * math.cos(an)), "y": round(cy + corre * math.sin(an)), "a": round(an, 3)})

SALIDA.parent.mkdir(parents=True, exist_ok=True)
SALIDA.write_text(json.dumps({"c": c_sal, "e": e_sal, "r": rutas, "t": t_sal}, ensure_ascii=False, separators=(",", ":")))
print(f"{len(c_sal)} calles, {len(e_sal)} edificios, {SALIDA.stat().st_size // 1024} KB en {SALIDA.relative_to(RAIZ)}")
