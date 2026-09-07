#!/usr/bin/env sh
#
# La cinta de la entrada de Cokima: de lo que entrega Higgsfield a lo que sirve la web.
#
# POR QUÉ EXISTE ESTE SCRIPT. El vídeo es provisional y va a cambiar. Sin esto,
# cambiarlo obliga a reconstruir a mano un grado de color calibrado contra el
# póster y dos recortes, a partir de un mensaje de commit. Con esto es un
# comando, y lo que hay que revisar a ojo queda acotado a una cosa: si el grado
# le sienta bien al material nuevo.
#
#   sh scripts/video-entrada.sh "/c/PHSPORT/GRUPO TOMBO/Cokima - Kitchen Madness/Vídeos/Cokima Vídeo.mp4"
#
# Necesita ffmpeg en el PATH. Si no está:  winget install Gyan.FFmpeg --scope user
# (y abrir una terminal nueva, o exportar FFMPEG con la ruta al binario).
#
# QUÉ SACA, y por qué son dos cortes y no uno:
#
#   entrada.mp4 / .webm         608x1080  — móvil. Vertical, que es donde se diseñó.
#   entrada-ancho.mp4 / .webm  1280x720   — escritorio.
#
# El vertical en una pantalla de escritorio se amplía 3,13x (medido a 1920x1080:
# hueco de 1905px de ancho sobre 608px nativos) y se ve blando. Y al revés, servir
# el horizontal en móvil desperdicia tres de cada cuatro píxeles, porque el
# `object-fit: cover` solo enseña la banda central. Cada uno a lo suyo.
#
# EL GRADO. Higgsfield entrega luz de catálogo —claro y plano— y el póster de la
# entrada es casi negro, con el neón al fondo y solo el plato encendido. Sin
# tratar, parecen dos webs peleándose en la misma pantalla. Los valores de abajo
# se calibraron comparando fotogramas contra ese póster; se descartó una versión
# suave (seguía siendo de día) y una fuerte (aplastaba el plato).
#
# SI EL VÍDEO NUEVO VIENE CON OTRA LUZ, lo único que hay que retocar es el bloque
# GRADO. La forma de hacerlo no es a ojo sobre el vídeo entero, sino así:
#
#   ffmpeg -ss 25 -i ORIGINAL -vf "$CROP_MOVIL,$GRADO,scale=300:-1" -frames:v 1 a.png
#
# sacando dos o tres fotogramas —el más claro del montaje y uno de sala— y
# poniéndolos al lado del póster (apps/cokima/src/assets/entrada-poster.jpg).
# El objetivo no es "que se vea bien": es que los negros y la calidez casen con él.
#
set -eu

FFMPEG="${FFMPEG:-ffmpeg}"
ORIGINAL="${1:-}"
DESTINO="$(CDPATH='' cd -- "$(dirname -- "$0")/../apps/cokima/src/assets/video" 2>/dev/null && pwd)" || {
  echo "No encuentro apps/cokima/src/assets/video/ — ¿se ha movido?" >&2
  exit 1
}

if [ -z "$ORIGINAL" ]; then
  echo "Uso: sh scripts/video-entrada.sh <ruta-del-video-original>" >&2
  exit 1
fi
if [ ! -f "$ORIGINAL" ]; then
  echo "No existe: $ORIGINAL" >&2
  exit 1
fi
if ! command -v "$FFMPEG" >/dev/null 2>&1; then
  echo "No encuentro ffmpeg. Instálalo con 'winget install Gyan.FFmpeg --scope user'" >&2
  echo "o exporta FFMPEG con la ruta al binario." >&2
  exit 1
fi

# ── Los parámetros, que es lo único que se toca ──────────────────────────────

# Recorte vertical: 608x1080 tomados del centro de un 1920x1080. Centrado porque
# no hay un encuadre bueno para las siete escenas a la vez; a los platos les va
# bien y a los neones les corta el texto, que es justo la banda que tapa el
# rótulo. Si el material nuevo tiene el sujeto descentrado, mover el 656.
CROP_MOVIL="crop=608:1080:656:0"

# El horizontal no recorta: el original ya es 16:9. Solo baja de tamaño.
ESCALA_ANCHO="scale=1280:720"

# eq       baja exposición y sube contraste.
# curves   baja las luces altas MÁS EN EL AZUL QUE EN EL ROJO. Es el paso que
#          apaga la madera clara y la cerveza sin tocar la brasa, y el que de
#          verdad hace que case con el póster.
# vignette cierra los bordes, que es lo que lo empuja al segundo plano.
GRADO="eq=brightness=-0.10:contrast=1.24:saturation=0.62,curves=r='0/0 0.5/0.44 1/0.86':g='0/0 0.5/0.41 1/0.80':b='0/0 0.5/0.38 1/0.74',vignette=angle=PI/4"

# 25 fps y no 30: es un fondo con movimientos lentos de cámara, y a 25 no se
# nota la diferencia y el archivo baja. Si el montaje nuevo tuviera cortes
# rápidos, subirlo otra vez a 30.
FPS=25

CRF_H264=29   # Suelo universal.
CRF_VP9=36    # Comprime mejor a igual calidad percibida.

# ── La conversión ───────────────────────────────────────────────────────────
# -an porque la cinta es decorativa y no lleva sonido: si el original trae pista
# de audio, aquí se cae. +faststart pone el índice al principio, que es lo que
# permite empezar a reproducir sin haber descargado el archivo entero.

convierte() {
  filtros="$1"
  salida="$2"

  "$FFMPEG" -v error -y -i "$ORIGINAL" \
    -vf "${filtros},${GRADO},fps=${FPS}" -an \
    -c:v libx264 -profile:v high -level 4.0 -crf "$CRF_H264" -preset slow \
    -pix_fmt yuv420p -movflags +faststart "${DESTINO}/${salida}.mp4"

  "$FFMPEG" -v error -y -i "$ORIGINAL" \
    -vf "${filtros},${GRADO},fps=${FPS}" -an \
    -c:v libvpx-vp9 -crf "$CRF_VP9" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
    -pix_fmt yuv420p "${DESTINO}/${salida}.webm"
}

echo "Original: $ORIGINAL"
echo "Destino:  $DESTINO"
echo
echo "→ vertical (móvil, 608x1080)…"
convierte "$CROP_MOVIL" "entrada"
echo "→ horizontal (escritorio, 1280x720)…"
convierte "$ESCALA_ANCHO" "entrada-ancho"

echo
echo "Listo. Pesos:"
ls -la "$DESTINO" | awk 'NR>3 { printf "  %-24s %8.2f MB\n", $9, $5/1048576 }'
echo
echo "AHORA MIRA DOS COSAS, que el script no puede decidir:"
echo "  1. Que el grado case con el póster. Saca fotogramas y ponlos al lado"
echo "     de apps/cokima/src/assets/entrada-poster.jpg."
echo "  2. Que el recorte vertical no parta el sujeto en ninguna escena:"
echo "     ffmpeg -i ORIGINAL -vf \"${CROP_MOVIL},fps=1/2,scale=270:-1,tile=7x2\" -frames:v 1 hoja.jpg"
echo
echo "Los nombres no cambian, así que el componente no se toca. El hash de la"
echo "URL lo pone Vite al construir: los navegadores no se quedan con el viejo."
