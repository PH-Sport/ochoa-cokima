import type { MetaCapiEvent } from "./events.ts";

const GRAPH_VERSION = "v21.0";

/** Envía un evento a la Conversions API de Meta (servidor a servidor). */
export async function sendCapiEvent(
  pixelId: string,
  token: string,
  ev: MetaCapiEvent,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetchImpl(
    `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [ev], access_token: token }),
    },
  );
  return { ok: res.ok, status: res.status };
}
