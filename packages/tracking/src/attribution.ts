/** Señales de origen que capturamos al aterrizar y persistimos en cookie propia. */
export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
}

const KEYS: (keyof Attribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
];

/** Extrae las señales de atribución de un query string. Null si no hay ninguna. */
export function parseAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  let found = false;
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) {
      out[k] = v;
      found = true;
    }
  }
  return found ? out : null;
}

interface StoredAttribution extends Attribution {
  ts: number;
}

export function serializeAttribution(a: Attribution, now: number = Date.now()): string {
  const stored: StoredAttribution = { ...a, ts: now };
  return encodeURIComponent(JSON.stringify(stored));
}

export function deserializeAttribution(raw: string): Attribution | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as StoredAttribution;
    if (typeof parsed !== "object" || parsed === null) return null;
    const { ts: _ts, ...rest } = parsed;
    return rest;
  } catch {
    return null;
  }
}
