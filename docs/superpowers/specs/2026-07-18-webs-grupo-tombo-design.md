# Grupo Tombo — Webs de Cokima y Tasquita Los Ochoa
## Documento de diseño

- **Fecha:** 2026-07-18
- **Estado:** aprobado el diseño; pendiente de revisión final del cliente antes del plan de implementación
- **Autor:** equipo técnico (con Claude)

---

## 1. Resumen

Dos webs nuevas, construidas desde cero, para dos restaurantes del **Grupo Tombo**:

- **Cokima — Kitchen Madness** (C. de Andrés Mellado, 21, Chamberí, Madrid)
- **Tasquita Los Ochoa** (P.º de la Castellana, 117, Madrid)

Son marcas distintas, con branding y cocina propios, pero comparten fontanería técnica
(reservas, medición, esquema de carta, i18n). Se construyen en un único monorepo con dos
sites independientes que se despliegan por separado, cada uno con su dominio.

Sustituyen a las páginas actuales, que son subpáginas de `grupotombo.com` montadas en
WordPress (tema Flatsome), con la carta como imagen JPG y una medición de marketing rota.

### Los tres objetivos, en una frase
Que cada restaurante **se vea a la altura de su cocina**, que **Google los encuentre**, y
—sobre todo— que el grupo por fin **sepa de dónde vienen sus reservas** para no gastar en
publicidad a ciegas.

---

## 2. Objetivos y no-objetivos

### Objetivos
1. **Imagen de marca** propia y distintiva para cada restaurante.
2. **SEO local**: posicionar por término de zona y tipo de cocina; carta en texto real,
   datos estructurados, integración con Google Business.
3. **Reservas**: mantener CoverManager (sistema actual) e integrarlo con mínima fricción.
4. **Atribución**: saber qué canal (Instagram, campañas de Meta, Google, directo) genera
   cada reserva, y que Meta reciba el evento de conversión para poder optimizar.
5. **Carta actualizable**: precios y platos como datos, editables sin depender de un JPG.
6. **Bilingüe** ES/EN desde el día uno (sus cartas ya existen en ambos idiomas).

### No-objetivos (por ahora)
- Pedidos online / delivery propio.
- Programa de fidelización, área de cliente o login.
- CMS visual para el personal (se deja el terreno preparado, ver §6).
- Server-side tagging con contenedor propio (sGTM): innecesario para dos locales.

---

## 3. Descomposición en tres proyectos

El encargo son "dos webs", pero técnicamente son **tres piezas**, y una es independiente:

| | Proyecto | Depende de |
|---|---|---|
| **A** | Sistema de medición y atribución | de nada |
| **B** | Web de Cokima | de A |
| **C** | Web de Tasquita Los Ochoa | de A |

La medición (A) vive en un paquete compartido y se implementa una sola vez. Se porta
**Cokima primero** como implementación de referencia; **Los Ochoa** reutiliza la misma
fontanería y solo cambia de piel.

---

## 4. Stack técnico

- **Framework:** Astro 6 (estable desde feb. 2026; incluye Fonts API integrada, CSP API y
  builds ~5x más rápidos), salida **estática** (`output: 'static'`), adaptador de Vercel.
  Una única ruta bajo demanda (`prerender = false`) para el endpoint de Conversions API.
  Nota: Cloudflare adquirió el equipo de Astro en enero de 2026; el framework sigue siendo
  agnóstico de hosting y el adaptador de Vercel está soportado.
- **Gestor de paquetes / monorepo:** pnpm workspaces (sin Turborepo: con 2 apps pequeñas y
  3 paquetes no aporta; cada proyecto de Vercel construye solo su app. Se añade más adelante
  solo si los tiempos de build lo justifican).
- **Estilos:** CSS con design tokens por marca (custom properties). Sin framework de UI pesado.
- **Contenido:** content collections de Astro con validación de esquema (Zod).
- **i18n:** router nativo de Astro.
- **Hosting:** Vercel, **dos proyectos** apuntando al mismo repo (uno por app).

Motivos: cero JS por defecto (clave para SEO y Core Web Vitals), contenido tipado, i18n
nativo, imágenes optimizadas (WebP/AVIF, subsetting de fuentes), hosting barato.

---

## 5. Estructura del monorepo

```
ochoa-cokima/
├── apps/
│   ├── cokima/            # site Astro · dominio propio · deploy propio
│   └── ochoa/             # site Astro · dominio propio · deploy propio
└── packages/
    ├── ui/                # componentes sin marca + primitivas de layout
    ├── tracking/          # capa de atribución (proyecto A)
    ├── content/           # esquema Zod de la carta, tipos compartidos
    └── config/            # tsconfig, eslint, prettier compartidos
```

