#!/usr/bin/env python3
"""El mapa de «Dónde estamos» de Los Ochoa: de las huellas de OpenStreetMap al dibujo.

POR QUÉ EXISTE ESTE SCRIPT. El recuadro del mapa no es un mapa embebido —ni
Google ni nadie: cero JavaScript ajeno, cero cookies, y sin clave que gestionar,
que fue decisión de Mario el 2026-09-20— sino un dibujo de la manzana en
perspectiva, con la sensación de la vista 3D de Apple Maps pero propio y con la
piel de la casa. Y para que sea la calle de verdad y no una interpretación, las
huellas y las alturas de los edificios son las reales: salen de OpenStreetMap.

Sin esto, retocar el encuadre o el estilo sería editar a mano un SVG de mil
polígonos. Con esto es un comando, y lo que hay que revisar a ojo es una cosa:
si el resultado sigue reconociéndose como la Castellana a la altura de Cuzco.

  python3 scripts/mapa-manzana.py                # regenera el SVG desde la descarga guardada
  python3 scripts/mapa-manzana.py --descargar    # vuelve a pedir los datos a OSM y regenera
  python3 scripts/mapa-manzana.py --pitch 40 --dist 380 --salida /tmp/prueba.svg   # para bocetos

Lo que produce: apps/ochoa/src/assets/mapa-manzana.svg, que Mapa.astro incrusta
en línea. Los colores no van en el SVG: van por clases, y las pinta el CSS del
componente con los tokens de la casa. Así el dibujo sigue a la paleta.

LA PROYECCIÓN ES UNA CÁMARA, NO UNA AXONOMETRÍA. La primera versión (2026-09-20,
en el historial) era isométrica y a Mario le pareció «un render técnico»: todo
del mismo tamaño, mucho tejado. Lo que hace que la vista de Apple parezca una
ciudad es la perspectiva con cámara baja e inclinada —las calles convergen, lo
cercano es más grande y se ven las fachadas más que los tejados—, y eso es lo
que hay aquí: una cámara de pinhole con su posición, su inclinación y su focal.
Consecuencias que no son obvias: las calles no pueden ser trazos de anchura fija
(se dibujan como bandas en el suelo, que se estrechan con la distancia), qué
cara de un edificio se ve depende de dónde está la cámara y no de una dirección
fija, el orden de pintado es por profundidad real, y los nombres de calle van
«pegados» al suelo con la matriz afín local de la proyección, como si estuvieran
pintados en la calzada.

El encuadre —«la plaza»: el 117 con su manzana, la Castellana en diagonal de
abajo-izquierda a arriba-derecha, el metro de Cuzco arriba a la derecha y el
Ministerio de Defensa abajo a la izquierda— lo eligió Mario entre bocetos; la
cámara de abajo lo reproduce. Cambiar el encuadre es cambiar RUMBO, PITCH, DIST
y MIRA, y todos se pueden pasar por línea de comandos para sacar bocetos.

Los datos son © colaboradores de OpenStreetMap (ODbL); el dibujo lleva el
crédito en la esquina, que es lo que la licencia pide.
"""
import json, math, sys, urllib.request, urllib.parse
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "scripts" / "mapa-manzana.osm.json"
SALIDA = RAIZ / "apps" / "ochoa" / "src" / "assets" / "mapa-manzana.svg"

# El local, tal y como está en OSM (nodo «Tasquita los Ochoa», Paseo de la Castellana 117).
LAT0, LON0 = 40.4571392, -3.6907646

# La consulta, para volver a bajar los datos si el barrio cambia. El radio es mayor que en la
# versión isométrica (340 m): con la cámara baja, el fondo del encuadre llega a 500 m del
# local, y con menos datos las esquinas de arriba se quedaban en suelo vacío.
CONSULTA = (
    "[out:json][timeout:90];("
    f'way["building"](around:560,{LAT0},{LON0});'
    f'relation["building"](around:560,{LAT0},{LON0});'
    f'way["highway"]["highway"!~"footway|path|steps|cycleway|service|platform|corridor"](around:600,{LAT0},{LON0});'
    f'way["leisure"~"park|garden|playground"](around:560,{LAT0},{LON0});'
    f'node["railway"="station"](around:500,{LAT0},{LON0});'
    ");out body geom;"
)

if "--descargar" in sys.argv:
    # Overpass devuelve 406 a un GET sin User-Agent y 504 a ratos: POST, cabecera y reintentos.
    import time
    for intento in range(4):
        try:
            req = urllib.request.Request(
                "https://overpass-api.de/api/interpreter",
                data=urllib.parse.urlencode({"data": CONSULTA}).encode(),
                headers={"User-Agent": "ochoa-cokima-mapa/1.0"},
            )
            with urllib.request.urlopen(req, timeout=150) as r:
                DATOS.write_bytes(r.read())
            print(f"descargado: {DATOS} ({DATOS.stat().st_size // 1024} KB)")
            break
        except Exception as e:                      # noqa: BLE001 — se reintenta lo que sea
            print(f"Overpass falló ({e}); reintento en 8 s", file=sys.stderr)
            time.sleep(8)
    else:
        sys.exit("Overpass no respondió; se regenera con la descarga guardada")


