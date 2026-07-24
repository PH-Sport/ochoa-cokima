# @tombo/tracking

Capa de atribución compartida. Resuelve el problema de que la reserva ocurre
dentro del iframe de CoverManager (otro dominio) y hoy Meta nunca se entera.

## Flujo

```
Visita con ?utm_*/fbclid ──► cookie tombo_attr (90 días)
        │
        ▼
/reservas: iframe CoverManager
        │  postMessage (client_id GA4 →, eventos ←)
        ▼
Reserva completada
        ├─► fbq('track','Schedule',{},{eventID})      (píxel, navegador)
        └─► POST /api/meta-capi ──► Conversions API   (servidor, mismo eventID)
                                     Meta deduplica por event_id
```

- `InitiateCheckout` al empezar la reserva → retargeting de abandonos.
- **Solo cuenta reservas, no euros** (decisión de spec §9).
- **Nada se dispara sin consentimiento**: la app llama `initTracking` únicamente
  al recibir el evento `tombo:consent` del ConsentBanner.

## Pendiente de accesos (spec §12)

1. **Backoffice CoverManager**: inyectar el contenedor GTM dentro del motor y
   confirmar los nombres exactos de `eventAction` de sus postMessage (el listener
   contempla las variantes habituales; ajustar en integración).
   Plan B sin backoffice: solo postMessage (menos fiable).
2. **Meta Business Manager**: crear un píxel por restaurante + token CAPI.
3. Verificación end-to-end: reserva de prueba → evento visible en Events Manager
   de Meta con deduplicación correcta (Test Events con `test_event_code`).