**Regla de oro:** `packages/ui` no contiene ni un color ni una fuente de marca. Expone
estructura y comportamiento; cada app inyecta sus tokens. Así Cokima puede ser una bomba
negra sobre rojo y Los Ochoa un cartel castizo, compartiendo el 100% de la fontanería y
el 0% del aspecto.

**Despliegue:** en Vercel se crean dos proyectos con *Root Directory* `apps/cokima` y
`apps/ochoa`. Cada uno: su build, su dominio, su sitemap, sus variables de entorno.

---

## 6. Modelo de contenido: la carta

La carta deja de ser una imagen y pasa a ser **datos tipados** en content collections,
en `src/content/menu/{es,en}/` por app. Esquema (Zod):

```ts
const dish = z.object({
  name:        z.string(),
  description: z.string().optional(),
  allergens:   z.array(allergenEnum).default([]),   // enum EU, no texto libre
  featured:    z.boolean().default(false),          // platos ancla → foto grande
  image:       image().optional(),                  // la web funciona sin fotos
  price: z.union([
    z.number(),                                       // Cokima: precio único (18)
    z.object({ half: z.number().nullable(),           // Los Ochoa: ½ ración / ración
               full: z.number() }),                   // half:null modela el "-" real
  ]),
});
```

Decisiones clave:
- **`image` opcional:** la web se construye y lanza aunque no lleguen las fotos nuevas.
- **`half: null`:** modela literalmente el guion de la carta de Los Ochoa.
- **`allergens` como enum** (14 alérgenos UE): iconos estándar, garantizados por el tipo.

**Preparado para CMS (fase futura):** el esquema es compatible con Keystatic, que lee las
mismas content collections. El día que el personal quiera editar la carta, se enchufa
Keystatic encima sin migrar datos.

**Beneficio inmediato frente al JPG:** carta indexable por Google, buscable, accesible con
lector de pantalla, y cambiar un precio es una edición de segundos.

---

## 7. Internacionalización (ES/EN)

Router nativo de Astro. Español en la raíz (público principal en Madrid); inglés bajo `/en/`.

| | Español (principal) | Inglés |
|---|---|---|
| Inicio | `/` | `/en/` |
| Carta | `/carta` | `/en/menu` |
| Reservas | `/reservas` | `/en/reservations` |
| Legales | `/aviso-legal`, `/privacidad`, `/cookies` | idem bajo `/en/` |

Las dos versiones se enlazan con etiquetas `hreflang` para que Google sirva la correcta.

---

## 8. SEO y dominios

- **Dominios:** aún por decidir por el cliente. El diseño es **agnóstico al dominio**: la URL
  del site vive en `SITE_URL` (variable de entorno) y de ahí salen canonical, sitemap y
  Open Graph. Recomendación: **dominio propio por restaurante** (p. ej. `cokima.es`,
  `tasquitalosochoa.es`). Si se cambian las URLs actuales, **hay que hacer redirects 301**
  desde `grupotombo.com/...` para no perder el SEO acumulado.
- **Dos propiedades separadas** en Google Search Console; cada web enlazada a su ficha de
  Google Business. Cero dilución de autoridad entre marcas.
- **Datos estructurados `Restaurant`** (JSON-LD) por site: nombre, dirección, geo, horario,
  teléfono, tipo de cocina, rango de precios, enlace a la carta. Activa resultados
  enriquecidos y el panel local de Google.
- **Sitemap** (`@astrojs/sitemap`, con hreflang) y **robots.txt** por dominio, automáticos.
- Páginas dedicadas de carta y reservas (URL propia, indexable) en lugar de secciones.

---

## 9. Capa de atribución (`packages/tracking`)

Problema: la reserva ocurre dentro del iframe de CoverManager (otro dominio). Hoy el píxel
de Meta solo dispara `PageView` (nunca una conversión) y el puente de identidad con
CoverManager es código muerto (usa `ga` de Universal Analytics, apagado en 2023). Resultado:
las reservas se atribuyen a "directo" y Meta no puede optimizar. Diseño en cuatro momentos:

**1. Captura de origen (al aterrizar).** En la primera visita se guardan en cookie propia
los `utm_*`, `fbclid` (clic de Meta) y `gclid` (Google), con marca de tiempo. Persisten
durante la navegación, de modo que al llegar a reservar seguimos conociendo el canal de origen.

**2. Puente de identidad hacia el iframe.** Se sustituye el código muerto: se pasa el
`client_id` de **GA4** y el origen guardado al iframe por `postMessage`, cosiendo la sesión
de reserva al mismo usuario. Además se inyecta nuestro contenedor de **GTM dentro del motor
de CoverManager** (requiere su backoffice) para disparar la conversión en el momento real.

