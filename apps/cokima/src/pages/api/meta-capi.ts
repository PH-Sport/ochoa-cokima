export const prerender = false;

import type { APIRoute } from "astro";
import { buildScheduleEvent } from "@tombo/tracking";
import { sendCapiEvent } from "@tombo/tracking/capi";

/**
 * Segunda vía de la conversión (spec §9): el navegador dispara el píxel y este
 * endpoint reenvía el mismo evento (mismo event_id) a la Conversions API de
 * Meta, que deduplica. Recupera los eventos que iOS/bloqueadores se comen.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const pixelId = import.meta.env.PUBLIC_META_PIXEL_ID;
  const token = import.meta.env.META_CAPI_TOKEN;
  if (!pixelId || !token) {
    return new Response(JSON.stringify({ ok: false, reason: "capi-not-configured" }), { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.eventId || !body?.sourceUrl) {
    return new Response(null, { status: 400 });
  }

  const ev = buildScheduleEvent({
    eventId: String(body.eventId),
    sourceUrl: String(body.sourceUrl),
    fbp: typeof body.fbp === "string" ? body.fbp : undefined,
    fbc: typeof body.fbc === "string" ? body.fbc : undefined,
    ip: clientAddress,
    ua: request.headers.get("user-agent") ?? undefined,
  });

  const res = await sendCapiEvent(pixelId, token, ev);
  return new Response(JSON.stringify(res), { status: res.ok ? 200 : 502 });
};
