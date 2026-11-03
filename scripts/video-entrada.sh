#!/usr/bin/env sh
#
# La cinta de la portada de Cokima: de los vídeos de @cokimamadrid a lo que sirve la web.
#
# POR QUÉ EXISTE ESTE SCRIPT. Desde el 2026-11-03 la portada no es un vídeo hecho
# con IA sino diez planos de 3 s sacados de los vídeos de Instagram de Cokima
# (Mario: los de IG «son mucho mejores»). Sin esto, cambiar un plano obliga a
# reconstruir a mano los cortes, el oscurecido, el orden de las columnas y su
# desfase. Con esto es editar la lista de TRAMOS y un comando.
#
#   sh scripts/video-entrada.sh                       # la fototeca de este repo
#   sh scripts/video-entrada.sh fototeca/instagram/cokimamadrid
#
# Los vídeos de origen están en fototeca/instagram/cokimamadrid/, que no va en git:
# se bajan con scripts/fototeca.py (docs/fotografia.md, «La fototeca»).
#
# Necesita ffmpeg en el PATH. Si no está:  winget install Gyan.FFmpeg --scope user
# (y abrir una terminal nueva, o exportar FFMPEG con la ruta al binario).
#
# QUÉ SACA:
#
#   entrada.mp4 / .webm          608x1080  — móvil: los diez planos seguidos, 30 s.
#   entrada-col-1.mp4 / .webm    720x1280  — ordenador: tres columnas, cada una
#   entrada-col-2.mp4 / .webm    720x1280    con sus planos (12, 9 y 9 s).
#   entrada-col-3.mp4 / .webm    720x1280
#
# Los vídeos de Instagram son verticales. En el móvil encajan tal cual; en el
# ordenador, recortarlos a horizontal dejaba un tercio de su alto y además
# ampliado, así que van tres verticales en columnas, que juntas ocupan casi lo
# mismo que una pantalla apaisada.
#
# EL DESFASE de las columnas va horneado: la 2 empieza 1 s más adentro de su
# primer plano y la 3, 2 s. Como todos los planos duran 3 s, las tres cortan
# siempre a 1 s una de otra y nunca a la vez. brasa.js las arranca juntas y las
# recoloca con un reloj común si se separan (regla 25 de docs/movimiento.md).
#
# EL GRADO es más suave que el del vídeo de IA, que venía claro y plano, de
# catálogo: aquel grado (eq -0.10 / contraste 1.24 / saturación 0.62 y curvas a
# 0.86-0.74) dejaba estos casi negros y sin color. Se comparó en una hoja con el
# velo de la portada encima, y es el de la maqueta que Mario aprobó el 2026-11-03.
#
set -eu

FFMPEG="${FFMPEG:-ffmpeg}"
RAIZ="$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)"
ORIGEN="${1:-$RAIZ/fototeca/instagram/cokimamadrid}"
DESTINO="$RAIZ/apps/cokima/src/assets/video"

if [ ! -d "$DESTINO" ]; then
  echo "No encuentro apps/cokima/src/assets/video/ — ¿se ha movido?" >&2
  exit 1
fi
if [ ! -d "$ORIGEN" ]; then
  echo "No existe la carpeta de vídeos: $ORIGEN" >&2
  echo "Bájalos con scripts/fototeca.py (docs/fotografia.md, «La fototeca»)." >&2
  exit 1
fi
if ! command -v "$FFMPEG" >/dev/null 2>&1; then
  echo "No encuentro ffmpeg. Instálalo con 'winget install Gyan.FFmpeg --scope user'" >&2
  echo "o exporta FFMPEG con la ruta al binario." >&2
  exit 1
fi

# ── Los parámetros, que es lo único que se toca ──────────────────────────────

# Los planos: nombre, vídeo de origen (sin .mp4) y segundo en que empieza. Todos
# de la propia cuenta y de platos de la carta actual, sin texto encima ni caras;
# ninguno es de los que usa Nosotros, que se queda con el local y el equipo. Este
# orden es el del móvil. Para cambiar uno, se cambia aquí y se mira su hoja de
# fotogramas: ffmpeg -i VIDEO -vf "fps=1,scale=144:256,tile=10x3" -frames:v 1 hoja.png
TRAMOS="enoki      cocina_fideua__DeWktOvBJNA-1                  9
ceviche    cocina_ceviche-de-corvina__DcgIrkstdQL-1      18
fideua     cocina_fideua__DeWktOvBJNA-1                  1
tataki     cocina_tataki-de-atun__DZ987NPtikY-1          15
dumpling   cocina_dumpling-de-chipirones__DdoN2T5Nb-S-1  2
gilda      cocina_gilda-de-pastrami__DbYCDxWtBLV-1       16
tartar     cocina_steak-tartar__DON_GGvDVgb-1            16
softshell  cocina_soft-shell-crab__DZHzLGctasW-1         13.5
torrija    cocina_torrija__DWBt71gDBL--1                 8
tarta      plato_tarta-de-queso__DQ9JHdvDbSv-1           10"

# Las columnas del ordenador, de izquierda a derecha, y cuánto se adelanta cada
# una. Que no coincidan dos planos del mismo plato a la vez (la fideuá y su enoki
# van en columnas distintas y a distinta altura del bucle).
COL_1="enoki tataki tartar torrija"
COL_2="ceviche gilda softshell"
COL_3="dumpling tarta fideua"
DESFASE_2=1
DESFASE_3=2

