/**
 * format.ts
 * Tiny formatting helpers for amounts and currency.
 * Avoids repeated inline toFixed calls and keeps display consistent.
 */

/**
 * formatAmount
 * Formats a numeric amount with fixed fraction digits (default 2).
 */
export function formatAmount(amount: number | string, fractionDigits = 2): string {
  const num = Number(amount ?? 0);
  return num.toFixed(fractionDigits);
}