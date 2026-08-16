import { describe, it, expect } from "vitest";
import { decideEntrada, decideRetorno } from "../src/intro.ts";

const llegada = { tipo: "navigate", yaVisto: false, menosMovimiento: false } as const;

describe("decideEntrada", () => {
  it("sale al llegar desde fuera", () => {
    expect(decideEntrada(llegada)).toBe(true);
  });

  /* Recargar es un gesto deliberado: F5, el botón del navegador o el tirón
     hacia abajo en el móvil. Quien lo hace pide la página otra vez desde cero,
     así que la entrada sale — y sale por delante de la marca de sesión, que si
     no la taparía siempre (recargar implica haber estado ya). */
  it("sale al recargar, aunque ya se hubiera visto", () => {
    expect(decideEntrada({ ...llegada, tipo: "reload" })).toBe(true);
    expect(decideEntrada({ ...llegada, tipo: "reload", yaVisto: true })).toBe(true);
  });

  it("no sale con el botón de atrás", () => {
    expect(decideEntrada({ ...llegada, tipo: "back_forward" })).toBe(false);
    // Ni aunque sea la primera vez en esta pestaña: volver atrás no es llegar.
    expect(decideEntrada({ tipo: "back_forward", yaVisto: false, menosMovimiento: false })).toBe(false);
  });

  it("no sale si ya se vio en esta sesión", () => {
    expect(decideEntrada({ ...llegada, yaVisto: true })).toBe(false);
  });

  /* Menos movimiento gana a todo, incluida la recarga deliberada: quien lo pide
     no quiere ver la animación por mucho que pulse F5. */
  it("no sale para quien pide menos movimiento", () => {
    expect(decideEntrada({ ...llegada, menosMovimiento: true })).toBe(false);
    expect(decideEntrada({ tipo: "reload", yaVisto: false, menosMovimiento: true })).toBe(false);
  });

  /* El orden de las puertas es parte del contrato, no un detalle: `reload`
     tiene que resolverse ANTES que `yaVisto` o nunca saldría al recargar. */
  it("recargar pesa más que la marca de sesión, y menos que reduced-motion", () => {
    expect(decideEntrada({ tipo: "reload", yaVisto: true, menosMovimiento: false })).toBe(true);
    expect(decideEntrada({ tipo: "reload", yaVisto: true, menosMovimiento: true })).toBe(false);
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