def _arg(nombre, defecto):
    return float(sys.argv[sys.argv.index(nombre) + 1]) if nombre in sys.argv else defecto

# ─── La cámara: el encuadre elegido, «la plaza» ─────────────────────────────
W, H = 640, 400          # el recuadro es 16:10, como el hueco que había
PITCH = _arg("--pitch", 50)    # grados bajo la horizontal. Más bajo = más fachada y más convergencia; más alto = más plano
RUMBO = _arg("--rumbo", 42)    # hacia dónde mira, en grados desde el eje de la Castellana (+x, norte) hacia +y (oeste):
                               # la cámara está al sureste del local y mira al noroeste, y así el Paseo sube en diagonal
DIST = _arg("--dist", 700)     # metros de la cámara al punto de mira: cuánto barrio entra
FOCAL = _arg("--focal", 640)   # px. Con 640 de ancho son 53° de campo horizontal; más corta abre el angular
MIRA = (_arg("--mira-x", 60), _arg("--mira-y", 0))  # punto de mira, en metros girados: un poco al norte del
                               # local (que está en 0,0) para que el 117 caiga algo por debajo del centro
LUZ = (-0.55, 0.45, 0.70)      # de dónde viene la luz: del suroeste y alta. La cara sur queda iluminada, la
                               # este en sombra, y la sombra arrojada cae al noreste, a la derecha del bloque
if "--salida" in sys.argv: SALIDA = Path(sys.argv[sys.argv.index("--salida") + 1])

d = json.loads(DATOS.read_text(encoding="utf-8"))
els = d["elements"]


def metros(lat, lon):
    return ((lon - LON0) * 111320 * math.cos(math.radians(LAT0)), (lat - LAT0) * 110540)

# ─── Orientación: la Castellana se pone en el eje +x (hacia el norte) ───────
def rumbo_castellana():
    vx = vy = 0.0
    for e in els:
        t = e.get("tags", {})
        if t.get("highway") == "trunk" and "Castellana" in t.get("name", ""):
            g = [metros(p["lat"], p["lon"]) for p in e["geometry"]]
            for (x1, y1), (x2, y2) in zip(g, g[1:]):
                dx, dy = x2 - x1, y2 - y1
                if dy < 0: dx, dy = -dx, -dy       # siempre hacia el norte
                vx += dx; vy += dy
    return math.atan2(vy, vx)

ang = -rumbo_castellana()   # girar para que ese rumbo sea 0 rad (+x)
COS, SIN = math.cos(ang), math.sin(ang)
def gira(x, y):
    return (x * COS - y * SIN, x * SIN + y * COS)

def punto(p):
    return gira(*metros(p["lat"], p["lon"]))

# ─── La cámara, en números ──────────────────────────────────────────────────
_th, _ph = math.radians(RUMBO), math.radians(PITCH)
FWD = (math.cos(_th) * math.cos(_ph), math.sin(_th) * math.cos(_ph), -math.sin(_ph))   # hacia dónde mira
DER = (math.sin(_th), -math.cos(_th), 0.0)                                               # su derecha
ARR = (math.cos(_th) * math.sin(_ph), math.sin(_th) * math.sin(_ph), math.cos(_ph))     # su arriba
CAM = (MIRA[0] - DIST * FWD[0], MIRA[1] - DIST * FWD[1], -DIST * FWD[2])                # dónde está
CX, CY = W / 2, H / 2
CERCA = 12.0     # plano cercano (m): lo que queda más cerca que esto se recorta antes de proyectar
MARGEN = 16      # px fuera del marco que aún se dibujan (los desenfoques asoman desde fuera)

def camara(x, y, z=0.0):
    dx, dy, dz = x - CAM[0], y - CAM[1], z - CAM[2]
    return (dx * DER[0] + dy * DER[1],
            dx * ARR[0] + dy * ARR[1] + dz * ARR[2],
            dx * FWD[0] + dy * FWD[1] + dz * FWD[2])

def pantalla(c):
    xc, yc, zc = c
    return (CX + FOCAL * xc / zc, CY - FOCAL * yc / zc)

def proy(x, y, z=0.0):
    return pantalla(camara(x, y, z))

def fondo(x, y):
    """Profundidad de un punto del suelo, para pintar de lejos a cerca."""
    return (x - CAM[0]) * FWD[0] + (y - CAM[1]) * FWD[1]

