import { describe, it, expect } from "vitest";
import { decideAlto } from "../src/alto-congelado.ts";

/* Un móvil a 390 de ancho: la portada mide 654 con la barra del navegador
   desplegada (el viewport pequeño de verdad) y 560 si el viewport se encoge
   94px más. */
const congelado = { alto: 654, ancho: 390 };

describe("decideAlto", () => {
  it("congela la primera medida tal cual", () => {
    expect(decideAlto(null, { alto: 654, ancho: 390 })).toBe(654);
  });

  it("redondea a píxeles enteros", () => {
    expect(decideAlto(null, { alto: 653.6, ancho: 390 })).toBe(654);
  });

  /* Es el fallo del 2026-09-07: la página se carga con la barra del navegador
     retraída, congela el alto grande, y cuando la barra vuelve a desplegarse
     el viewport se encoge pero la portada se queda 94px más alta de lo que le
     toca, para toda la sesión. Con el mismo ancho, un alto MENOR es el
     viewport pequeño llegando tarde, y hay que aceptarlo. */
  it("baja cuando llega un alto menor con el mismo ancho", () => {
    expect(decideAlto(congelado, { alto: 560, ancho: 390 })).toBe(560);
  });

  /* Y al revés no: con el mismo ancho, un alto MAYOR es la barra retrayéndose
     —el vaivén que la regla 16 de movimiento.md manda ignorar, porque cada
     cambio de alto de la portada repinta el documento entero—. */
  it("no sube con el mismo ancho", () => {
    expect(decideAlto({ alto: 560, ancho: 390 }, { alto: 654, ancho: 390 })).toBeNull();
  });

  it("no hace nada si la medida es la misma", () => {
    expect(decideAlto(congelado, { alto: 654, ancho: 390 })).toBeNull();
    // Ni por decimales: 654.4 sigue siendo 654 en pantalla.
    expect(decideAlto(congelado, { alto: 654.4, ancho: 390 })).toBeNull();
  });

  /* Una rotación cambia el ancho, y ahí se empieza de cero: se acepta lo que
     venga, también un alto mayor. */
  it("vuelve a congelar si cambia el ancho, aunque el alto crezca", () => {
    expect(decideAlto({ alto: 560, ancho: 390 }, { alto: 654, ancho: 844 })).toBe(654);
  });
});
