import { placeholderImage } from "../utils/placeholder.js";

/**
 * ============================================================
 *  SAMPLE PRODUCTS
 * ============================================================
 *  These are demonstration products only, kept separate from
 *  the rest of the system so they're easy to find and replace.
 *  They are used ONLY to seed localStorage the very first time
 *  someone visits the site. Once real products are added or
 *  edited through /admin, the site uses whatever is saved in
 *  localStorage instead of this file.
 *
 *  To go live with your own catalogue: open /admin/products.html,
 *  delete these sample entries, and add your real products.
 * ============================================================
 */

function img(category, seed) {
  return placeholderImage(category, seed);
}

export const SAMPLE_PRODUCTS = [
  {
    id: "Product-001",
    sku: "KBL-PLUSHIES-001",
    name: "Bunny Plushie",
    price: 3000,
    category: "Plushies",
    description:
      "Chenille yarn. Filled with polyfiber filling",
    images: [ "/assets/js/data/images/bunny.png" ],
     availability: "accepting",
    processingTime: "3–5 business days",
    featured: true,
    isNew: false,
    variations: {
      colour: ["custom"],
    },
  },
  {
    id: "Product-002",
    sku: "KBL-BAG-001",
    name: "Mini Wallet",
    price: 700,
    category: "Bags",
    description:
      "Pocket sized wallet, can hold your cards and your money easily",
    images: [ "/assets/js/data/images/wallet.png"],
    availability: "accepting",
    processingTime: "3–5 business days",
    featured: false,
    isNew: false,
    variations: {
      colour: ["Lavender", "White"],
    },
  },
  {
    id: "Product-003",
    sku: "KBL-FLW-001",
    name: "Forever Rose",
    price: 350,
    category: "Flowers & Bouquets",
    description:
      " Single Simple Rose.",
    images: ["/assets/js/data/images/rose.jpg"],
        availability: "accepting",
    processingTime: "2–3 business days",
    featured: false,
    isNew: false,
    variations: {
      colour: [ "custom"],
    },
  },
  {
    id: "product-004",
    sku: "KBL-FLW-002",
    name: "Jasmine Flower",
    price: 450,
    category: "Flowers & Bouquets",
    description: "A single crochet jasmine flower.",
    images: [ "/assets/js/data/images/jasmine.jpg"],
        availability: "accepting",
    processingTime: "2–3 business days",
    featured: false,
    isNew: false,
    variations: { colour: [, "White", ] },
  },
  {
    id: "sample-005",
    sku: "KBL-KEY-001",
    name: "Tiny Tulip Keychain",
    price: 500,
    category: "keychains",
    description: "A miniature crochet tulip keychain with a sturdy clasp — a small, thoughtful everyday accessory.",
    images: [img("keychains", 0)],
        availability: "accepting",
    processingTime: "2–3 business days",
    featured: true,
    isNew: false,
    variations: { colour: ["Lavender", "White", "Pink"] },
  },
  {
    id: "sample-006",
    sku: "KBL-KEY-002",
    name: "Strawberry Charm Keychain",
    price: 550,
    category: "keychains",
    description: "A plump little crochet strawberry charm, stitched with a soft cotton yarn and secured to a keyring.",
    images: [img("keychains", 1)],
        availability: "accepting",
    processingTime: "3–4 business days",
    featured: false,
    isNew: true,
    variations: {},
  },
  {
    id: "sample-007",
    sku: "KBL-PLU-001",
    name: "Bunny Plushie",
    price: 2200,
    category: "plushies",
    description:
      "A soft, huggable crochet bunny with embroidered facial details and floppy ears. Stuffed with hypoallergenic polyfill.",
    images: [img("plushies", 0), img("plushies", 1)],
        availability: "accepting",
    processingTime: "5–7 business days",
    featured: true,
    isNew: false,
    variations: {
      size: ["Small", "Medium", "Large"],
    },
  },
  {
    id: "sample-008",
    sku: "KBL-PLU-002",
    name: "Baby Elephant Plushie",
    price: 2400,
    category: "plushies",
    description: "A round, gentle little elephant plushie with soft grey-lavender yarn and a stitched smile.",
    images: [img("plushies", 2)],
        availability: "limited",
    processingTime: "10–14 business days",
    featured: false,
    isNew: true,
    variations: { size: ["Small", "Medium"] },
  },
  {
    id: "sample-009",
    sku: "KBL-ACC-001",
    name: "Scalloped Hair Clip Set",
    price: 900,
    category: "accessories",
    description: "A set of two crochet-wrapped hair clips with a scalloped edge, finished with a matte coating for hold.",
    images: [img("accessories", 0)],
        availability: "accepting",
    processingTime: "2–3 business days",
    featured: false,
    isNew: false,
    variations: { colour: ["Lavender", "White"] },
  },
  {
    id: "sample-010",
    sku: "KBL-ACC-002",
    name: "Granny Square Scrunchie",
    price: 400,
    category: "accessories",
    description: "A soft, oversized scrunchie made from a classic granny-square motif, gentle on all hair types.",
    images: [img("accessories", 1)],
        availability: "accepting",
    processingTime: "2–3 business days",
    featured: false,
    isNew: false,
    variations: { colour: ["Lavender", "White", "Pink"] },
  },
  {
    id: "sample-011",
    sku: "KBL-DEC-001",
    name: "Mandala Wall Hanging",
    price: 2600,
    category: "home-decor",
    description: "A delicate mandala-style wall hanging with layered rings and a soft tassel fringe, ready to hang.",
    images: [img("home-decor", 0), img("home-decor", 1)],
        availability: "limited",
    processingTime: "10–12 business days",
    featured: true,
    isNew: false,
    variations: {},
  },
  {
    id: "sample-012",
    sku: "KBL-DEC-002",
    name: "Coaster Set (4pc)",
    price: 1200,
    category: "home-decor",
    description: "A set of four textured crochet coasters, thick enough to protect surfaces and quick to wipe clean.",
    images: [img("home-decor", 2)],
        availability: "accepting",
    processingTime: "4–5 business days",
    featured: false,
    isNew: true,
    variations: { colour: ["Lavender", "White"] },
  },
  {
    id: "sample-013",
    sku: "KBL-GFT-001",
    name: "New Baby Gift Set",
    price: 3600,
    category: "gifts",
    description:
      "A ready-to-gift bundle including a baby rattle, a pair of booties and a small blanket corner, wrapped and ready to give.",
    images: [img("gifts", 0)],
        availability: "limited",
    processingTime: "12–14 business days",
    featured: true,
    isNew: false,
    variations: {},
  },
  {
    id: "sample-014",
    sku: "KBL-CUS-001",
    name: "Custom Name Keychain",
    price: 700,
    category: "custom-crochet",
    description:
      "A made-to-order keychain spelling out a name or short word in crochet letters. Message us on WhatsApp with your request after ordering.",
    images: [img("custom-crochet", 0)],
        availability: "accepting",
    processingTime: "5–7 business days",
    featured: false,
    isNew: true,
    variations: {},
  },
];
