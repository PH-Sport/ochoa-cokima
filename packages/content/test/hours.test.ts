import { describe, it, expect } from "vitest";
import { getOpenState } from "../src/hours.ts";

const OCHOA = ["Mo-Th 09:00-01:00", "Fr 09:00-02:30", "Sa 12:00-02:30", "Su 12:00-01:00"];
const COKIMA = ["Mo-Su 09:00-00:00"];

/** Construye un instante a partir de hora local de Madrid (verano, UTC+2). */
const madridSummer = (iso: string) => new Date(`${iso}+02:00`);
/** Invierno en Madrid, UTC+1. */
const madridWinter = (iso: string) => new Date(`${iso}+01:00`);

describe("getOpenState", () => {
  it("abierto a media tarde de un martes", () => {
    // martes 2026-07-28, 18:30 en Madrid
    expect(getOpenState(OCHOA, madridSummer("2026-07-28T18:30:00"))).toEqual({
      open: true,
      until: "01:00",
    });
  });

  it("cerrado por la mañana temprano indica la próxima apertura", () => {
    // martes 07:00: cerró a la 01:00, abre a las 09:00
    expect(getOpenState(OCHOA, madridSummer("2026-07-28T07:00:00"))).toEqual({
      open: false,
      nextOpen: "09:00",
    });
  });

  it("sigue abierto pasada la medianoche por el turno del día anterior", () => {
    // sábado 00:30 pertenece al turno del viernes (Fr 09:00-02:30)
    expect(getOpenState(OCHOA, madridSummer("2026-08-01T00:30:00"))).toEqual({
      open: true,
      until: "02:30",
    });
  });

  it("cierra el turno nocturno a su hora", () => {
    // sábado 02:31: el turno del viernes terminó; el sábado abre a las 12:00
    expect(getOpenState(OCHOA, madridSummer("2026-08-01T02:31:00"))).toEqual({
      open: false,
      nextOpen: "12:00",
    });
  });

  it("trata 00:00 como fin del día, no como principio", () => {
    // Cokima 23:50: abierto hasta las 00:00
    expect(getOpenState(COKIMA, madridSummer("2026-07-28T23:50:00"))).toEqual({
      open: true,
      until: "00:00",
    });
    // Cokima 00:10: ya cerró, abre a las 09:00
    expect(getOpenState(COKIMA, madridSummer("2026-07-29T00:10:00"))).toEqual({
      open: false,
      nextOpen: "09:00",
    });
  });

  it("usa hora de Madrid, no la del dispositivo", () => {
    // 2026-07-28T23:30 UTC = 2026-07-29T01:30 en Madrid (miércoles) → abierto por el turno del martes
    expect(getOpenState(OCHOA, new Date("2026-07-28T23:30:00Z"))).toEqual({
      open: false,
      nextOpen: "09:00",
    });
  });

  it("respeta el horario de invierno", () => {
    // martes 2026-01-13, 18:30 en Madrid (UTC+1)
    expect(getOpenState(OCHOA, madridWinter("2026-01-13T18:30:00"))).toEqual({
      open: true,
      until: "01:00",
    });
  });

  it("devuelve nextOpen null si no hay horario", () => {
    expect(getOpenState([], madridSummer("2026-07-28T18:30:00"))).toEqual({
      open: false,
      nextOpen: null,
    });
  });
});