def _recorta(cams):
    """Sutherland-Hodgman contra el plano cercano: un polígono que cruza por detrás de la
    cámara proyectaría disparates."""
    out = []
    n = len(cams)
    for i in range(n):
        a, b = cams[i], cams[(i + 1) % n]
        ina, inb = a[2] >= CERCA, b[2] >= CERCA
        if ina: out.append(a)
        if ina != inb:
            t = (CERCA - a[2]) / (b[2] - a[2])
            out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, CERCA))
    return out

def en_pantalla(pts):
    """Proyecta un polígono (2D en el suelo o 3D); None si no se ve: detrás de la cámara o
    fuera del marco. Lo que no se ve no se escribe, que el SVG va en línea en dos páginas."""
    cams = [camara(*p) for p in pts]
    if any(c[2] < CERCA for c in cams):
        cams = _recorta(cams)
        if len(cams) < 3: return None
    scr = [pantalla(c) for c in cams]
    xs = [p[0] for p in scr]; ys = [p[1] for p in scr]
    if max(xs) < -MARGEN or min(xs) > W + MARGEN or max(ys) < -MARGEN or min(ys) > H + MARGEN: return None
    if max(xs) - min(xs) < 0.8 and max(ys) - min(ys) < 0.8: return None   # menos de un píxel: no existe
    return scr

def tamano(pts):
    """El lado mayor en pantalla de un polígono proyectado, en px."""
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return max(max(xs) - min(xs), max(ys) - min(ys))

# ─── Recolección ────────────────────────────────────────────────────────────
def poligonos_de(e):
    """Lista de anillos exteriores (en metros girados) de un way o relation."""
    if e["type"] == "way":
        return [[punto(p) for p in e["geometry"]]]
    anillos = []
    for m in e.get("members", []):
        if m.get("role") == "outer" and "geometry" in m:
            anillos.append([punto(p) for p in m["geometry"]])
    return anillos

def altura_de(t):
    if t.get("height"):
        try: return float(str(t["height"]).replace("m", ""))
        except ValueError: pass
    if t.get("building:levels"):
        try: return float(t["building:levels"]) * 3.2
        except ValueError: pass
    b = t.get("building", "")
    if b in ("church", "cathedral", "chapel"): return 14
    if b in ("roof", "shed", "garage", "kiosk"): return 4
    # Sin dato, la altura típica de la zona: once plantas es lo que más abunda alrededor de Cuzco.
    # Con 16 m, el Ministerio de Defensa —la mayor mole del encuadre— salía más bajo que sus vecinos.
    return 35

def dentro(px, py, anillo):
    dentro = False
    n = len(anillo)
    for i in range(n):
        x1, y1 = anillo[i]; x2, y2 = anillo[(i + 1) % n]
        if (y1 > py) != (y2 > py):
            xi = x1 + (py - y1) * (x2 - x1) / (y2 - y1)
            if xi > px: dentro = not dentro
    return dentro

def area(an):
    return 0.5 * sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(an, an[1:] + an[:1]))

def ccw(an):
    return an if area(an) > 0 else an[::-1]

def simplifica(an, tol=1.0):
    """Douglas-Peucker sobre el anillo: quita los dientes de menos de un metro —balcones,
    retranqueos— que se convertían en un rayado de caras diminutas, y deja la forma."""
    def dp(pts):
        if len(pts) < 3: return pts
        (x1, y1), (x2, y2) = pts[0], pts[-1]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1e-9
        imax, dmax = 0, -1
        for i in range(1, len(pts) - 1):
            d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L
            if d > dmax: imax, dmax = i, d
        if dmax > tol:
            return dp(pts[:imax + 1])[:-1] + dp(pts[imax:])
        return [pts[0], pts[-1]]
    cerrado = an[0] == an[-1]
    pts = an if cerrado else an + [an[0]]
    # se parte por el punto más lejano al primero para que el cierre no se coma una esquina
    k = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]))
    out = dp(pts[:k + 1])[:-1] + dp(pts[k:])[:-1]
    return out if len(out) >= 3 else an

# Ancho de calzada: por carriles cuando OSM los da (3,3 m cada uno más los arcenes), y si no, lo
# típico de cada clase. La Castellana lleva sus dos calzadas mapeadas aparte, tres carriles cada
# una: con esto queda la mediana entre las dos, que es la sección real del Paseo.
ANCHO = {"trunk": 12, "primary": 12, "secondary": 9, "tertiary": 8, "residential": 7, "pedestrian": 8,
         "living_street": 6, "unclassified": 7, "trunk_link": 8, "primary_link": 8, "secondary_link": 7}
def ancho_de(c):
    if c.get("lanes"):
        try: return float(c["lanes"]) * 3.3 + 1
        except ValueError: pass
    return ANCHO.get(c["tipo"], 7)

