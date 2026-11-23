#!/usr/bin/env sh
#
# Decide si Vercel tiene que construir esta app o puede saltarse el despliegue.
#
# OJO CON EL CODIGO DE SALIDA: Vercel lo interpreta al reves de lo habitual.
#   0 -> se SALTA el build      1 -> se construye
# Y da la casualidad de que `git diff --quiet` devuelve exactamente eso: 0 si no
# hay cambios y 1 si los hay. Por eso el script termina en ese comando y no
# necesita traducir nada.
#
# Uso, desde el vercel.json de cada app:
#   sh ../../scripts/vercel-ignore.sh apps/cokima
#
# Antes de esto, cualquier commit reconstruia las dos webs. Un commit que solo
# tocaba docs/ o la otra app disparaba igualmente los dos despliegues.

app="$1"

# Sin argumento no hay forma de decidir: se construye, que es el lado seguro.
[ -n "$app" ] || exit 1

# CON QUE SE COMPARA: con el commit del ultimo despliegue que salio bien en esta
# rama, que Vercel da en VERCEL_GIT_PREVIOUS_SHA (solo existe durante este paso).
# Antes se comparaba con HEAD^, el commit anterior, y eso solo vale cuando cada
# push trae un commit: el 2026-10-29 un push de diez commits a preview acababa en
# uno de solo docs/, y Vercel se salto el despliegue entero aunque los nueve de
# antes cambiaban la web de Ochoa.
base="$VERCEL_GIT_PREVIOUS_SHA"

# Sin despliegue anterior en la rama (el primero de una rama nueva) no hay con
# que comparar: se construye.
[ -n "$base" ] || exit 1

# El clon que hace Vercel es superficial y puede no traer ese commit, si quedo
# muchos commits atras. Si no esta, no se puede comparar: se construye.
git cat-file -e "$base^{commit}" 2>/dev/null || exit 1

# Este script corre desde el Root Directory del proyecto (apps/<app>), y las
# rutas de `git diff` se resuelven contra el directorio actual. Sin este cd, la
# comparacion se haria sobre rutas que no existen y no detectaria nada.
cd "$(git rev-parse --show-toplevel)" || exit 1

# Las dos apps dependen de los cuatro paquetes del workspace, asi que un cambio
# en packages/ -o en el lockfile, o en la configuracion del workspace- si tiene
# que reconstruir las dos. Lo que ya no reconstruye nada es un cambio en docs/,
# ni un cambio en la app de la otra marca.
git diff --quiet "$base" HEAD -- \
  "$app" \
  packages \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  package.json
