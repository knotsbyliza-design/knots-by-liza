import { CONFIG } from "../config.js";

export function formatPrice(amount) {
  const rounded = Math.round(Number(amount) || 0);
  return `${CONFIG.CURRENCY_SYMBOL} ${rounded.toLocaleString("en-US")}`;
}
