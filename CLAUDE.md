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

Al terminar en una máquina: subir la rama de trabajo y dejar el corte de `docs/estado.md` con la
fecha del día. Lo que no está en `origin` no existe para la otra máquina.
