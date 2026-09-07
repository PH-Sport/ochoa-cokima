# Archivo — casos cerrados

> **Estado: cerrado** · no se actualiza · última poda 2026-09-07

**Nada de aquí describe el presente.** Son documentos de fases terminadas, guardados por una sola
razón: **el porqué**. Si vuelves a leerlos es para saber por qué algo se decidió así, nunca para
saber cómo está la web hoy — eso está en `../estado.md`, que es el punto de entrada.

**No se actualizan.** Un documento cerrado que alguien retoca deja de ser un registro y pasa a ser
una fuente que compite con `estado.md`. Si algo de aquí sigue siendo verdad y hace falta, se
**copia** a un documento vivo; el original se queda como estaba.

**Consecuencia, y es deliberada:** los enlaces internos de estos documentos apuntan a rutas que ya
no existen —`docs/superpowers/…`, sobre todo—. No se arreglan. Un registro histórico con las rutas
reescritas deja de decir qué había cuando se escribió, y aquí lo que importa es justo eso.

---

## Qué hay

| Documento | De qué fase | Por qué se guarda |
|---|---|---|
| `2026-07-18-webs-grupo-tombo-design.md` | Fase 1: el monorepo y las dos webs | El diseño original: por qué dos apps y no una con temas, y por qué `packages/ui` nace sin marca |
| `2026-07-27-divergencia-layout-design.md` | Fase 2: divergencia de layout | Por qué las dos casas dejan de compartir plantilla |
| `2026-07-29-portadas-y-chrome-design.md` | Fase 3: portadas y chrome | Por qué muere la barra inferior y nace la cabecera con `[Reservar]` |
| `2026-07-31-panel-rojo-y-paridad-en-design.md` | La piel roja de Ochoa y la paridad del inglés | Por qué el papel crema se descartó: era una tasca de 1950 inventada, no el local |
| `2026-08-06-entrada-ochoa-design.md` | La entrada de Los Ochoa | Las variantes de movimiento que se compararon y por qué ganó la que ganó |
| `barra-del-navegador-ios.md` | La barra del navegador en iPhone, **resuelta el 2026-08-01** | El caso entero: lo que se probó y no era, y su **§8, los tres errores de método**, que se copiaron a `../metodo.md` porque se repiten |
| `estado-divergencia-layout.md` | Registro de la fase 2, tarea por tarea | Historia. **Su cabecera ya no es cierta**: habla de una rama que no existe y de 37 tests cuando hay 45 |

La receta portable que salió del caso de la barra **no está aquí**: sigue viva en
`../receta-barra-ios-astro.md`, porque le sirve a cualquier web con `<ClientRouter />` y no caduca
con este proyecto.

---

## Lo que se borró el 2026-09-07, y por qué

Los **cinco planes de implementación** que acompañaban a estos specs — 5.142 líneas entre los
cinco, uno de ellos de 1.944 — se borraron del árbol de trabajo.

**El motivo es la regla que ya tenía este repo:** *«el commit explica por qué, no qué; el diff ya
cuenta el qué»*. Un plan ejecutado es exactamente el *qué*: una lista de tareas con casillas,
ficheros a crear y restricciones que después se copiaron a `CLAUDE.md`. Todas estaban marcadas
como hechas. Suponían el **69% de toda la documentación del repo**, y el riesgo real no es
ocupar espacio: es que un agente nuevo se ponga a leer 1.944 líneas de instrucciones ya
ejecutadas creyendo que son el trabajo pendiente.

**No se han perdido.** Están enteros en el historial de git:

```bash
git log --diff-filter=D --oneline -- docs/superpowers/plans/   # el commit que los quitó
git show <sha>^:docs/superpowers/plans/2026-07-29-portadas-y-chrome.md
```

Los specs se quedaron porque son el *porqué*, que es lo único que el diff no cuenta.
