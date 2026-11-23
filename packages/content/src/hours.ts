/** Estado de apertura resuelto en hora de Madrid. */
export type OpenState =
  | { open: true; until: string }
  | { open: false; nextOpen: string | null };

const DAY_CODE: Record<string, number> = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };
const EN_WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Intervalo de un día concreto. `end` puede pasar de 1440 si cruza medianoche. */
interface Interval {
  day: number;
  start: number;
  end: number;
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toLabel = (minutes: number): string => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const m = String(wrapped % 60).padStart(2, "0");
  return `${h}:${m}`;
};

/** "Mo-Th" → [1,2,3,4] · "Mo-Su" → los siete · "Mo,We" → [1,3] */
const expandDays = (spec: string): number[] => {
  const out: number[] = [];
  for (const chunk of spec.split(",")) {
    const [from, to] = chunk.split("-");
    const start = DAY_CODE[from];
    if (start === undefined) continue;
    if (to === undefined) {
      out.push(start);
      continue;
    }
    const end = DAY_CODE[to];
    if (end === undefined) continue;
    for (let i = 0; i < 7; i++) {
      const day = (start + i) % 7;
      out.push(day);
      if (day === end) break;
    }
  }
  return out;
};

const parseRule = (rule: string): Interval[] => {
  const [daysSpec, timeSpec] = rule.trim().split(/\s+/);
  if (!daysSpec || !timeSpec) return [];
  const [startRaw, endRaw] = timeSpec.split("-");
  if (!startRaw || !endRaw) return [];
  const start = toMinutes(startRaw);
  let end = toMinutes(endRaw);
  // "09:00-01:00" cruza medianoche; "09:00-00:00" cierra al final del día.
  if (end <= start) end += 1440;
  return expandDays(daysSpec).map((day) => ({ day, start, end }));
};

/** Día de la semana y minutos transcurridos, siempre en Europe/Madrid. */
const madridNow = (now: Date): { day: number; minutes: number } => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: EN_WEEKDAY[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
};

export function getOpenState(hours: string[], now: Date): OpenState {
  const intervals = hours.flatMap(parseRule);
  if (intervals.length === 0) return { open: false, nextOpen: null };

  const { day, minutes } = madridNow(now);
  const yesterday = (day + 6) % 7;

  for (const iv of intervals) {
    // Turno que empezó hoy.
    if (iv.day === day && minutes >= iv.start && minutes < iv.end) {
      return { open: true, until: toLabel(iv.end) };
    }
    // Turno de ayer que se alargó pasada la medianoche.
    if (iv.day === yesterday && iv.end > 1440 && minutes + 1440 >= iv.start && minutes + 1440 < iv.end) {
      return { open: true, until: toLabel(iv.end) };
    }
  }

  // Cerrado: la apertura más próxima en los próximos siete días.
  let best: number | null = null;
  for (let ahead = 0; ahead < 8; ahead++) {
    const target = (day + ahead) % 7;
    for (const iv of intervals) {
      if (iv.day !== target) continue;
      const absolute = ahead * 1440 + iv.start;
      if (absolute <= minutes) continue;
      if (best === null || absolute < best) best = absolute;
    }
    if (best !== null) break;
  }

  return { open: false, nextOpen: best === null ? null : toLabel(best) };
}
