import { describe, it, expect } from "vitest";
import { formatPortionPrice, formatEuro } from "../src/portions.ts";

describe("formatPortionPrice", () => {
  it("devuelve la media cuando existe", () => {
    expect(formatPortionPrice({ half: 7, full: 12 }, "half")).toEqual({ amount: 7, onlyFull: false });
  });

  it("devuelve la entera", () => {
    expect(formatPortionPrice({ half: 7, full: 12 }, "full")).toEqual({ amount: 12, onlyFull: false });
  });

  it("cae a la entera y lo marca cuando no hay media (half: null)", () => {
    expect(formatPortionPrice({ half: null, full: 18 }, "half")).toEqual({ amount: 18, onlyFull: true });
  });

  it("un precio único no depende de la porción", () => {
    expect(formatPortionPrice(18, "half")).toEqual({ amount: 18, onlyFull: false });
    expect(formatPortionPrice(18, "full")).toEqual({ amount: 18, onlyFull: false });
  });
});

describe("formatEuro", () => {
  // Ojo: el separador es un espacio duro ( ) para que el importe no
  // parta de línea. Escribirlo explícito en el test, no un espacio normal.
  it("usa coma decimal solo cuando hay céntimos", () => {
    expect(formatEuro(12)).toBe("12\u00a0€");
    expect(formatEuro(12.5)).toBe("12,50\u00a0€");
    expect(formatEuro(3.9)).toBe("3,90\u00a0€");
  });
});
