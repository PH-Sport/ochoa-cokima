import { describe, it, expect } from "vitest";
import { dishImageKey } from "../src/image-key.ts";

describe("dishImageKey", () => {
  it("pasa el nombre a kebab-case", () => {
    expect(dishImageKey("Croissant de rabo de toro")).toBe("croissant-de-rabo-de-toro");
  });

  it("quita los acentos y la eñe", () => {
    expect(dishImageKey("Jamón Ibérico con piña")).toBe("jamon-iberico-con-pina");
  });

  it("colapsa la puntuación en un solo guion", () => {
    expect(dishImageKey("Nachos con queso, guacamole y chili")).toBe(
      "nachos-con-queso-guacamole-y-chili",
    );
  });

  it("no deja guiones sueltos en los extremos", () => {
    expect(dishImageKey("  ¡Bravas!  ")).toBe("bravas");
  });

  it("aguanta un nombre que se queda sin nada utilizable", () => {
    expect(dishImageKey("¿?")).toBe("");
  });
});