# Lo que entra en el dibujo se decide en pantalla (en_pantalla), no por radio: con perspectiva
# el marco llega mucho más lejos por arriba que por abajo.
edificios, calles, verdes = [], [], []
for e in els:
    t = e.get("tags", {})
    if "building" in t:
        for an in poligonos_de(e):
            if len(an) < 3: continue
            local = dentro(0, 0, an)           # se decide con la huella real, antes de simplificar
            h = altura_de(t)
            # Un solar de menos de 40 m² sin dato es una caseta, no una torre de once plantas:
            # el «poste» junto a Cuzco era esto.
            if not t.get("height") and not t.get("building:levels") and abs(area(an)) < 40: h = 4
            edificios.append({"anillo": simplifica(an), "h": h, "nombre": t.get("name", ""), "local": local})
    elif "highway" in t and e["type"] == "way":
        calles.append({"pts": [punto(p) for p in e["geometry"]], "tipo": t["highway"], "nombre": t.get("name", ""), "lanes": t.get("lanes")})
    elif t.get("leisure") in ("park", "garden", "playground", "dog_park") and e["type"] == "way":
        g = [punto(p) for p in e["geometry"]]
        if len(g) >= 3: verdes.append(g)

# Sin árboles, sin cebras, sin líneas de carril: Mario los probó el 2026-09-20 y «no aportan gran
# cosa», «no hace falta tanto detalle». Se distingue la calzada como tal, y punto.

# Si ningún polígono contiene el nodo (la fachada suele quedar justo en el borde), el más cercano
if not any(b["local"] for b in edificios):
    def dist(b): return min(math.hypot(x, y) for x, y in b["anillo"])
    min(edificios, key=dist)["local"] = True

# ─── Escritura ──────────────────────────────────────────────────────────────
def fmt(v):
    r = f"{v:.1f}"
    return r[:-2] if r.endswith(".0") else r
def path(pts, cerrar=True):
    """La geometría va en píxeles enteros y en coordenadas relativas («M10 20l3-4 5 6z»): el
    SVG va en línea en dos páginas y cada carácter cuenta. Con la mitad de píxel que se pierde
    no se ve nada; con un decimal el archivo pesaba un tercio más. Los deltas se calculan sobre
    los enteros ya redondeados para que no se acumule deriva."""
    ent = []
    for x, y in pts:
        p = (int(round(x)), int(round(y)))
        if not ent or p != ent[-1]: ent.append(p)
    if len(ent) < 2: return ""
    s = f"M{ent[0][0]} {ent[0][1]}l"
    px, py = ent[0]
    nums = []
    for x, y in ent[1:]:
        nums += [x - px, y - py]; px, py = x, y
    s += "".join((str(n) if n < 0 or i == 0 else f" {n}") for i, n in enumerate(nums))
    return s + ("z" if cerrar else "")
def trazos(polis):
    """Varios polígonos en un solo `d`. Todos van en el mismo sentido de giro (CCW en el suelo,
    que la cámara conserva), así que con la regla nonzero se suman y no se hacen agujeros."""
    return " ".join(path(p) for p in polis)

svg = []
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">')
svg.append('<defs>'
           '<filter id="sombra-suave" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>'
           '<filter id="contacto-suave" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1"/></filter>'
           '<filter id="halo-suave" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>'
           '</defs>')
svg.append(f'<rect class="suelo" width="{W}" height="{H}"/>')

# Jardines y plazas: el tercer valor del suelo, sin verde (la paleta no lo tiene)
_jardines = [s for g in verdes if (s := en_pantalla(ccw(g)))]
if _jardines: svg.append(f'<path class="jardin" d="{trazos(_jardines)}"/>')

