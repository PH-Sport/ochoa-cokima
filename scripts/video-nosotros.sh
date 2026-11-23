#!/usr/bin/env sh
#
# Los vídeos del collage de Nosotros de Cokima: de los vídeos de @cokimamadrid a lo que sirve la web.
#
# POR QUÉ EXISTE ESTE SCRIPT. Las cinco tarjetas del collage (src/data/nosotros.ts) llevan un corte de
# los vídeos de Instagram, y sin esto cambiar uno obliga a reconstruir a mano el tramo y la compresión.
# Con esto es editar la lista de abajo y un comando. La portada usa otros planos, de platos
# (scripts/video-entrada.sh): la portada se queda con la cocina y los platos, y Nosotros con el local
# y el pase, para que no se repita ninguno.
#
#   sh scripts/video-nosotros.sh                       # la fototeca de este repo
#   sh scripts/video-nosotros.sh fototeca/instagram/cokimamadrid
#
# Los vídeos de origen están en fototeca/instagram/cokimamadrid/, que no va en git: se bajan con
# scripts/fototeca.py (docs/fotografia.md, «La fototeca»).
#
# Necesita ffmpeg en el PATH. Si no está:  winget install Gyan.FFmpeg --scope user
#
# QUÉ SACA, en apps/cokima/src/assets/video/, cinco parejas:
#
#   nosotros-<id>.mp4   540x960, H.264, sin sonido, con el índice al principio para que arranque
#                       sin descargarlo entero. Unos 3,4 MB los cinco.
#   nosotros-<id>.jpg   Su primer fotograma: va debajo del vídeo, en el mismo sitio, para que la
#                       tarjeta nunca se quede sin imagen (regla 31 de docs/movimiento.md).
#
# LOS TRAMOS empiezan medio segundo más tarde de lo evidente porque varios planos abren con un
# fotograma de transición: el de Argüelles, en rojo liso. El mural (2,5 a 8,5 s) es solo manos: Mario
# no quiere caras del equipo. La parrilla va a CRF 29 porque el fuego pesa el doble a CRF 27 y a ese
# tamaño no se distingue.
set -eu

RAIZ=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ORIGEN=${1:-"$RAIZ/fototeca/instagram/cokimamadrid"}
DESTINO="$RAIZ/apps/cokima/src/assets/video"
FFMPEG=${FFMPEG:-ffmpeg}

corta() { # id  vídeo de origen  desde  hasta  crf
  entrada="$ORIGEN/$2.mp4"
  [ -f "$entrada" ] || { echo "Falta $entrada: bájalo con scripts/fototeca.py" >&2; exit 1; }
  "$FFMPEG" -v error -y -ss "$3" -to "$4" -i "$entrada" -an \
    -vf "scale=540:-2:flags=lanczos,fps=30,format=yuv420p" \
    -c:v libx264 -preset slow -crf "$5" -profile:v high -movflags +faststart \
    "$DESTINO/nosotros-$1.mp4"
  "$FFMPEG" -v error -y -i "$DESTINO/nosotros-$1.mp4" -frames:v 1 -q:v 4 "$DESTINO/nosotros-$1.jpg"
  echo "nosotros-$1: $(du -k "$DESTINO/nosotros-$1.mp4" | awk '{print $1}') KB y $(du -k "$DESTINO/nosotros-$1.jpg" | awk '{print $1}') KB"
}

#     id         vídeo de origen                          desde  hasta  crf
corta arguelles  local_entrada__DHa2iMZNh8p-1             1.6    7.0    27
corta fuego      cocina_cocinero-en-sarten__DZfAlbINfIO-1 1.5    9.0    29
corta pase       local_mural-madness__DJcFEQ-tunn-1       2.5    8.5    27
corta favoritas  plato_croquetas__C6tJ19ktThn-1           0      10     27
corta mesa       local_entrada__DHa2iMZNh8p-1             12.0   19.0   27
