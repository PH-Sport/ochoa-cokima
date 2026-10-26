import { describe, it, expect } from "vitest";
import { dishSchema, allergenNumber, usedAllergens, dishAllergens } from "../src/index.ts";

describe("allergenNumber", () => {
  /* La chuleta de la carta usa la numeración del Anexo II del Reglamento
     1169/2011, que es la que llevan las cartas de bar de toda la vida y la
     que sigue el enum: 1 gluten … 14 moluscos. */
  it("numera del 1 al 14 en el orden del reglamento", () => {
    expect(allergenNumber("gluten")).toBe(1);
    expect(allergenNumber("crustaceos")).toBe(2);
    expect(allergenNumber("huevo")).toBe(3);
    expect(allergenNumber("lacteos")).toBe(7);
    expect(allergenNumber("sulfitos")).toBe(12);
    expect(allergenNumber("moluscos")).toBe(14);
  });
});

describe("dishSchema.allergensToConfirm", () => {
  /* La hoja del restaurante marca en amarillo el gluten de cinco platos y no
     dice por qué. Se guarda aparte para que la carta lo señale, sin inventar
     qué significa. */
  it("es opcional y vacío por defecto", () => {
    const d = dishSchema.parse({ name: "Gilda", price: 4, allergens: ["pescado"] });
    expect(d.allergensToConfirm).toEqual([]);
  });

  it("acepta alérgenos del enum y rechaza el resto", () => {
    const d = dishSchema.parse({ name: "Entrecote", price: 23, allergens: ["gluten"], allergensToConfirm: ["gluten"] });
    expect(d.allergensToConfirm).toEqual(["gluten"]);
    expect(() =>
      dishSchema.parse({ name: "X", price: 5, allergensToConfirm: ["amarillo"] }),
    ).toThrow();
  });
});

describe("usedAllergens", () => {
  const platos = [
    dishSchema.parse({ name: "Gilda", price: 4, allergens: ["pescado"] }),
    dishSchema.parse({ name: "Tortilla", price: 3.5, allergens: ["gluten", "huevo"] }),
    dishSchema.parse({ name: "Entrecote", price: 23, allergens: ["gluten"], allergensToConfirm: ["gluten"] }),
    dishSchema.parse({ name: "Bicicleta", price: 3 }),
  ];

  /* La leyenda al pie solo lista lo que aparece en la carta, en orden de
     número: un 5 (cacahuetes) que ningún plato lleva no tiene que salir. */
  it("devuelve sin repetir y en orden de número lo que usa la carta", () => {
    expect(usedAllergens(platos)).toEqual(["gluten", "huevo", "pescado"]);
  });

  it("devuelve vacío si ningún plato declara nada", () => {
    expect(usedAllergens([dishSchema.parse({ name: "Pan", price: 2 })])).toEqual([]);
  });
});

describe("dishAllergens", () => {
  /* La hoja del restaurante lista las columnas en otro orden (moluscos es la
     tercera y es el 14), y así se transcribió. Bajo el plato los números van
     de menor a mayor o la chuleta no se sigue: «1 2 14 3» se leyó en la
     primera captura del 2026-09-19. */
  it("devuelve los alérgenos del plato en orden de número", () => {
    const d = dishSchema.parse({ name: "Brioche", price: 3.5, allergens: ["gluten", "crustaceos", "moluscos", "huevo"] });
    expect(dishAllergens(d)).toEqual(["gluten", "crustaceos", "huevo", "moluscos"]);
  });
});
