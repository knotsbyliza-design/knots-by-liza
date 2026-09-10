import { SAMPLE_PRODUCTS } from "../data/sampleProducts.js";
import { CONFIG } from "../config.js";

/**
 * ============================================================
 *  AVAILABILITY (made-to-order capacity, not stock count)

/**
 * ============================================================
 *  AVAILABILITY (made-to-order capacity, not stock count)
 * ============================================================
 *  Single source of truth for the three order-acceptance states.
 *  Used by product cards, the product page, and the admin form,
 *  so the labels/behaviour only need to be defined once.
 */
export const AVAILABILITY_STATUSES = [
  { value: "accepting", label: "Accepting Orders", badge: null, canOrder: true },
  { value: "limited", label: "Accepting Orders — Longer Wait", badge: "Longer Wait", canOrder: true },
  { value: "paused", label: "Not Accepting Orders", badge: "Not Accepting Orders", canOrder: false },
];

function getAvailabilityMeta(status) {
  return AVAILABILITY_STATUSES.find((s) => s.value === status) || AVAILABILITY_STATUSES[0];
}

export function canOrder(product) {
  return !!product && getAvailabilityMeta(product.availability).canOrder;
}

export function getAvailabilityLabel(product) {
  return getAvailabilityMeta(product?.availability).label;
}

export function getAvailabilityBadge(product) {
  return getAvailabilityMeta(product?.availability).badge;
}

export function getProcessingTime(product) {
  return (product && product.processingTime) || CONFIG.DEFAULT_PROCESSING_TIME;
}

/**
 * ============================================================
 *  VARIATION PRICING (optional, opt-in per product)
 * ============================================================
 *  A variation option is either a plain string (no price effect —
 *  e.g. colour swatches) or an object { value, price } when picking
 *  it should change the product's price (e.g. clothing sizes).
 *  Both forms can be mixed across different variation groups on the
 *  same product — colour can stay a plain list while size carries
 *  its own prices, for example.
 */
export function normalizeVariationOptions(options) {
  return (options || [])
    .filter((opt) => opt != null)
    .map((opt) => (typeof opt === "string" ? { value: opt, price: null } : opt));
}

export function hasPriceVariations(product) {
  const variations = product?.variations || {};
  return Object.values(variations).some((options) =>
    normalizeVariationOptions(options).some((opt) => typeof opt.price === "number")
  );
}

/**
 * The lowest price across any price-carrying variation group, used for
 * the "From Rs. X" label on product cards. Falls back to the product's
 * own price if it has no price-affecting variations.
 */
export function getStartingPrice(product) {
  if (!hasPriceVariations(product)) return product.price;
  let lowest = null;
  Object.values(product.variations).forEach((options) => {
    normalizeVariationOptions(options).forEach((opt) => {
      if (typeof opt.price === "number" && (lowest === null || opt.price < lowest)) {
        lowest = opt.price;
      }
    });
  });
  return lowest ?? product.price;
}

/**
 * The product catalogue is read directly from sampleProducts.js on every
 * call — nothing about it is cached in localStorage. This means any
 * addition, edit, or deletion you make in that file (then redeploy)
 * reaches every visitor immediately, old and new, with no stale copies
 * left behind in anyone's browser.
 */
export function getAllProducts() {
  return SAMPLE_PRODUCTS;
}
export function getProductById(id) {
  return getAllProducts().find((p) => p.id === id) || null;
}

export function getRelatedProducts(product, limit = 4) {
  return getAllProducts()
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}


/**
 * Applies search, category, price and availability filters, then sorting.
 * @param {object} opts { search, category, minPrice, maxPrice, availability, sort }
 */
export function queryProducts(opts = {}) {
  let list = getAllProducts();

  if (opts.search && opts.search.trim()) {
    const q = opts.search.trim().toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (opts.category && opts.category !== "all") {
    list = list.filter((p) => p.category === opts.category);
  }
  if (opts.minPrice != null) list = list.filter((p) => p.price >= opts.minPrice);
  if (opts.maxPrice != null) list = list.filter((p) => p.price <= opts.maxPrice);


  switch (opts.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "newest":
      list = [...list].sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1));
      break;
    case "featured":
    default:
      list = [...list].sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
  }

  return list;
}
