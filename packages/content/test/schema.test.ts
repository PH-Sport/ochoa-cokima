import { describe, it, expect } from "vitest";
import { dishSchema, hasHalfPortions } from "../src/index.ts";

describe("dishSchema", () => {
  it("acepta precio único (Cokima)", () => {
    const d = dishSchema.parse({ name: "Tataki de atún", price: 18, allergens: ["pescado", "soja"] });
    expect(d.price).toBe(18);
    expect(d.featured).toBe(false);
  });

  it("acepta media ración nula (el guion de Los Ochoa)", () => {
    const d = dishSchema.parse({ name: "Cachopín de ternera", price: { half: null, full: 18 } });
    expect(d.price).toEqual({ half: null, full: 18 });
  });

  it("rechaza alérgeno fuera del enum UE", () => {
    expect(() => dishSchema.parse({ name: "X", price: 5, allergens: ["azucar"] })).toThrow();
  });

  it("hasHalfPortions detecta cartas con columna ½", () => {
    const cok = [dishSchema.parse({ name: "A", price: 14 })];
    const och = [dishSchema.parse({ name: "B", price: { half: 7, full: 12 } })];
    expect(hasHalfPortions(cok)).toBe(false);
    expect(hasHalfPortions(och)).toBe(true);
  });
});
