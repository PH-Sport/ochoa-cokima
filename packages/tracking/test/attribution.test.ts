import { describe, it, expect } from "vitest";
import {
  parseAttribution,
  serializeAttribution,
  deserializeAttribution,
  buildEventId,
  buildScheduleEvent,
} from "../src/index.ts";

describe("parseAttribution", () => {
  it("extrae utm y fbclid", () => {
    const a = parseAttribution("?utm_source=instagram&utm_campaign=verano&fbclid=abc123");
    expect(a).toEqual({ utm_source: "instagram", utm_campaign: "verano", fbclid: "abc123" });
  });

  it("null cuando no hay señales", () => {
    expect(parseAttribution("?foo=bar")).toBeNull();
  });
});

describe("cookie round-trip", () => {
  it("serializa y deserializa con timestamp", () => {
    const a = { utm_source: "meta", fbclid: "x" };
    const raw = serializeAttribution(a, 1700000000000);
    const back = deserializeAttribution(raw);
    expect(back).toMatchObject(a);
  });

  it("deserialize devuelve null con basura", () => {
    expect(deserializeAttribution("%%%")).toBeNull();
  });
});

describe("eventos Meta", () => {
  it("buildEventId genera ids únicos", () => {
    expect(buildEventId()).not.toBe(buildEventId());
  });

  it("buildScheduleEvent forma el payload CAPI", () => {
    const ev = buildScheduleEvent({
      eventId: "e1",
      sourceUrl: "https://x.es/reservas",
      fbc: "fb.1.1.abc",
      ip: "1.2.3.4",
      ua: "UA",
    });
    expect(ev.event_name).toBe("Schedule");
    expect(ev.event_id).toBe("e1");
    expect(ev.event_source_url).toBe("https://x.es/reservas");
    expect(ev.action_source).toBe("website");
    expect(ev.user_data.fbc).toBe("fb.1.1.abc");
    expect(typeof ev.event_time).toBe("number");
  });
});
