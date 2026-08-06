import { describe, it, expect } from "vitest";
import { decideEntrada, decideRetorno } from "../src/intro.ts";

const llegada = { tipo: "navigate", yaVisto: false, menosMovimiento: false } as const;

describe("decideEntrada", () => {
  it("sale al llegar desde fuera", () => {
    expect(decideEntrada(llegada)).toBe(true);
  });

  it("no sale al recargar", () => {
    expect(decideEntrada({ ...llegada, tipo: "reload" })).toBe(false);
  });

  it("no sale con el botón de atrás", () => {
    expect(decideEntrada({ ...llegada, tipo: "back_forward" })).toBe(false);
  });

  it("no sale si ya se vio en esta sesión", () => {
    expect(decideEntrada({ ...llegada, yaVisto: true })).toBe(false);
  });

  it("no sale para quien pide menos movimiento", () => {
    expect(decideEntrada({ ...llegada, menosMovimiento: true })).toBe(false);
  });

  /* Las puertas son independientes: que una diga que no basta, aunque las
     demás digan que sí. Esto es lo que evita que un refactor las convierta
     sin querer en un `&&` donde una domine a las otras. */
  it("basta una puerta cerrada", () => {
    expect(decideEntrada({ tipo: "reload", yaVisto: false, menosMovimiento: false })).toBe(false);
    expect(decideEntrada({ tipo: "navigate", yaVisto: true, menosMovimiento: false })).toBe(false);
    expect(decideEntrada({ tipo: "navigate", yaVisto: false, menosMovimiento: true })).toBe(false);
  });

  /* `prerender` es una llegada de verdad: el navegador ha precargado la página
     pero el usuario la está viendo por primera vez. */
  it("sale en una navegación precargada", () => {
    expect(decideEntrada({ ...llegada, tipo: "prerender" })).toBe(true);
  });
});

describe("decideEntrada es serializable", () => {
  /* El script inline del `<head>` se construye con `decideEntrada.toString()`,
     que es lo que garantiza que no existan dos copias de la lógica. Si la
     función capturase algo de su módulo —una constante, un import— el texto
     serializado se rompería en el navegador sin que ningún test lo notara. */
  it("no referencia nada de su módulo", () => {
    const cuerpo = decideEntrada.toString();
    expect(cuerpo).not.toMatch(/\bCLAVE_SESION\b|\bINTRO_EN_RETORNO\b|\bSEGURO\b|\brequire\b|\bimport\b/);
  });
});

describe("decideRetorno", () => {
  it("se reproduce al volver a la home desde otra página", () => {
    expect(decideRetorno("/carta", "/")).toBe(true);
  });

  /* Decisión de Mario: estando ya en la home el router no navega a ninguna
     parte, así que la entrada anunciaría una llegada que no ocurre. */
  it("no se reproduce estando ya en la home", () => {
    expect(decideRetorno("/", "/")).toBe(false);
  });

  it("la barra final no cuenta como otra página", () => {
    expect(decideRetorno("/en/", "/en/")).toBe(false);
    expect(decideRetorno("/carta/", "/carta")).toBe(false);
  });

  it("la home inglesa y la española son páginas distintas", () => {
    expect(decideRetorno("/en/", "/")).toBe(true);
  });
});