# ─── Calles: bandas en el suelo ─────────────────────────────────────────────
# En isométrico eran trazos con `stroke-width`; en perspectiva un trazo mide lo mismo cerca que
# lejos y delata que no hay cámara. Así que cada tramo es un cuadrilátero en metros, con los
# extremos alargados media anchura (remate cuadrado: cubre el hueco en cuña donde dos tramos se
# unen con un ángulo) y un disco solo donde la calle dobla de verdad.
def banda(pts, w):
    r = w / 2
    polis = []
    for a, b in zip(pts, pts[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy)
        if L < 0.1: continue
        ux, uy = dx / L, dy / L
        nx, ny = -uy * r, ux * r
        a2 = (a[0] - ux * r, a[1] - uy * r); b2 = (b[0] + ux * r, b[1] + uy * r)
        polis.append(ccw([(a2[0] + nx, a2[1] + ny), (b2[0] + nx, b2[1] + ny), (b2[0] - nx, b2[1] - ny), (a2[0] - nx, a2[1] - ny)]))
    for i in range(1, len(pts) - 1):
        a, p, b = pts[i - 1], pts[i], pts[i + 1]
        a1 = math.atan2(p[1] - a[1], p[0] - a[0]); a2 = math.atan2(b[1] - p[1], b[0] - p[0])
        giro = abs((a2 - a1 + math.pi) % (2 * math.pi) - math.pi)
        if giro > math.radians(50):
            polis.append([(p[0] + r * math.cos(k * math.pi / 4), p[1] + r * math.sin(k * math.pi / 4)) for k in range(8)])
    return polis

_calzada, _plaza = [], []
for c in calles:
    destino = _plaza if c["tipo"] in ("pedestrian", "living_street") else _calzada
    for poli in banda(c["pts"], ancho_de(c)):
        s = en_pantalla(poli)
        if s: destino.append(s)
if _plaza: svg.append(f'<path class="jardin" d="{trazos(_plaza)}"/>')
svg.append(f'<path class="calzada" d="{trazos(_calzada)}"/>')

# ─── Sombras ────────────────────────────────────────────────────────────────
# La sombra arrojada de cada bloque es un volumen: la huella, la huella desplazada por la luz en
# proporción a la altura, y el barrido de cada arista. Todo en metros y proyectado después, para
# que la sombra de lo cercano sea grande y la de lo lejano pequeña como todo lo demás. Un solo
# grupo con una sola opacidad: donde dos sombras se solapan no oscurecen el doble.
_lh = math.hypot(LUZ[0], LUZ[1]); LX, LY = LUZ[0] / _lh, LUZ[1] / _lh
svg.append('<g class="sombra" filter="url(#sombra-suave)">')
for b in edificios:
    h = b["h"]
    if h <= 4: continue                            # las casetas no proyectan
    sx_, sy_ = -h * LUZ[0] / LUZ[2], -h * LUZ[1] / LUZ[2]
    an = ccw(b["anillo"])
    cx = sum(x for x, _ in an) / len(an); cy = sum(y for _, y in an) / len(an)
    if camara(cx, cy)[2] < CERCA: continue
    salto = math.dist(proy(cx, cy), proy(cx + sx_, cy + sy_))   # cuánto se desplaza la sombra, en px
    if salto < 0.8: continue                                      # de lejos, la sombra no existe
    polis = [an, [(x + sx_, y + sy_) for x, y in an]]
    if salto > 2.5:
        # Solo las aristas que miran hacia donde cae la sombra: el barrido de las demás queda
        # dentro de la unión de la huella y la huella desplazada, y sobraban la mitad de los polígonos.
        n = len(an)
        for i in range(n):
            p, q = an[i], an[(i + 1) % n]
            if (q[1] - p[1]) * sx_ - (q[0] - p[0]) * sy_ <= 0: continue
            polis.append(ccw([p, q, (q[0] + sx_, q[1] + sy_), (p[0] + sx_, p[1] + sy_)]))
    vistos = [s for poli in polis if (s := en_pantalla(poli))]
    if vistos: svg.append(f'<path d="{trazos(vistos)}"/>')
svg.append('</g>')

# ─── Edificios, de lejos a cerca ────────────────────────────────────────────
# Cada pieza (una cara o un techo) se ordena por la profundidad de su base en el suelo, no por su
# centro en 3D: los rayos de la cámara cruzan primero las huellas más cercanas, y ese es el
# orden que hace que lo de delante tape a lo de detrás sin z-buffer.
def visible(p, q, nx, ny):
    mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
    return (CAM[0] - mx) * nx + (CAM[1] - my) * ny > 0

def sombreado(nx, ny):
    """La luz sobre una cara vertical, en cuatro escalones. Con dos valores fijos (una cara sur y
    una oeste) las manzanas que no van paralelas a la Castellana salían planas."""
    k = nx * LX + ny * LY
    return "m1" if k > 0.45 else "m2" if k > 0 else "m3" if k > -0.45 else "m4"

piezas, contactos, siluetas = [], [], []
for b in edificios:
    an = ccw(b["anillo"]); h = b["h"]
    cx = sum(x for x, _ in an) / len(an); cy = sum(y for _, y in an) / len(an)
    n = len(an)
    for i in range(n):
        p, q = an[i], an[(i + 1) % n]
        ex, ey = q[0] - p[0], q[1] - p[1]; L = math.hypot(ex, ey)
        if L < 0.05: continue
        nx, ny = ey / L, -ex / L                       # normal exterior de un anillo CCW
        if not visible(p, q, nx, ny): continue
        scr = en_pantalla([(p[0], p[1], 0), (q[0], q[1], 0), (q[0], q[1], h), (p[0], p[1], h)])
        if not scr: continue
        if b["local"]: clase = "local-luz" if nx * LX + ny * LY > 0 else "local-sombra"
        elif h <= 4: clase = "caseta"
        else: clase = sombreado(nx, ny)
        piezas.append((fondo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2), 1, f'<path class="{clase}" d="{path(scr)}"/>'))
        siluetas.append(scr)
        # El contacto con el suelo: una banda corta en la base de cada cara visible, que
        # desenfocada es la oclusión que hace que el bloque apoye en vez de flotar. Solo en los
        # bloques que en pantalla tienen tamaño: de lejos la banda es menos que el desenfoque.
        if h > 4 and tamano(scr) > 8:
            a_ = 2.2
            s = en_pantalla(ccw([p, q, (q[0] + nx * a_, q[1] + ny * a_), (p[0] + nx * a_, p[1] + ny * a_)]))
            if s: contactos.append(s)
    techo = en_pantalla([(x, y, h) for x, y in an])
    if techo:
        clase = "local-techo" if b["local"] else ("caseta-techo" if h <= 4 else "techo")
        piezas.append((fondo(cx, cy), 0, f'<path class="{clase}" d="{path(techo)}"/>'))
        siluetas.append(techo)