**3. Doble disparo deduplicado.** Al completarse la reserva se dispara el evento estándar de
Meta **`Schedule`** por dos vías con el mismo `event_id`:
- **Píxel de navegador** → Meta.
- **Endpoint `/api/meta-capi`** (función serverless en Vercel) → **Conversions API** de Meta,
  con `event_id` idéntico, `fbc`/`fbp`, IP y user-agent.

Meta ve el mismo `event_id`, lo cuenta **una vez**, y recupera el ~20-40% de eventos que el
navegador pierde por iOS y bloqueadores. Se dispara también `InitiateCheckout` al *empezar*
la reserva, para retargeting de abandonos.

**La conversión cuenta reservas, no euros.** No se envía valor monetario (un restaurante no
conoce el gasto real hasta el servicio, y hay no-shows). Un ticket medio estimado se puede
añadir más adelante si se quiere calcular retorno.

**4. Configuración por marca.** `packages/tracking` es agnóstico: cada app le pasa su ID de
píxel, contenedor GTM, slug de CoverManager y token de CAPI (secreto en Vercel).

Decisiones confirmadas:
- **Un píxel por restaurante** (hoy comparten uno) → atribución limpia por marca.
- **Modelo de atribución: último clic** (estándar Meta/GA4).

---

## 10. Privacidad y RGPD

- Píxel + Conversions API exigen **consentimiento**: banner de cookies con **Consent Mode v2**.
  Nada de medición se dispara sin aceptación. Se implementa un banner ligero propio (no un
  plugin pesado) desde el primer momento.
- **Expectativa realista:** quien rechace cookies no se mide, así que **no se mide el 100%** —
  se mide la mayoría, que es lo normal y correcto en la UE. Se pasa de *cero eventos de
  conversión hoy* a medir la gran parte.
- Páginas legales obligatorias: aviso legal, política de privacidad, política de cookies
  (requieren datos fiscales del cliente).

---

## 11. Fotografía y assets

- La fotografía existente es **profesional y buena**, pero de 2021-2022 y desalineada con la
  carta actual (varios platos ya no existen). Decisión de sesión nueva vs. reutilización:
  **pendiente del cliente**. El diseño es agnóstico: `image` es opcional y se rellenan fotos
  cuando lleguen, sin refactor.
- **Logos:** se necesitan en vectorial (SVG/AI/PDF), no el PNG de la web actual.
- **Tipografías:** por confirmar. En el boceto de Cokima se usa Bricolage Grotesque como
  referencia; la definitiva depende del branding.

---

## 12. Dependencias y accesos pendientes (checklist para el cliente)

**Accesos (crítico para la atribución):**
- [ ] **CoverManager** (backoffice, admin) — *imprescindible; determina si la vía fina de
      medición es viable o hay que usar el plan B.*
- [ ] **Meta Business Manager** — admin del píxel `6251807501500238` y de la cuenta de anuncios.
- [ ] **Google Tag Manager** (`GTM-KW58ZDS`, edición) y **Google Analytics 4** (o crearlo).
- [ ] **Gestión de campañas de Meta** — quién las lleva (equipo o agencia).
- [ ] **Google Business Profile** de los dos locales.
- [ ] **Registrador del dominio** y **DNS** de grupotombo.com.

**Materiales y contenido:**
- [ ] Logos en vectorial.
- [ ] Fotografía (decisión: sesión nueva vs. reutilizar) y archivo original si existe.
- [ ] Cartas actualizadas y confirmadas, con precios y **alérgenos oficiales**.
- [ ] Textos: historia de cada restaurante; validar horarios/teléfonos/direcciones.
- [ ] Datos fiscales (razón social, CIF) para textos legales.

**Decisiones del cliente:**
- [ ] Dominios propios (recomendado) vs. seguir bajo grupotombo.com.
- [ ] ¿Carta de bebidas / vinos? (no aparecía en la web actual; relevante en Los Ochoa).

---

## 13. Riesgos

1. **CoverManager podría no permitir la inyección del contenedor GTM** según su plan. Plan B:
   solo `postMessage` (menos fiable). Se resuelve pronto en cuanto haya acceso al backoffice.
2. **Cambio de dominio sin 301** = pérdida de SEO. Mitigación: redirects planificados.
3. **Accesos que no lleguen a tiempo** bloquean la entrega de la atribución, no el diseño ni
   la construcción de las webs. Por eso los accesos se piden ya.
4. **Fotografía desactualizada:** si no hay sesión nueva, la web arranca con menos gancho
   visual en los platos estrella.

---

## 14. Estado del boceto

Existe un boceto visual de Cokima en HTML/CSS puro (Artifact) que **valida la dirección
visual** con contenido 100% real. No es la web: es la referencia que se traducirá a
componentes Astro. Los Ochoa se skinnea sobre la misma fontanería tras portar Cokima.

---

## Próximo paso

Revisión de este documento por el cliente/equipo → plan de implementación (writing-plans) →
scaffold del monorepo y porte de Cokima.
