import { describe, it, expect } from "vitest";
import { pickFeatured } from "../src/featured.ts";
import type { MenuEntry } from "../src/index.ts";

const entry = (over: Partial<MenuEntry>): MenuEntry => ({
  name: "Plato",
  allergens: [],
  featured: false,
  price: 10,
  section: "carta",
  order: 1,
  ...over,
});

describe("pickFeatured", () => {
  it("se queda solo con los destacados", () => {
    const out = pickFeatured([
      entry({ name: "A", featured: true }),
      entry({ name: "B", featured: false }),
    ]);
    expect(out.map((d) => d.name)).toEqual(["A"]);
  });

  it("ordena por seccion y despues por order", () => {
    const out = pickFeatured([
      entry({ name: "postre", section: "postres", order: 1, featured: true }),
      entry({ name: "segundo", section: "carta", order: 9, featured: true }),
      entry({ name: "primero", section: "carta", order: 2, featured: true }),
    ]);
    expect(out.map((d) => d.name)).toEqual(["primero", "segundo", "postre"]);
  });

  it("una seccion desconocida va al final, no al principio", () => {
    const out = pickFeatured([
      entry({ name: "rara", section: "bebidas", order: 1, featured: true }),
      entry({ name: "normal", section: "carta", order: 1, featured: true }),
    ]);
    expect(out.map((d) => d.name)).toEqual(["normal", "rara"]);
  });

  it("recorta al limite pedido", () => {
    const out = pickFeatured(
      [
        entry({ name: "uno", order: 1, featured: true }),
        entry({ name: "dos", order: 2, featured: true }),
        entry({ name: "tres", order: 3, featured: true }),
      ],
      2,
    );
    expect(out.map((d) => d.name)).toEqual(["uno", "dos"]);
  });

  it("no muta el array recibido", () => {
    const input = [
      entry({ name: "segundo", order: 2, featured: true }),
      entry({ name: "primero", order: 1, featured: true }),
    ];
    pickFeatured(input);
    expect(input.map((d) => d.name)).toEqual(["segundo", "primero"]);
  });

  it("sin destacados devuelve vacio", () => {
    expect(pickFeatured([entry({})])).toEqual([]);
  });
});