if contactos: svg.append(f'<g class="contacto" filter="url(#contacto-suave)"><path d="{trazos(contactos)}"/></g>')
# El halo del local: un resplandor rojo difuso bajo el bloque, como el pin elegido en un mapa.
_mio = next(b for b in edificios if b["local"])
_halo = en_pantalla(ccw(_mio["anillo"]))
if _halo: svg.append(f'<path class="halo" filter="url(#halo-suave)" d="{path(_halo)}"/>')

for _, _, s in sorted(piezas, key=lambda t: (t[0], t[1]), reverse=True):
    svg.append(s)

# ─── Etiquetas ──────────────────────────────────────────────────────────────
def _dentro_pantalla(px, py, poli):
    d = False; n = len(poli)
    for i in range(n):
        x1, y1 = poli[i]; x2, y2 = poli[(i + 1) % n]
        if (y1 > py) != (y2 > py) and px < x1 + (py - y1) * (x2 - x1) / (y2 - y1): d = not d
    return d

def tapado(x, y):
    """Si un punto del suelo queda detrás de algún edificio en pantalla: «Panamá» se rotulaba
    sobre su calle justo donde la calle desaparecía detrás de un bloque."""
    if camara(x, y)[2] < CERCA: return True
    sx, sy = proy(x, y)
    return any(_dentro_pantalla(sx, sy, poli) for poli in siluetas)

def en_marco(x, y, margen=40, abajo=40):
    if camara(x, y)[2] < CERCA: return False
    sx, sy = proy(x, y)
    return margen < sx < W - margen and 24 < sy < H - abajo

_paseo = [c for c in calles if c["tipo"] == "trunk" and "Castellana" in c["nombre"]]
def lejos_del_paseo(x, y, m=30):
    """Para no rotular una calle menor encima del Paseo: Pedro Teixeira se metía en él."""
    for c in _paseo:
        for a, b in zip(c["pts"], c["pts"][1:]):
            ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay; l2 = dx * dx + dy * dy
            t = 0 if l2 == 0 else max(0, min(1, ((x - ax) * dx + (y - ay) * dy) / l2))
            if math.hypot(x - (ax + t * dx), y - (ay + t * dy)) < m: return False
    return True

def cadenas(nombre, tipo=None):
    """Los tramos de OSM con ese nombre, encadenados por sus extremos en polilíneas largas. El
    Paseo está partido en tramos de 8 a 250 m y el nombre necesita 150 px seguidos: buscando
    tramo a tramo se quedaba sin sitio y sin nombre."""
    ways = [list(c["pts"]) for c in calles if c["nombre"] == nombre and (tipo is None or c["tipo"] == tipo)]
    out = []
    while ways:
        cad = ways.pop()
        crecio = True
        while crecio:
            crecio = False
            for w in list(ways):
                if math.dist(w[0], cad[-1]) < 1.5: cad += w[1:]
                elif math.dist(w[-1], cad[-1]) < 1.5: cad += w[::-1][1:]
                elif math.dist(w[-1], cad[0]) < 1.5: cad = w[:-1] + cad
                elif math.dist(w[0], cad[0]) < 1.5: cad = w[::-1][:-1] + cad
                else: continue
                ways.remove(w); crecio = True
        out.append(cad)
    return out

