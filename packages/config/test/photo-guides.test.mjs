import { describe, it, expect } from "vitest";
import { showPhotoGuides } from "../src/photo-guides.mjs";

/* Las rejillas guía son andamio: útiles para decidir dónde va cada foto, y una
   señal de obra inacabada si alguien las ve en el sitio publicado. Estos tests
   son la garantía de que eso no pasa, y por eso el caso importante —producción—
   se comprueba por partida doble. */
describe("showPhotoGuides", () => {
  it("las apaga en producción de Vercel", () => {
    expect(showPhotoGuides({ VERCEL_ENV: "production" })).toBe(false);
  });

  it("las apaga en cuanto hay SITE_URL, venga de donde venga", () => {
    expect(showPhotoGuides({ SITE_URL: "https://tasquitalosochoa.com" })).toBe(false);
  });

  it("las apaga en producción aunque falte SITE_URL", () => {
    expect(showPhotoGuides({ VERCEL_ENV: "production", SITE_URL: undefined })).toBe(false);
  });

  it("las enciende en la preview por rama, que es donde se usan", () => {
    expect(showPhotoGuides({ VERCEL_ENV: "preview", VERCEL_URL: "ochoa-git-preview.vercel.app" })).toBe(
      true,
    );
  });

  it("las enciende en local, sin ninguna variable", () => {
    expect(showPhotoGuides({})).toBe(true);
  });

  it("no se deja engañar por un SITE_URL en blanco", () => {
    expect(showPhotoGuides({ SITE_URL: "   " })).toBe(true);
  });
});
