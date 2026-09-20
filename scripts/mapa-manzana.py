#!/usr/bin/env python3
"""El mapa de «Dónde estamos» de Los Ochoa: de las huellas de OpenStreetMap al dibujo.

POR QUÉ EXISTE ESTE SCRIPT. El recuadro del mapa no es un mapa embebido —ni
Google ni nadie: cero JavaScript ajeno, cero cookies, y sin clave que gestionar,
que fue decisión de Mario el 2026-09-20— sino un dibujo isométrico de la
manzana, al estilo de la vista 3D de Apple Maps pero propio y con la piel de la
casa. Y para que sea la calle de verdad y no una interpretación, las huellas y
las alturas de los edificios son las reales: salen de OpenStreetMap.

Sin esto, retocar el encuadre o el estilo sería editar a mano un SVG de cien
polígonos. Con esto es un comando, y lo que hay que revisar a ojo es una cosa:
si el resultado sigue reconociéndose como la Castellana a la altura de Cuzco.

  python3 scripts/mapa-manzana.py                # regenera el SVG desde la descarga guardada
  python3 scripts/mapa-manzana.py --descargar    # vuelve a pedir los datos a OSM y regenera

Lo que produce: apps/ochoa/src/assets/mapa-manzana.svg, que Mapa.astro incrusta
en línea. Los colores no van en el SVG: van por clases, y las pinta el CSS del
componente con los tokens de la casa. Así el dibujo sigue a la paleta.

Los parámetros de abajo son el encuadre que eligió Mario entre cuatro bocetos
(«la plaza»: el 117 con su manzana, la Castellana en diagonal, el metro de Cuzco
y el Ministerio de Defensa). Los otros tres están en el historial de esta
conversación, no aquí: cambiar el encuadre es cambiar RADIO y ESCALA.

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

# La consulta, para volver a bajar los datos si el barrio cambia.
CONSULTA = (
    "[out:json][timeout:60];("
    f'way["building"](around:340,{LAT0},{LON0});'
    f'relation["building"](around:340,{LAT0},{LON0});'
    f'way["highway"]["highway"!~"footway|path|steps|cycleway|service|platform|corridor"](around:380,{LAT0},{LON0});'
    f'way["leisure"~"park|garden|playground"](around:340,{LAT0},{LON0});'
    f'node["railway"="station"](around:400,{LAT0},{LON0});'
    f'node["natural"="tree"](around:340,{LAT0},{LON0});'
    f'node["highway"="crossing"](around:300,{LAT0},{LON0});'
    ");out body geom;"
)

if "--descargar" in sys.argv:
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter",
        data=urllib.parse.urlencode({"data": CONSULTA}).encode(),
        headers={"User-Agent": "ochoa-cokima-mapa/1.0"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        DATOS.write_bytes(r.read())
    print(f"descargado: {DATOS} ({DATOS.stat().st_size // 1024} KB)")

# ─── El encuadre elegido: «la plaza» ───────────────────────────────────────
RADIO = 240          # metros alrededor del local que entran en el dibujo
ESCALA = 1.05        # píxeles por metro
EXTRUIR = True       # con volumen; a plano fue una de las variantes descartadas
ALTURA_K = 0.78      # las alturas reales, a escala. Con 0,55 once plantas parecían cuatro; con más, las torres de Cuzco se comen el dibujo
W, H = 640, 400      # el recuadro es 16:10, como el hueco que había
CX, CY = W * 0.46, H * 0.52  # dónde cae el local: un poco abajo y a la izquierda, para que la rotonda de Cuzco cierre dentro del marco
d = json.loads(DATOS.read_text(encoding="utf-8"))
els = d["elements"]


def metros(lat, lon):
    return ((lon - LON0) * 111320 * math.cos(math.radians(LAT0)), (lat - LAT0) * 110540)

# ─── Orientación: la Castellana se pone en el eje +x, que en isométrico sube a la derecha ──
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

C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))
def iso(x, y, z=0.0):
    return (CX + (x - y) * C30 * ESCALA, CY - (x + y) * S30 * ESCALA - z * ESCALA * ALTURA_K)

def punto(p):
    return gira(*metros(p["lat"], p["lon"]))

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

def cerca(anillo, r):
    return any(math.hypot(x, y) < r for x, y in anillo)

def simplifica(an, tol=1.0):
    """Douglas-Peucker sobre el anillo: quita los dientes de menos de un metro —balcones,
    retranqueos— que en isométrico se convertían en un rayado vertical, y deja la forma."""
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
# una: con esto queda la mediana entre las dos, que es la sección real del Paseo. Un ancho fijo
# de 34 m las fundía en una banda blanca de cincuenta metros.
ANCHO = {"trunk": 12, "primary": 12, "secondary": 9, "tertiary": 8, "residential": 7, "pedestrian": 6,
         "living_street": 6, "unclassified": 7, "trunk_link": 8, "primary_link": 8, "secondary_link": 7}
def ancho_de(c):
    if c.get("lanes"):
        try: return float(c["lanes"]) * 3.3 + 1
        except ValueError: pass
    return ANCHO.get(c["tipo"], 7)

edificios, calles, verdes, arboles, cruces, medianas = [], [], [], [], [], []
for e in els:
    t = e.get("tags", {})
    if e["type"] == "node" and t.get("natural") == "tree":
        x, y = punto(e)
        if math.hypot(x, y) < RADIO: arboles.append((x, y))
        continue
    if e["type"] == "node" and t.get("highway") == "crossing":
        x, y = punto(e)
        continue   # los pasos de cebra se dibujaron y Mario los quitó: «no hace falta tanto detalle»
    if "building" in t:
        for an in poligonos_de(e):
            if len(an) >= 3 and cerca(an, RADIO):
                local = dentro(0, 0, an)           # se decide con la huella real, antes de simplificar
                h = altura_de(t)
                # Un solar de menos de 40 m² sin dato es una caseta, no una torre de once plantas:
                # el «poste» junto a Cuzco era esto.
                if not t.get("height") and not t.get("building:levels") and abs(0.5 * sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(an, an[1:] + an[:1]))) < 40: h = 4
                edificios.append({"anillo": simplifica(an), "h": h, "nombre": t.get("name", ""), "local": local})
    elif "highway" in t and e["type"] == "way":
        g = [punto(p) for p in e["geometry"]]
        if cerca(g, RADIO + 60):
            calles.append({"pts": g, "tipo": t["highway"], "nombre": t.get("name", ""), "lanes": t.get("lanes")})
    elif t.get("leisure") in ("park", "garden", "playground", "dog_park") and e["type"] == "way":
        g = [punto(p) for p in e["geometry"]]
        if len(g) >= 3 and cerca(g, RADIO):
            verdes.append(g)

# Sin árboles ni hileras: los probó Mario el 2026-09-20 y «no aportan gran cosa». El código de
# las hileras del bulevar está en el historial (commit del mapa) por si vuelven.

# Si ningún polígono contiene el nodo (la fachada suele quedar justo en el borde), el más cercano
if not any(b["local"] for b in edificios):
    def dist(b): return min(math.hypot(x, y) for x, y in b["anillo"])
    min(edificios, key=dist)["local"] = True

# ─── Geometría ──────────────────────────────────────────────────────────────
def area(an):
    return 0.5 * sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(an, an[1:] + an[:1]))

def ccw(an):
    return an if area(an) > 0 else an[::-1]


def fmt(v):
    r = f"{v:.1f}"
    return r[:-2] if r.endswith(".0") else r
def path(pts, cerrar=True):
    s = "M" + " L".join(f"{fmt(x)} {fmt(y)}" for x, y in pts)
    return s + (" Z" if cerrar else "")

svg = []
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">')
svg.append('<defs>'
           '<filter id="sombra-suave" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>'
           '<filter id="contacto-suave" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.3"/></filter>'
           '<filter id="halo-suave" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>'
           '</defs>')
svg.append(f'<rect class="suelo" width="{W}" height="{H}"/>')

# Jardines: papel un punto más oscuro, sin verde (la paleta no lo tiene)
for g in verdes:
    svg.append(f'<path d="{path([iso(*p) for p in g])}" class="jardin"/>')

# Calles en dos pasadas: el canto —un filete fino de tinta— y la calzada en papel blanco sobre
# la manzana en papel-2. Es la fórmula de la primera versión, que Mario prefirió a la de aceras
# y cebras: «distinguir las calzadas como tal», sin más detalle. Las dos calzadas del Paseo van
# por carriles, así que la mediana queda entre ellas por sí sola.
for capa in ("canto", "cara"):
    for c in calles:
        w = ancho_de(c) * ESCALA
        pts = path([iso(*p) for p in c["pts"]], False)
        if capa == "canto":
            svg.append(f'<path d="{pts}" class="canto" stroke-width="{fmt(w + 2)}" stroke-linecap="round" stroke-linejoin="round"/>')
        else:
            svg.append(f'<path d="{pts}" class="cara" stroke-width="{fmt(w)}" stroke-linecap="round" stroke-linejoin="round"/>')

# Las sombras: la huella desplazada hacia quien mira, como la sombra dura de los botones de la
# casa. La sombra geométrica completa costaba cuatrocientos polígonos más y no se veía mejor.
# Todas en un grupo con una sola opacidad: donde se solapan no oscurecen el doble.
if EXTRUIR:
    svg.append('<g class="sombra" filter="url(#sombra-suave)">')
    for b in edificios:
        h = b["h"]
        if h <= 4: continue                            # las casetas no proyectan
        sx_, sy_ = -0.5 * h, -0.14 * h   # la luz viene de arriba a la derecha: la sombra cae abajo a la izquierda, bajo la cara oscura
        an = b["anillo"]
        # la sombra es la huella desplazada MÁS el barrido de sus aristas: un volumen, no un recorte
        svg.append(f'<path d="{path([iso(x + sx_, y + sy_) for x, y in an])}"/>')
        n = len(an)
        for i in range(n):
            pp, q = an[i], an[(i + 1) % n]
            svg.append(f'<path d="{path([iso(*pp), iso(*q), iso(q[0] + sx_, q[1] + sy_), iso(pp[0] + sx_, pp[1] + sy_)])}"/>')
    svg.append('</g>')
    # El halo del local: un resplandor rojo difuso bajo el bloque, como el pin elegido en un mapa.
    _mio = next(b for b in edificios if b["local"])
    svg.append(f'<path class="halo" filter="url(#halo-suave)" d="{path([iso(*p) for p in _mio["anillo"]])}"/>')

# Edificios y árboles, de lejos a cerca. El espectador está al suroeste: lejos es x+y grande.
def profundidad(b):
    xs = [x for x, _ in b["anillo"]]; ys = [y for _, y in b["anillo"]]
    return (sum(xs) / len(xs)) + (sum(ys) / len(ys))

piezas = [("edificio", profundidad(b), b) for b in edificios]
for tipo, _, b in sorted(piezas, key=lambda t: t[1], reverse=True):
    if tipo == "arbol":   # ya no hay; se deja la rama por si vuelven
        i, x, y = b
        tx, ty = iso(x, y); cx_, cy_ = iso(x, y, 5 if EXTRUIR else 0)
        r = (2.2, 2.8)[i % 2] * ESCALA                          # dos tamaños alternos
        par = " par" if i % 2 else ""                            # en el móvil se apaga uno de cada dos
        # La copa es una elipse en la misma axonometría que los bloques, sin palito, con su sombra
        # arrojada abajo a la izquierda como la de ellos: la misma luz para todo.
        g = f'<g class="arbol{par}">'
        g += f'<ellipse class="copa-suelo" cx="{fmt(tx - r * 0.9)}" cy="{fmt(ty + r * 0.45)}" rx="{fmt(r)}" ry="{fmt(r * 0.55)}"/>'
        g += f'<ellipse class="copa" cx="{fmt(tx)}" cy="{fmt(ty - r * 0.5)}" rx="{fmt(r)}" ry="{fmt(r * 0.62)}"/>'
        g += f'<path class="copa-sombra" d="M{fmt(tx + r * 0.75)} {fmt(ty - r * 0.5 + r * 0.4)} A{fmt(r)} {fmt(r * 0.62)} 0 0 1 {fmt(tx - r * 0.75)} {fmt(ty - r * 0.5 - r * 0.15)} A{fmt(r * 0.72)} {fmt(r * 0.45)} 0 0 0 {fmt(tx + r * 0.75)} {fmt(ty - r * 0.5 + r * 0.4)} Z"/>'
        svg.append(g + '</g>')
        continue
    an = ccw(b["anillo"])
    h = b["h"] if EXTRUIR else 0
    if EXTRUIR:
        n = len(an)
        for i in range(n):
            p, q = an[i], an[(i + 1) % n]
            nx, ny = (q[1] - p[1]), -(q[0] - p[0])      # normal exterior de un anillo CCW
            if nx + ny >= 0: continue                      # esa cara mira al noreste: no se ve
            clase = "local-muro" if b["local"] else ("muro-o" if nx < ny else "muro-s")
            if h <= 4: clase = "caseta"
            quad = [iso(*p), iso(*q), iso(*q, h), iso(*p, h)]
            svg.append(f'<path class="{clase}" d="{path(quad)}"/>')
            # El contacto con el suelo: una sombra corta y difusa en la base, no un filete.
            if h > 4: svg.append(f'<path class="contacto" filter="url(#contacto-suave)" d="{path([iso(*p), iso(*q)], False)}"/>')
            # Las líneas de piso: una por planta, en la cara en sombra (la oeste) de todos los
            # edificios por igual; ya sin dientes gracias a la simplificación de huellas.
            if False:   # sin líneas de planta: la maqueta va lisa, como la vista de Apple
                pisos = " ".join(path([iso(*p, z), iso(*q, z)], False) for z in [3.2 * f for f in range(1, int(h / 3.2))])
                if pisos: svg.append(f'<path class="piso" d="{pisos}"/>')
    svg.append(f'<path class="{"local-techo" if b["local"] else ("caseta-techo" if h <= 4 else "techo")}" d="{path([iso(*p, h) for p in an])}"/>')

# ─── Etiquetas ──────────────────────────────────────────────────────────────
def angulo_pantalla(pts):
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    a = math.degrees(math.atan2(y2 - y1, x2 - x1))
    if a > 90: a -= 180
    if a <= -90: a += 180
    return a

def etiqueta(texto, x, y, ang=0, clase="rotulo"):
    # El giro va en un grupo y no en el texto: en el móvil el CSS escala el texto sobre sí mismo
    # (`transform-box: fill-box`), y un `transform` de CSS sustituye al del atributo. En el grupo,
    # el giro se conserva y el escalado se compone con él.
    svg.append(f'<g transform="rotate({fmt(ang)} {fmt(x)} {fmt(y)})"><text class="{clase}" x="{fmt(x)}" y="{fmt(y)}" text-anchor="middle">{texto}</text></g>')

_paseo = [c for c in calles if c["tipo"] == "trunk" and "Castellana" in c["nombre"]]
def lejos_del_paseo(x, y, m=30):
    """Para no rotular una calle menor encima del Paseo: Pedro Teixeira se metía en él."""
    for c in _paseo:
        for a, b in zip(c["pts"], c["pts"][1:]):
            ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay; l2 = dx * dx + dy * dy
            t = 0 if l2 == 0 else max(0, min(1, ((x - ax) * dx + (y - ay) * dy) / l2))
            if math.hypot(x - (ax + t * dx), y - (ay + t * dy)) < m: return False
    return True

def en_marco(x, y, margen=40):
    sx, sy = iso(x, y)
    return margen < sx < W - margen and 24 < sy < H - 40

def _dentro_pantalla(px, py, poli):
    d = False; n = len(poli)
    for i in range(n):
        x1, y1 = poli[i]; x2, y2 = poli[(i + 1) % n]
        if (y1 > py) != (y2 > py) and px < x1 + (py - y1) * (x2 - x1) / (y2 - y1): d = not d
    return d

# Las siluetas en pantalla de cada volumen (techo y caras visibles), para saber si un punto de
# calle queda tapado por un edificio que está delante: «Panamá» se rotulaba sobre su calle justo
# donde la calle desaparecía detrás de un bloque.
_siluetas = []
for b in edificios:
    an = ccw(b["anillo"]); h = b["h"] if EXTRUIR else 0
    _siluetas.append([iso(*p, h) for p in an])
    if EXTRUIR:
        n = len(an)
        for i in range(n):
            p, q = an[i], an[(i + 1) % n]
            if (q[1] - p[1]) + -(q[0] - p[0]) >= 0: continue
            _siluetas.append([iso(*p), iso(*q), iso(*q, h), iso(*p, h)])

def tapado(x, y):
    sx, sy = iso(x, y)
    return any(_dentro_pantalla(sx, sy, poli) for poli in _siluetas)

def tramo_de(nombre, tipo=None, lado=None):
    """El punto medio y el ángulo en pantalla del tramo con ese nombre que mejor se rotula:
    dentro del marco, lejos del Paseo si es una calle menor, y de entre esos el más cercano al
    local. Se prefieren tramos largos, que dan sitio al nombre."""
    cand = [c for c in calles if c["nombre"] == nombre and (tipo is None or c["tipo"] == tipo)]
    if not cand: return None
    menor = tipo != "trunk"
    mejor, mejor_d = None, 1e9
    for c in cand:
        for (a, b) in zip(c["pts"], c["pts"][1:]):
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            if L < 1: continue
            # Se rotula sobre la parte VISIBLE del tramo, no sobre su centro: un tramo largo que
            # entra por el borde tenía el centro fuera y se quedaba sin nombre (Pedro Teixeira).
            vistos = []
            for k in range(21):
                t = k / 20
                x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                if lado and not lado(x, y): continue
                if not en_marco(x, y): continue
                if menor and not lejos_del_paseo(x, y): continue
                if tapado(x, y): continue
                vistos.append((x, y))
            visible = len(vistos) * L / 20
            if visible < (22 if menor else 40): continue
            mx, my = vistos[len(vistos) // 2]
            dd = math.hypot(mx, my)
            if dd < mejor_d: mejor, mejor_d = (mx, my, a, b), dd
    if not mejor: return None
    mx, my, a, b = mejor
    return (mx, my, angulo_pantalla([iso(*a), iso(*b)]))

if True:
    tr = tramo_de("Paseo de la Castellana", "trunk", lado=lambda x, y: x > 70)
    if tr:
        x, y, a = tr; sx, sy = iso(x, y); etiqueta("Paseo de la Castellana", sx, sy + 4, a, "rotulo")
    # San Germán es la calle del local: es la única menor que se queda en el móvil.
    for nombre, texto, clase in (("Calle de San Germán", "San Germán", "rotulo-cerca"), ("Calle Pedro Teixeira", "Pedro Teixeira", "rotulo-menor")):
        tr = tramo_de(nombre, lado=(lambda x, y: y > 35) if "Germán" in nombre else None)
        if tr:
            x, y, a = tr; sx, sy = iso(x, y); etiqueta(texto, sx, sy + 3, a, clase)
if True:
    for nombre, texto in (("Calle del Doctor Fleming", "Doctor Fleming"), ("Calle Panamá", "Panamá"), ("Calle del Padre Damián", "Padre Damián")):
        tr = tramo_de(nombre)
        if tr:
            x, y, a = tr; sx, sy = iso(x, y); etiqueta(texto, sx, sy + 3, a, "rotulo-menor")
    defensa = [b for b in edificios if "Defensa" in b["nombre"]]
    if defensa:
        # El anillo más grande del complejo, y la etiqueta un poco por debajo de su centro
        # para que no pise el rótulo de San Germán, que corre justo por encima.
        b = max(defensa, key=lambda b: abs(area(b["anillo"])))
        an = b["anillo"]; cx = sum(x for x, _ in an) / len(an); cy = sum(y for _, y in an) / len(an)
        sx, sy = iso(cx, cy, b["h"] if EXTRUIR else 0); etiqueta("Ministerio de Defensa", sx, sy + 18, 0, "rotulo-lugar rotulo-izq")
    # Plaza y metro de Cuzco
    for e in els:
        t = e.get("tags", {})
        if e["type"] == "node" and t.get("railway") == "station":
            sx, sy = iso(*punto(e))
            svg.append(f'<g class="metro-g"><path class="chapa-pie" d="M{fmt(sx)} {fmt(sy)} L{fmt(sx)} {fmt(sy - 16)}"/><circle class="chapa-punto" cx="{fmt(sx)}" cy="{fmt(sy)}" r="2.4"/>')
            svg.append(f'<rect class="metro" x="{fmt(sx-9)}" y="{fmt(sy-34)}" width="18" height="18" rx="3"/>')
            svg.append(f'<text class="metro-txt" x="{fmt(sx)}" y="{fmt(sy-20.5)}" text-anchor="middle">M</text></g>')
            etiqueta("Cuzco", sx, sy + 12, 0, "rotulo-lugar rotulo-borde")
            break

# ─── La chapa, encima del 117. Sin punto: el bloque rojo ya canta solo, y el punto lo tapaba
#     (lo vio Mario en los bocetos). ────────────────────────────────────────────────────────
mio = next(b for b in edificios if b["local"])
px, py = iso(0, 0, mio["h"] if EXTRUIR else 0)
chapa_w = 122
svg.append(f'<g class="chincheta">')
svg.append(f'<path class="chapa-pie" d="M{fmt(px)} {fmt(py)} L{fmt(px)} {fmt(py - 24)}"/>')
svg.append(f'<circle class="chapa-punto" cx="{fmt(px)}" cy="{fmt(py)}" r="2.6"/>')
svg.append(f'<rect class="chapa" x="{fmt(px - chapa_w/2)}" y="{fmt(py - 46)}" width="{chapa_w}" height="23" rx="4"/>')
svg.append(f'<text class="chapa-txt" x="{fmt(px)}" y="{fmt(py - 30)}" text-anchor="middle">Castellana, 117</text>')
svg.append('</g>')
# El crédito que pide la licencia de los datos, discreto y fuera de la chapa de «cómo llegar».
svg.append(f'<text class="credito" x="10" y="{H - 8}">© OpenStreetMap</text>')
svg.append("</svg>")

SALIDA.write_text("\n".join(svg), encoding="utf-8")
print(f"{SALIDA.relative_to(RAIZ)}: {len(edificios)} edificios, {len(calles)} tramos, {len(verdes)} jardines, giro {math.degrees(ang):.1f}°, local en {mio['nombre'] or 'sin nombre'} ({mio['h']:.0f} m)")