DURA=3   # Lo que dura cada plano. Si cambia, cambian los desfases.

# eq       baja un poco la exposición y sube algo el contraste.
# curves   baja las luces altas algo más en el azul que en el rojo, que apaga el
#          acero y la madera clara sin tocar la brasa ni el plato.
# vignette cierra los bordes, que es lo que lo empuja al segundo plano.
GRADO="eq=brightness=-0.04:contrast=1.12:saturation=0.88,curves=r='0/0 0.5/0.47 1/0.93':g='0/0 0.5/0.45 1/0.89':b='0/0 0.5/0.43 1/0.85',vignette=angle=PI/4"

# 25 fps y no 30: es un fondo, y a 25 no se nota y el archivo baja.
FPS=25

CRF_H264=29   # Suelo universal.
# El WebM es el que piden primero Chrome, Firefox y Safari. A 36, como con el
# vídeo de IA, estos planos —con más detalle y movimiento— pesaban más que el
# MP4 (2,84 frente a 2,52 MB); a 40 bajan a ~2 MB y, comparado un fotograma a
# tamaño real, no se distingue.
CRF_VP9=40

# ── La conversión ───────────────────────────────────────────────────────────

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Cada plano se corta una vez, ya oscurecido, a 720x1280 y casi sin pérdida; de
# ahí salen el móvil y las columnas. -an porque la cinta no lleva sonido.
echo "Origen:  $ORIGEN"
echo "Destino: $DESTINO"
echo
echo "→ cortando los planos…"
echo "$TRAMOS" | while read -r nombre video desde; do
  [ -n "$nombre" ] || continue
  if [ ! -f "$ORIGEN/$video.mp4" ]; then
    echo "Falta $ORIGEN/$video.mp4" >&2
    exit 1
  fi
  "$FFMPEG" -v error -y -ss "$desde" -i "$ORIGEN/$video.mp4" -t "$DURA" -an \
    -vf "scale=720:1280:flags=lanczos,setsar=1,fps=${FPS},${GRADO}" \
    -c:v libx264 -crf 14 -preset medium -pix_fmt yuv420p "$TMP/$nombre.mp4" </dev/null
done

# Une planos en un solo vídeo, sin volver a comprimir.
une() {
  salida="$1"; shift
  : > "$TMP/lista.txt"
  for n in "$@"; do echo "file '$TMP/$n.mp4'" >> "$TMP/lista.txt"; done
  "$FFMPEG" -v error -y -f concat -safe 0 -i "$TMP/lista.txt" -c copy "$salida"
}

# Codifica para la web. +faststart pone el índice al principio, que es lo que
# permite empezar a reproducir sin haber descargado el archivo entero.
codifica() {
  entrada="$1"; filtros="$2"; salida="$3"
  "$FFMPEG" -v error -y -i "$entrada" -filter_complex "$filtros" -an \
    -c:v libx264 -profile:v high -level 4.0 -crf "$CRF_H264" -preset slow \
    -pix_fmt yuv420p -movflags +faststart "${DESTINO}/${salida}.mp4"
  "$FFMPEG" -v error -y -i "$entrada" -filter_complex "$filtros" -an \
    -c:v libvpx-vp9 -crf "$CRF_VP9" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
    -pix_fmt yuv420p "${DESTINO}/${salida}.webm"
}

# El desfase: se empieza N s más adentro y esos N s se ponen al final, así que
# el bucle no se nota y los cortes caen N s antes que en la columna 1.
adelanta() {
  if [ "$1" = 0 ]; then echo "null"; else
    echo "split[x][y];[x]trim=start=$1,setpts=PTS-STARTPTS[a];[y]trim=end=$1,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1"
  fi
}

echo "→ móvil (608x1080)…"
# shellcheck disable=SC2046
une "$TMP/movil.mp4" $(echo "$TRAMOS" | awk 'NF { print $1 }')
codifica "$TMP/movil.mp4" "scale=608:1080:flags=lanczos" "entrada"

echo "→ columnas del ordenador (720x1280)…"
# shellcheck disable=SC2086
une "$TMP/col-1.mp4" $COL_1
# shellcheck disable=SC2086
une "$TMP/col-2.mp4" $COL_2
# shellcheck disable=SC2086
une "$TMP/col-3.mp4" $COL_3
codifica "$TMP/col-1.mp4" "null" "entrada-col-1"
codifica "$TMP/col-2.mp4" "$(adelanta "$DESFASE_2")" "entrada-col-2"
codifica "$TMP/col-3.mp4" "$(adelanta "$DESFASE_3")" "entrada-col-3"

echo
echo "Listo. Pesos:"
ls -la "$DESTINO" | awk 'NR>3 { printf "  %-24s %8.2f MB\n", $9, $5/1048576 }'
echo
echo "AHORA MIRA DOS COSAS, que el script no puede decidir:"
echo "  1. Que ningún plano lleve texto encima o una cara en sus 3 s:"
echo "     ffmpeg -i ${DESTINO}/entrada.mp4 -vf \"fps=2,scale=135:240,tile=10x6\" -frames:v 1 hoja.jpg"
echo "  2. Que el oscurecido deje ver el plato con el velo de la portada encima,"
echo "     en la página construida y no en el archivo suelto."
echo
echo "Los nombres no cambian, así que la página no se toca. El hash de la URL lo"
echo "pone Vite al construir: los navegadores no se quedan con el viejo."
