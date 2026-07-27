import { describe, it, expect } from "vitest";
import { resolveSiteUrl } from "../src/site-url.mjs";

describe("resolveSiteUrl", () => {
  it("usa SITE_URL cuando está definida y le quita la barra final", () => {
    expect(resolveSiteUrl({ SITE_URL: "https://cokima.es/" })).toBe("https://cokima.es");
  });

  it("falla en producción de Vercel si falta SITE_URL", () => {
    expect(() => resolveSiteUrl({ VERCEL_ENV: "production" })).toThrow(/SITE_URL/);
  });

  it("falla si SITE_URL no es una URL http(s) absoluta", () => {
    expect(() => resolveSiteUrl({ SITE_URL: "cokima.es" })).toThrow(/SITE_URL/);
  });

  it("usa el dominio efímero de la preview de Vercel", () => {
    expect(resolveSiteUrl({ VERCEL_ENV: "preview", VERCEL_URL: "cokima-abc123.vercel.app" })).toBe(
      "https://cokima-abc123.vercel.app",
    );
  });

  it("cae a localhost en desarrollo local, sin dominio inventado", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:4321");
  });
});
