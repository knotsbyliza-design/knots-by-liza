/**
 * Product categories shown across the shop, filters and admin.
 * Add or remove entries here to change the categories store-wide.
 * `slug` must be unique and lowercase-hyphenated.
 */
export const CATEGORIES = [
  { slug: "bags", name: "Bags", blurb: "Tote bags, purses, mini bags, wallets etc." },
  { slug: "flowers", name: "Flowers & Bouquets", blurb: "Individual flowers and bouquets" },
  { slug: "keychains", name: "Keychains", blurb: "Little everyday charms" },
  { slug: "plushies", name: "Plushies", blurb: "Soft huggable friends" },
  { slug: "hairaccessories", name: "Hair Accessories", blurb: "Clips, scrunchies & more" },
  { slug: "handaccessories", name: "Hand Accessories", blurb: "Gloves, fingerless gloves, wrist accessories, gajras etc." },
  { slug: "home-decor", name: "Home Decor", blurb: "Cosy pieces for your space" },
  { slug: "tech-covers", name: "Tech Covers", blurb: "Mobile covers + laptop covers" },
  { slug: "clothing", name: "Clothing", blurb: "Dresses, cardigans, mufflers etc" },
  { slug: "baby-collection", name: "Baby Collection", blurb: "Baby sandals, baby dresses, baby bundles, etc." },
  { slug: "new-arrivals", name: "New Arrivals", blurb: "Fresh off the hook" },
];

export function getCategoryName(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.name : slug;
}
