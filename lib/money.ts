/** Money helpers. Amounts move through the system as integer paise. */

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** "₹399", "₹2,499" — no trailing .00 noise on whole amounts. */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  const hasFraction = paise % 100 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(rupees);
}

/** For invoices, where we always want two decimal places. */
export function formatINRExact(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

/**
 * Rupees per US dollar, used only for the pricing page's display when no
 * admin has configured a real PayPal exchange rate yet. Never used to
 * actually charge anyone — PayPal's own checkout path refuses to open an
 * order until a real rate is set, exactly as before this file changed.
 */
export const DEFAULT_INR_PER_USD = 83;

/**
 * Converts an INR-paise amount into a settlement-currency amount at the
 * given rupees-per-unit rate, rounding up to the cent so the amount is
 * never short of what the price actually costs.
 *
 * This is the one place that math happens. `lib/payments/paypal.ts` uses
 * it to compute what PayPal is actually charged, and the pricing page
 * uses it to compute what a customer is shown — same function, same
 * rate, so the two numbers cannot silently drift apart.
 */
export function convertPaiseByRate(paise: number, rateInrPerUnit: number): number {
  const units = paise / 100 / rateInrPerUnit;
  return Math.ceil(units * 100) / 100;
}

/** "$4.99", "$12.00" */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}