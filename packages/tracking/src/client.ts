/**
 * Glue de navegador. Sin tests unitarios (depende de DOM/cookies/fbq);
 * se verifica en integración manual cuando haya accesos (ver README).
 * IMPORTANTE: solo debe invocarse tras el consentimiento del usuario
 * (la app escucha el evento "tombo:consent" del ConsentBanner).
 */
import { parseAttribution, serializeAttribution, deserializeAttribution, type Attribution } from "./attribution.ts";
import { buildEventId } from "./events.ts";

const COOKIE = "tombo_attr";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 días

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface TrackingConfig {
  gtmId?: string;
  pixelId?: string;
  /** Slug del restaurante en CoverManager; también es el id del iframe. */
  coverSlug: string;
}

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? m[1] : null;
}

/** Captura las señales de la URL actual y las persiste (la primera gana). */
export function captureAttribution(): Attribution | null {
  const fresh = parseAttribution(window.location.search);
  if (fresh) {
    document.cookie = `${COOKIE}=${serializeAttribution(fresh)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
    return fresh;
  }
  const stored = readCookie(COOKIE);
  return stored ? deserializeAttribution(stored) : null;
}

function fireConversion(cfg: TrackingConfig, eventName: "Schedule" | "InitiateCheckout") {
  const eventId = buildEventId();
  // Vía 1: píxel de navegador (si está cargado vía GTM)
  window.fbq?.("track", eventName, {}, { eventID: eventId });
  // Vía 2: servidor (Conversions API) con el mismo event_id → Meta deduplica
  if (eventName === "Schedule") {
    void fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        sourceUrl: window.location.href,
        fbp: readCookie("_fbp") ?? undefined,
        fbc: readCookie("_fbc") ?? undefined,
      }),
    }).catch(() => {});
  }
  window.dataLayer?.push({ event: `tombo_${eventName.toLowerCase()}`, event_id: eventId });
}

/**
 * Inicializa la medición: captura atribución, tiende el puente GA4 al iframe
 * de CoverManager y escucha sus postMessage para disparar las conversiones.
 */
export function initTracking(cfg: TrackingConfig): void {
  captureAttribution();

  // Puente de identidad: enviar el client_id de GA4 al iframe (sustituye al
  // código muerto de Universal Analytics del sitio antiguo).
  const frame = document.getElementById(cfg.coverSlug) as HTMLIFrameElement | null;
  if (frame && window.gtag) {
    window.gtag("get", "client_id", (clientId: string) => {
      frame.contentWindow?.postMessage({ type: "GA4", clientId }, "*");
    });
  }

  // Escucha de eventos del motor de reservas.
  window.addEventListener("message", (event: MessageEvent) => {
    if (typeof event.origin === "string" && !event.origin.includes("covermanager.com")) return;
    const data = event.data as { type?: string; eventAction?: string } | undefined;
    if (!data || data.type !== "event") return;
    const action = String(data.eventAction ?? "").toLowerCase();
    // Los nombres exactos de eventAction se confirman en integración con el
    // backoffice de CoverManager; contemplamos las variantes habituales.
    if (action.includes("confirm") || action.includes("reserva_completada") || action.includes("booking")) {
      fireConversion(cfg, "Schedule");
    } else if (action.includes("init") || action.includes("start")) {
      fireConversion(cfg, "InitiateCheckout");
    }
  });
}
