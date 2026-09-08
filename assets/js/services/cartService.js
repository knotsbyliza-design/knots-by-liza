import { readJSON, writeJSON, KEYS } from "./storage.js";
import { getProductById, canOrder } from "./productService.js";
import { CONFIG } from "../config.js";

/**
 * A cart line looks like:
 * { productId, name, price, image, category, processingTime, qty, variation: { colour, size } }
 * `variation` participates in the line's identity — the same product with a
 * different colour/size is a separate line. `processingTime` is snapshotted
 * at add-to-cart time, same as `price`, so a later change to a product's
 * estimate doesn't rewrite what a customer already saw/ordered.
 */

function getLines() {
  return readJSON(KEYS.CART, []);
}

function saveLines(lines) {
  writeJSON(KEYS.CART, lines);
  document.dispatchEvent(new CustomEvent("cart:changed"));
}

function lineKey(productId, variation) {
  return productId + "::" + JSON.stringify(variation || {});
}

export function getCart() {
  return getLines();
}

export function getCartCount() {
  return getLines().reduce((sum, l) => sum + l.qty, 0);
}

export function getCartTotals(deliveryFee, freeDeliveryThreshold) {
  const lines = getLines();
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const delivery = freeDeliveryThreshold && subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
  return { subtotal, delivery, total: subtotal + delivery, lines };
}

/**
 * Adds a product to the cart, clamped to available stock.
 * Returns { ok, reason } so the UI can show a friendly message.
 */
export function addToCart(productId, variation = {}, qty = 1) {
  const product = getProductById(productId);
  if (!product) return { ok: false, reason: "not-found" };
  if (!canOrder(product)) return { ok: false, reason: "not-accepting" };

  const lines = getLines();
  const key = lineKey(productId, variation);
  const existing = lines.find((l) => lineKey(l.productId, l.variation) === key);
  const currentQty = existing ? existing.qty : 0;
  const cap = CONFIG.MAX_QTY_PER_LINE;
  const nextQty = Math.min(currentQty + qty, cap);

  if (nextQty === currentQty) return { ok: false, reason: "max-qty" };

  if (existing) {
    existing.qty = nextQty;
  } else {
    lines.push({
      productId,
      name: product.name,
      price: product.price,
      image: (product.images && product.images[0]) || "",
      category: product.category,
      processingTime: product.processingTime,
      qty: nextQty,
      variation,
    });
  }
  saveLines(lines);
  return { ok: true, cappedAt: nextQty < currentQty + qty ? cap : null };
}

export function updateQty(productId, variation, qty) {
  const lines = getLines();
  const key = lineKey(productId, variation);
  const line = lines.find((l) => lineKey(l.productId, l.variation) === key);
  if (!line) return;
  line.qty = Math.max(1, Math.min(qty, CONFIG.MAX_QTY_PER_LINE));
  saveLines(lines);
}

export function removeFromCart(productId, variation) {
  const key = lineKey(productId, variation);
  const lines = getLines().filter((l) => lineKey(l.productId, l.variation) !== key);
  saveLines(lines);
}

export function clearCart() {
  saveLines([]);
}