def tramo_de(nombre, texto, px_por_letra, tipo=None, lado=None, abajo=40):
    """El punto y la dirección donde mejor se rotula esa calle: sobre la parte VISIBLE de la
    calle —dentro del marco, lejos del Paseo si es una calle menor, sin edificio delante—, en un
    trecho con sitio en pantalla para el nombre, y de entre esos el más cercano al local.
    Devuelve (x, y, ux, uy) en metros. Se rotula sobre lo visible y no sobre el centro del tramo:
    un tramo largo que entra por el borde tenía el centro fuera y se quedaba sin nombre."""
    menor = tipo != "trunk"
    necesita = len(texto) * px_por_letra + 12
    def vale(x, y):
        if lado and not lado(x, y): return False
        if not en_marco(x, y, abajo=abajo): return False
        if menor and not lejos_del_paseo(x, y): return False
        return not tapado(x, y)
    mejor, mejor_d = None, 1e9
    for cad in cadenas(nombre, tipo):
        # muestras cada 4 m con la dirección de su tramo
        ms = []
        for a, b in zip(cad, cad[1:]):
            L = math.dist(a, b)
            if L < 0.01: continue
            n = max(1, int(L // 4))
            ms += [(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, (b[0] - a[0]) / L, (b[1] - a[1]) / L) for k in range(n)]
        # cada racha de muestras visibles es un sitio candidato si en pantalla mide lo que el texto
        racha = []
        for m in ms + [None]:
            if m is not None and vale(m[0], m[1]):
                racha.append(m); continue
            if len(racha) >= 2:
                pasos = [math.dist(proy(p[0], p[1]), proy(q[0], q[1])) for p, q in zip(racha, racha[1:])]
                Lpx = sum(pasos)
                if Lpx >= necesita:
                    acc, mid = 0.0, racha[len(racha) // 2]
                    for i, d_ in enumerate(pasos):          # el medio en píxeles, no en muestras
                        if acc + d_ >= Lpx / 2: mid = racha[i]; break
                        acc += d_
                    dd = math.hypot(mid[0], mid[1])
                    if dd < mejor_d: mejor, mejor_d = mid, dd
            racha = []
    return mejor

def etiqueta_suelo(texto, x, y, ux, uy, clase, fs):
    """Un nombre de calle pintado en la calzada: el texto va en un grupo con la matriz afín que
    la cámara aplica al suelo en ese punto (un metro a lo largo de la calle y un metro a través),
    normalizada para que la letra mida `fs` píxeles a lo largo. El giro y la inclinación van en
    el grupo y no en el texto: en el móvil el CSS escala el texto sobre sí mismo con
    `transform-box: fill-box`, y un `transform` de CSS sustituye al del atributo del propio
    elemento; en el grupo se conserva y el escalado se compone con él."""
    d_ = 2.0
    s0 = proy(x, y)
    su = proy(x + ux * d_, y + uy * d_); sv = proy(x - uy * d_, y + ux * d_)
    ju = ((su[0] - s0[0]) / d_, (su[1] - s0[1]) / d_); jv = ((sv[0] - s0[0]) / d_, (sv[1] - s0[1]) / d_)
    if ju[0] < 0: ju, jv = (-ju[0], -ju[1]), (-jv[0], -jv[1])   # se lee de izquierda a derecha
    if ju[0] * jv[1] - ju[1] * jv[0] < 0: jv = (-jv[0], -jv[1])   # y sin espejo: el «abajo» del texto, hacia la cámara
    k = 1 / math.hypot(*ju)
    a, b_, c, d = ju[0] * k, ju[1] * k, jv[0] * k, jv[1] * k
    # Con la cámara baja, a través de la calle el suelo se acorta mucho: por debajo de 0,62 la
    # letra se aplasta y deja de leerse en el móvil, así que ahí se le devuelve altura.
    aplaste = math.hypot(c, d)
    if aplaste < 0.62:
        c, d = c * 0.62 / aplaste, d * 0.62 / aplaste
    lado = " rotulo-izq" if s0[0] < W * 0.28 else (" rotulo-borde" if s0[0] > W * 0.72 else "")
    svg.append(f'<g transform="matrix({fmt(a)} {fmt(b_)} {fmt(c)} {fmt(d)} {fmt(s0[0])} {fmt(s0[1])})">'
               f'<text class="{clase}{lado}" x="0" y="{fmt(fs * 0.36)}" text-anchor="middle">{texto}</text></g>')

def etiqueta(texto, x, y, clase):
    """Un rótulo de lugar: de frente, como un letrero, no pegado al suelo."""
    lado = " rotulo-izq" if x < W * 0.28 else (" rotulo-borde" if x > W * 0.72 else "")
    svg.append(f'<g><text class="{clase}{lado}" x="{fmt(x)}" y="{fmt(y)}" text-anchor="middle">{texto}</text></g>')

# El Paseo, más grande, en el trecho al sur del local: es el lado del marco que está más cerca
# de la cámara, donde la calle es ancha y un nombre de 150 px cabe, y el norte ya lleva la plaza
# con su nombre y el metro. Sin acotar caía en el punto medio de todo el Paseo visible, que es la
# plaza misma; entre el local y la rotonda no hay sitio para el texto.
tr = tramo_de("Paseo de la Castellana", "Paseo de la Castellana", 6.5, "trunk", lado=lambda x, y: x < 25, abajo=18)
if tr: etiqueta_suelo("Paseo de la Castellana", *tr, "rotulo", 12)
# San Germán es la calle del local: es la única menor que se queda en el móvil.
tr = tramo_de("Calle de San Germán", "San Germán", 5, lado=lambda x, y: y > 30)
if tr: etiqueta_suelo("San Germán", *tr, "rotulo-cerca", 9.5)
for nombre, texto in (("Calle Pedro Teixeira", "Pedro Teixeira"), ("Calle Panamá", "Panamá"), ("Calle del Doctor Fleming", "Doctor Fleming")):
    tr = tramo_de(nombre, texto, 5)
    if tr: etiqueta_suelo(texto, *tr, "rotulo-menor", 9.5)

# Los hitos que orientan: el Ministerio de Defensa (la mole de abajo a la izquierda) y la plaza
# de Cuzco con su metro (arriba a la derecha). Nada más: ni negocios ni iconos.
defensa = [b for b in edificios if "Defensa" in b["nombre"]]
if defensa:
    b = max(defensa, key=lambda b: abs(area(b["anillo"])))
    an = b["anillo"]; cx = sum(x for x, _ in an) / len(an); cy = sum(y for _, y in an) / len(an)
    sx, sy = proy(cx, cy, b["h"])
    etiqueta("Ministerio de Defensa", sx, sy + 4, "rotulo-lugar")
_plaza_pts = [p for c in calles if c["nombre"] == "Plaza de Cuzco" for p in c["pts"]]
if _plaza_pts:
    px_ = sum(x for x, _ in _plaza_pts) / len(_plaza_pts); py_ = sum(y for _, y in _plaza_pts) / len(_plaza_pts)
    sx, sy = proy(px_, py_)
    etiqueta("Plaza de Cuzco", sx, sy + 3, "rotulo-lugar")
for e in els:
    t = e.get("tags", {})
    if e["type"] == "node" and t.get("railway") == "station":
        sx, sy = proy(*punto(e))
        svg.append(f'<g class="metro-g"><path class="chapa-pie" d="M{fmt(sx)} {fmt(sy)} L{fmt(sx)} {fmt(sy - 14)}"/><circle class="chapa-punto" cx="{fmt(sx)}" cy="{fmt(sy)}" r="2.2"/>')
        svg.append(f'<rect class="metro" x="{fmt(sx - 8)}" y="{fmt(sy - 30)}" width="16" height="16" rx="3"/>')
        svg.append(f'<text class="metro-txt" x="{fmt(sx)}" y="{fmt(sy - 18)}" text-anchor="middle">M</text></g>')
        break

# ─── La chapa, encima del 117. Sin punto ni burbuja: el bloque rojo ya canta solo. ──────────
mio = next(b for b in edificios if b["local"])
_an = mio["anillo"]
px, py = proy(sum(x for x, _ in _an) / len(_an), sum(y for _, y in _an) / len(_an), mio["h"])
chapa_w = 122
svg.append('<g class="chincheta">')
svg.append(f'<path class="chapa-pie" d="M{fmt(px)} {fmt(py)} L{fmt(px)} {fmt(py - 24)}"/>')
svg.append(f'<circle class="chapa-punto" cx="{fmt(px)}" cy="{fmt(py)}" r="2.6"/>')
svg.append(f'<rect class="chapa" x="{fmt(px - chapa_w / 2)}" y="{fmt(py - 46)}" width="{chapa_w}" height="23" rx="4"/>')
svg.append(f'<text class="chapa-txt" x="{fmt(px)}" y="{fmt(py - 30)}" text-anchor="middle">Castellana, 117</text>')
svg.append('</g>')
# El crédito que pide la licencia de los datos, discreto y fuera de la chapa de «cómo llegar».
svg.append(f'<text class="credito" x="10" y="{H - 8}">© OpenStreetMap</text>')
svg.append("</svg>")

SALIDA.write_text("\n".join(svg), encoding="utf-8")
print(f"{SALIDA.relative_to(RAIZ) if SALIDA.is_relative_to(RAIZ) else SALIDA}: {len(piezas)} piezas de {len(edificios)} edificios, "
      f"{len(_calzada)} tramos de calzada, giro {math.degrees(ang):.1f}°, cámara a {CAM[2]:.0f} m sobre ({CAM[0]:.0f}, {CAM[1]:.0f}), "
      f"local en {mio['nombre'] or 'sin nombre'} ({mio['h']:.0f} m) → {proy(0, 0)[0]:.0f},{proy(0, 0)[1]:.0f} px")
