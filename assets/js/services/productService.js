import { readJSON, writeJSON, KEYS } from "./storage.js";
import { SAMPLE_PRODUCTS } from "../data/sampleProducts.js";
import { CONFIG } from "../config.js";

/**
 * Seeds localStorage with sample products on first run only.
 * Safe to call on every page load — it's a no-op after the first time.
 */

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

const AVAILABILITY_MIGRATION_KEY = "kbl_products_availability_migrated";

/**
 * One-time migration: converts any product still using the old numeric
 * `stock` field into the new `availability` / `processingTime` fields.
 * Safe to call on every page load — it's a no-op after the first time,
 * and it never touches products that already have `availability` set.
 */
function migrateLegacyStock() {
  if (readJSON(AVAILABILITY_MIGRATION_KEY, false)) return;

  const products = readJSON(KEYS.PRODUCTS, null);
  if (Array.isArray(products)) {
    let changed = false;
    const migrated = products.map((p) => {
      if (p.availability) return p; // already on the new system
      changed = true;
      const { stock, ...rest } = p;
      return {
        ...rest,
        availability: Number(stock) > 0 ? "accepting" : "paused",
        processingTime: p.processingTime || CONFIG.DEFAULT_PROCESSING_TIME,
      };
    });
    if (changed) writeJSON(KEYS.PRODUCTS, migrated);
  }

  writeJSON(AVAILABILITY_MIGRATION_KEY, true);
}


function ensureSeeded() {
  const seeded = readJSON(KEYS.PRODUCTS_SEEDED, false);
  if (!seeded) {
    writeJSON(KEYS.PRODUCTS, SAMPLE_PRODUCTS);
    writeJSON(KEYS.PRODUCTS_SEEDED, true);
  }
}

/**
 * Adds any product from sampleProducts.js that this browser doesn't have
 * yet (e.g. a new product you added to the file since this browser last
 * visited). Existing products already in localStorage are left completely
 * untouched — this only ever adds, never overwrites or removes.
 * Safe to call on every page load.
 */
function reconcileNewProducts() {
  const stored = readJSON(KEYS.PRODUCTS, null);
  if (!Array.isArray(stored)) return; // nothing seeded yet — ensureSeeded handles that case
  const existingIds = new Set(stored.map((p) => p.id));
  const newOnes = SAMPLE_PRODUCTS.filter((p) => !existingIds.has(p.id));
  if (newOnes.length) {
    writeJSON(KEYS.PRODUCTS, [...stored, ...newOnes]);
  }
}
export function getAllProducts() {
  ensureSeeded();
  migrateLegacyStock();
  reconcileNewProducts();
  return readJSON(KEYS.PRODUCTS, []);
}

export function getProductById(id) {
  return getAllProducts().find((p) => p.id === id) || null;
}

export function getRelatedProducts(product, limit = 4) {
  return getAllProducts()
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export function saveAllProducts(products) {
  writeJSON(KEYS.PRODUCTS, products);
}

function generateId() {
  return "p-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

export function createProduct(data) {
  const products = getAllProducts();
  const product = {
    id: generateId(),
    sku: data.sku || "",
    name: data.name || "Untitled product",
    price: Number(data.price) || 0,
    category: data.category || "gifts",
    description: data.description || "",
     images: data.images && data.images.length ? data.images : [],
    availability: data.availability || "accepting",
    processingTime: data.processingTime || CONFIG.DEFAULT_PROCESSING_TIME,
    featured: !!data.featured,
    isNew: !!data.isNew,
    variations: data.variations || {},
  };
  products.push(product);
  saveAllProducts(products);
  return product;
}

export function updateProduct(id, updates) {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  saveAllProducts(products);
  return products[idx];
}

export function deleteProduct(id) {
  const products = getAllProducts().filter((p) => p.id !== id);
  saveAllProducts(products);
}

export function setAvailability(id, availability) {
  return updateProduct(id, { availability });
}

export function setProcessingTime(id, processingTime) {
  return updateProduct(id, { processingTime: processingTime || CONFIG.DEFAULT_PROCESSING_TIME });
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
