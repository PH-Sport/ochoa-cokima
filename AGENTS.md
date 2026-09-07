# Instrucciones para agentes

**Las instrucciones completas de este repositorio están en [`CLAUDE.md`](./CLAUDE.md). Léelo antes
de hacer nada.** Este fichero existe solo para que las encuentres uses el agente que uses; si algo
de aquí discrepa de `CLAUDE.md`, **manda `CLAUDE.md`**.

Se repite abajo únicamente el arranque, porque es lo que no puede fallar.

## Antes de nada: sincronizar, y luego leer

**Este proyecto se desarrolla desde dos ordenadores** —el HP de Mario y un Mac prestado—, nunca a
la vez. Los árboles se separan enseguida.

```bash
git fetch --all --prune
git branch -vv                              # a dónde apunta DE VERDAD cada rama local
git checkout preview && git pull --ff-only  # si se niega, hay divergencia real: parar y avisar
git checkout tmp/entrada-cokima             # la rama de trabajo viva
pnpm install
```

El orden importa: `fetch` mueve las referencias remotas, **no** tu árbol de trabajo. Leer
`docs/estado.md` antes del `pull` es leer una versión caducada creyéndola al día.

**Y entonces sí, leer:** `CLAUDE.md` entero, `docs/estado.md` §0 y §1.1, y
`docs/cokima-el-rediseno.md`.

**Y antes de reportar nada o de dar algo por verificado:** `docs/trabajar-con-mario.md` y
`docs/metodo.md`. Cuentan con quién se trabaja y cómo se comprueban las cosas aquí — lo que no se
deduce leyendo el código. Los identificadores que cuesta recuperar, en `docs/recursos.md`.

## Y al cerrar

`CLAUDE.md` § «Al cerrar: escribir para el que venga». **No es opcional:** la continuidad entre
las dos máquinas la sostiene lo que se escribe, no la memoria de nadie.
