#!/usr/bin/env sh
#
# Avisa —sin bloquear— cuando un commit deja la documentación desfasada.
#
# POR QUÉ EXISTE. El CLAUDE.md lleva siete puntos de cierre desde hace meses y aun
# así el 2026-09-07 se encontró la tabla de docs/estado.md llamando «caso abierto»
# a un documento titulado «resuelto», y un registro entero hablando de una rama que
# ya no existe. Una regla que nadie comprueba se incumple sola. Esto la comprueba.
#
# NO BLOQUEA a propósito: un commit de una línea no merece fricción, y un hook que
# estorba se acaba desactivando. Avisa, y el aviso llega al agente con el mismo peso
# que si lo dijera Mario.
#
# Lo lanza el hook PreToolUse sobre Bash de .claude/settings.json, filtrado a
# `git commit` con el campo `if`. Recibe el JSON de la llamada por stdin y no lo usa:
# le basta con mirar el índice de git.

set -u

raiz=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$raiz" || exit 0

staged=$(git diff --cached --name-only 2>/dev/null)
[ -z "$staged" ] && exit 0

avisos=""

# 1. Código sin documentación. El punto 1 del cierre: estado.md, siempre.
if printf '%s\n' "$staged" | grep -qE '^(apps|packages)/' \
   && ! printf '%s\n' "$staged" | grep -q '^docs/estado\.md$'; then
  avisos="Este commit toca codigo (apps/ o packages/) y no lleva docs/estado.md. CLAUDE.md, cierre punto 1: el punto de entrada se actualiza siempre."
fi

# 2. El corte de estado.md, que es lo que dice si el documento esta al dia.
hoy=$(date +%F)
corte=$(grep -m1 '^- \*\*Corte:\*\*' docs/estado.md 2>/dev/null | grep -o '[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}')
if [ -n "$corte" ] && [ "$corte" != "$hoy" ]; then
  extra="El Corte de docs/estado.md pone $corte y hoy es $hoy. Si esta tanda cambia algo del estado, actualizalo antes de commitear."
  if [ -n "$avisos" ]; then avisos="$avisos $extra"; else avisos="$extra"; fi
fi

# 3. Un documento vivo sin su linea de estado. La regla de los tres estados.
sin_estado=""
for f in $(printf '%s\n' "$staged" | grep -E '^docs/[^/]+\.md$'); do
  [ -f "$f" ] || continue
  head -5 "$f" | grep -q '\*\*Estado:' || sin_estado="$sin_estado $f"
done
if [ -n "$sin_estado" ]; then
  extra="Sin linea de Estado en la cabecera:$sin_estado. CLAUDE.md, los tres estados de un documento: vivo, receta o cerrado."
  if [ -n "$avisos" ]; then avisos="$avisos $extra"; else avisos="$extra"; fi
fi

[ -z "$avisos" ] && exit 0

printf '{"systemMessage":"Documentacion: %s","hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"AVISO DE DOCUMENTACION (no bloquea el commit, pero atiendelo antes de darlo por cerrado): %s"}}\n' \
  "$avisos" "$avisos"
exit 0
