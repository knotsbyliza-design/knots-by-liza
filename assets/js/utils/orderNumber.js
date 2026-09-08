import { readJSON, writeJSON } from "./../services/storage.js";

const COUNTER_KEY = "kbl_order_counter";

/**
 * Produces an order number such as KBL-20260905-001.
 * NOTE: this counter lives in this browser only. It is NOT a
 * globally guaranteed unique ID the way a real database's
 * order ID would be — see README for details.
 */
export function generateOrderNumber() {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const counters = readJSON(COUNTER_KEY, {});
  const next = (counters[datePart] || 0) + 1;
  counters[datePart] = next;
  writeJSON(COUNTER_KEY, counters);

  return `KBL-${datePart}-${String(next).padStart(3, "0")}`;
}
