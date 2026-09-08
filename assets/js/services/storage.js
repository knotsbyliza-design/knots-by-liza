/**
 * ============================================================
 *  STORAGE ADAPTER
 * ============================================================
 *  Every read/write to localStorage in this project goes
 *  through this one file. That is intentional: if you later
 *  add a real backend (Firebase, Supabase, your own API), you
 *  only need to rewrite the functions in THIS file — product
 *  and order services elsewhere never touch localStorage
 *  directly, so nothing else in the app has to change.
 *
 *  LIMITATION: localStorage lives in one browser, on one
 *  device. Clearing browser data removes it. Two different
 *  phones/computers will NOT automatically share the same
 *  inventory or orders. This is expected for a no-backend site.
 * ============================================================
 */

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Storage read failed for "${key}"`, err);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Storage write failed for "${key}"`, err);
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Storage remove failed for "${key}"`, err);
  }
}

export const KEYS = {
  PRODUCTS: "kbl_products",
  PRODUCTS_SEEDED: "kbl_products_seeded",
  CART: "kbl_cart",
  ORDERS: "kbl_orders",
  ADMIN_SESSION: "kbl_admin_session",
};
