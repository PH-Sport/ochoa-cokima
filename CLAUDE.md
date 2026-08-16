# Instrucciones del repositorio

## Antes de nada: sincronizar, y luego leer

**Este proyecto se desarrolla desde dos ordenadores** —el HP de Mario y un Mac prestado—, nunca a
la vez. Los árboles se separan enseguida, y el 2026-08-16 costó un susto: una rama local llamada
`preview` que en realidad era otra, con diez commits listos para acabar donde no debían.

**Al abrir la sesión, en este orden y antes de leer una sola línea de documentación:**

```bash
git fetch --all --prune
git branch -vv                              # a dónde apunta DE VERDAD cada rama local
git checkout preview && git pull --ff-only  # si se niega, hay divergencia real: parar y avisar
git checkout tmp/entrada-cokima             # la rama de trabajo viva
pnpm install
```

El orden importa: `fetch` mueve las referencias remotas, **no** tu árbol de trabajo. Leer
`docs/estado.md` antes del `pull` es leer una versión caducada creyéndola al día.

**Y entonces sí, leer:** `docs/estado.md` §0 (dónde estamos) y §1.1 (cambiar de máquina), más
`docs/cokima-el-rediseno.md`, que es el porqué del trabajo en curso. **`docs/estado.md` es el
punto de entrada de todo lo demás.**

## Qué es esto

Monorepo con las dos webs del Grupo Tombo: **Cokima** y **Los Ochoa**. Astro 6 estático con
adaptador Vercel (fijado a `@astrojs/vercel` v10 — **v11 es Astro 7 alpha, no subir**), pnpm 9
workspaces **sin Turborepo**.

```
apps/{cokima,ochoa}              las dos webs
packages/{ui,content,tracking,config}
docs/                            estado.md manda; lo demás cuelga de él
```

## Comandos

```bash
pnpm test                 # los 4 paquetes @tombo/*
pnpm build                # construye las dos apps
pnpm --filter ochoa build # una sola
```

**Los filtros de pnpm van por nombre, no por ruta** (`--filter ochoa`, no `--filter apps/ochoa`):
los de ruta no casan en Windows, y este repo se trabaja también desde el HP.

`SITE_URL` no hace falta en local (cae a `http://localhost:4321`); en producción su ausencia
rompe el build a propósito, y así debe seguir.

## Reglas que ya han costado tiempo

- **`packages/ui` no lleva ni un color ni una fuente de marca.** Es la regla de oro. Cada app
  inyecta sus tokens `--t-*`; lo que es de marca entra por parámetro o por atributo de contrato.
- **Ni un milisegundo suelto en los componentes.** Toda duración y toda curva salen de
  `tokens.css` de cada app. Las reglas numeradas de `docs/movimiento.md` son vinculantes: nada de
  bounce, solo `transform`/`opacity`/`clip-path`, entrar lento y responder rápido.
- **Verificar en el navegador midiendo, no leyendo el código.** Píxeles y visibilidad real; la
  caché de Vite miente. Ver `docs/barra-del-navegador-ios.md` §8, que vale más que su arreglo.
- **Los `pnpm dev` lanzados en segundo plano desde el agente se mueren solos**, en las dos
  máquinas. Lanzarlos desde una terminal propia.
- **No sondear las previews de Vercel en bucle:** activa el checkpoint anti-bot y a partir de ahí
  todo devuelve `403`, con lo que los `grep` dan cero y parece que el despliegue ha fallado. El
  estado se pregunta a la API de Vercel.
- **Las dos casas son distintas y no se cruzan.** Ochoa es transacción social, Cokima es
  experiencia pícara. Ni contenido inventado, ni piezas de una en la otra.

## Ramas

`main` es producción y **hoy no sube nada ahí**. `preview` es desarrollo: todo se integra en esa.
Las `tmp/*` son temporales y esperan decisión de Mario: o se fusionan o se descartan, y se borran
en los dos casos. **Una viva cada vez** — llegó a haber dos, en dos ordenadores, y eso fue el lío.

## Al cerrar: escribir para el que venga

**La continuidad la sostiene el repositorio, no la memoria de nadie.** La del agente se borra al
acabar la sesión, y la de Mario cambia de ordenador. Si algo importa y no está escrito aquí, se ha
perdido — y lo que se pierde antes es siempre lo mismo: **el porqué**. Un agente que solo lee
*qué* se hizo vuelve a proponer lo que ya se descartó, y esa vuelta ya se ha pagado más de una vez.

Esto no es un ideal: es el estándar que este repositorio ya tiene. Los últimos veinte commits
promedian **29 líneas** de mensaje, y `docs/cokima-el-rediseno.md` dedica secciones enteras a *lo
que se propuso y se descartó*, *lo que NO está y es deliberado*, *las trampas que costaron tiempo*
y *lo que no hay que volver a discutir*. **Mantener ese listón, no bajarlo.**

Antes de cerrar una tanda:

1. **`docs/estado.md`, siempre.** Es el punto de entrada. Actualizar el corte con la fecha del día
   y la §0 «por dónde seguir» —qué está hecho, qué está a medias y a propósito, qué espera a
   Mario—. Un documento que dice algo que ya no es cierto hace más daño que no decir nada.
2. **El commit explica por qué, no qué.** El diff ya cuenta el qué. El mensaje cuenta el problema
   real, qué se probó y falló, y qué decisión se tomó — con el número medido, no con la impresión.
3. **Lo descartado se escribe con su motivo.** Si no, vuelve. Cada dirección que Mario paró está
   registrada precisamente para que nadie la reproponga creyéndola nueva.
4. **Las trampas se convierten en regla.** Lo que costó tiempo y no daba ningún error va a las
   reglas numeradas de `docs/movimiento.md` o a la §correspondiente del caso. Ahí está el valor
   que no se ve en el código.
5. **Lo medido va con su número y su método.** «Se ve bien» no es un dato; «desvío 0 en x, y y
   ancho, medido con la sesión limpia» sí. Y si algo no se ha medido, se dice que no se ha medido.
6. **Una decisión grande merece documento propio**, con el molde de `cokima-el-rediseno.md`: el
   problema real, la distinción que ordena, lo descartado, y lo que no hay que volver a discutir.
7. **Nada inventado.** Ni contenido de las cartas, ni horarios, ni datos del local, ni resultados
   que no se hayan comprobado. Donde falta material se deja el hueco marcado y se dice que falta.

Y lo logístico, que sin ello lo anterior no viaja: **subir la rama de trabajo**. Lo que no está en
`origin` no existe para la otra máquina.
