#!/usr/bin/env sh
#
# La imagen que sale al compartir el enlace de la web del grupo (WhatsApp y demás):
# apps/grupo/public/images/compartir.jpg. La receta y el porqué, en docs/grupo-tombo-web.md.
#
# Es la portada en pequeño: las dos mitades, Cokima a la izquierda y Ochoa a la derecha, con las mismas
# fotos y el mismo tono de velo, y en el centro el logo del grupo en blanco sobre su pastilla negra,
# más grande que en la web para que se lea en la vista previa de un chat. 1200x630, que es lo que
# WhatsApp enseña en grande.
#
# Uso, desde la raíz del repo (necesita ffmpeg):
#   sh scripts/compartir-grupo.sh
set -eu

A=apps/grupo
SALIDA=$A/public/images/compartir.jpg

ffmpeg -hide_banner -loglevel error -y \
  -i "$A/src/assets/cokima-portada.jpg" \
  -i "$A/src/assets/ochoa-portada.jpg" \
  -i "$A/public/images/logo-blanco.png" \
  -f lavfi -i "color=c=0x0b0a0a:s=600x236,format=rgba" \
  -filter_complex "
    [0:v]format=rgb24,scale=-1:630:in_range=full:out_range=full,crop=600:630:(iw-600)/2:0,drawbox=x=0:y=0:w=iw:h=ih:color=0x0e0907@0.42:t=fill[izq];
    [1:v]format=rgb24,scale=-1:630:in_range=full:out_range=full,crop=600:630:(iw-600)/2:0,drawbox=x=0:y=0:w=iw:h=ih:color=0x1a1a1a@0.22:t=fill[der];
    [izq][der]hstack=inputs=2[fondo];
    [3:v]geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(pow(max(abs(X-W/2)-(W/2-22),0),2)+pow(max(abs(Y-H/2)-(H/2-22),0),2),22*22),255,0)'[pastilla];
    [fondo][pastilla]overlay=(W-w)/2:(H-h)/2:format=rgb[con_pastilla];
    [2:v]format=rgba,scale=500:-1[logo];
    [con_pastilla][logo]overlay=(W-w)/2:(H-h)/2:format=rgb,scale=out_range=full,format=yuvj420p[sale]
  " \
  -map "[sale]" -frames:v 1 -q:v 3 "$SALIDA"

echo "$SALIDA: $(wc -c < "$SALIDA" | tr -d ' ') bytes"
