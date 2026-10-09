/**
 * src/lib/format.js
 * Small helpers for formatting values for display.
 *
 * Keep all formatting logic here so that if the currency or locale ever
 * changes, you only have to edit one file.
 */

/**
 * Format a price for display.
 *
 * @param {number|null|undefined} price - The price in the smallest unit
 *   of the currency (here: naira, stored as a plain number like 2450000).
 * @param {boolean} showPrice - Comes from the product's show_price column.
 *   If false, we show "Price on request" instead of a number.
 * @returns {string} - e.g. "₦2,450,000" or "Price on request"
 */
export function formatPrice(price, showPrice = true) {
  // A bespoke piece can be marked "price on request" by the admin without
  // touching any code. Also treat a missing price the same way.
  if (!showPrice || price === null || price === undefined) {
    return "Price on request";
  }

  // Intl.NumberFormat is built into JavaScript, so no library is needed.
  // "en-NG" gives the Nigerian number style, and maximumFractionDigits: 0
  // hides the ".00" because high-end furniture prices don't show kobo.
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}