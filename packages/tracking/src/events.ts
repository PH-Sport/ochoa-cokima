/** Payload de evento para la Conversions API de Meta. */
export interface MetaCapiEvent {
  event_name: "Schedule" | "InitiateCheckout";
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: "website";
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string;
    fbc?: string;
  };
}

/**
 * Id único compartido por el disparo de píxel (navegador) y el de CAPI (servidor).
 * Meta deduplica por event_id: el mismo evento por dos vías cuenta una sola vez.
 */
export function buildEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildScheduleEvent(opts: {
  eventId: string;
  sourceUrl: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  ua?: string;
}): MetaCapiEvent {
  return {
    event_name: "Schedule",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId,
    event_source_url: opts.sourceUrl,
    action_source: "website",
    user_data: {
      client_ip_address: opts.ip,
      client_user_agent: opts.ua,
      fbp: opts.fbp,
      fbc: opts.fbc,
    },
  };
}
