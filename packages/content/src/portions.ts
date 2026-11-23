import type { Dish } from "./index.ts";

export type Portion = "half" | "full";

/**
 * Resuelve el importe a mostrar. `onlyFull` marca los platos que no tienen
 * media ración (`half: null`, el guion de la carta de Los Ochoa): en vez de
 * dejar un hueco, se muestra la entera y se avisa.
 */
export function formatPortionPrice(
  price: Dish["price"],
  portion: Portion,
): { amount: number; onlyFull: boolean } {
  if (typeof price === "number") return { amount: price, onlyFull: false };
  if (portion === "full") return { amount: price.full, onlyFull: false };
  if (price.half === null) return { amount: price.full, onlyFull: true };
  return { amount: price.half, onlyFull: false };
}

export function formatEuro(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const body = hasCents ? amount.toFixed(2).replace(".", ",") : String(Math.round(amount));
  return `${body}\u00a0€`;
}
