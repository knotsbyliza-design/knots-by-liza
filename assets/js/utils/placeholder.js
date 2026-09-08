/**
 * Generates a soft, on-brand placeholder image for products that don't yet
 * have a real photograph. Returns a data: URI so no network request or
 * external asset is needed. Replace `images: [...]` in a product with real
 * photo paths (e.g. "assets/images/products/my-bag-1.jpg") whenever you like.
 */

const ICONS = {
  bags: '<path d="M70 95 h60 l8 90 h-76 z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M85 95 v-14 a15 15 0 0 1 30 0 v14" fill="none" stroke="currentColor" stroke-width="4"/>',
  flowers:
    '<circle cx="100" cy="100" r="10" fill="currentColor"/>' +
    [0, 60, 120, 180, 240, 300]
      .map(
        (a) =>
          `<ellipse cx="100" cy="70" rx="12" ry="22" fill="none" stroke="currentColor" stroke-width="3.5" transform="rotate(${a} 100 100)"/>`
      )
      .join(""),
  keychains:
    '<circle cx="100" cy="60" r="16" fill="none" stroke="currentColor" stroke-width="4"/><path d="M100 76 v20" stroke="currentColor" stroke-width="4"/><rect x="80" y="96" width="40" height="55" rx="14" fill="none" stroke="currentColor" stroke-width="4"/>',
  plushies:
    '<circle cx="100" cy="90" r="34" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="78" cy="58" r="14" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="122" cy="58" r="14" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="90" cy="86" r="3" fill="currentColor"/><circle cx="110" cy="86" r="3" fill="currentColor"/><path d="M92 100 q8 8 16 0" fill="none" stroke="currentColor" stroke-width="3"/>',
  accessories:
    '<path d="M60 100 a40 24 0 1 0 80 0 a40 24 0 1 0 -80 0" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="100" cy="100" r="8" fill="currentColor"/>',
  "home-decor":
    '<circle cx="100" cy="100" r="42" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="100" cy="100" r="26" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="100" cy="100" r="10" fill="none" stroke="currentColor" stroke-width="3"/>',
  gifts:
    '<rect x="60" y="90" width="80" height="65" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M60 110 h80" stroke="currentColor" stroke-width="4"/><path d="M100 90 v65" stroke="currentColor" stroke-width="4"/><path d="M100 90 c-20 -30 -46 -4 0 0 c46 -4 20 -30 0 0" fill="none" stroke="currentColor" stroke-width="3.5"/>',
  "custom-crochet":
    '<path d="M65 70 q35 -30 70 0" fill="none" stroke="currentColor" stroke-width="4"/><path d="M65 100 q35 -30 70 0" fill="none" stroke="currentColor" stroke-width="4"/><path d="M65 130 q35 -30 70 0" fill="none" stroke="currentColor" stroke-width="4"/>',
  "new-arrivals":
    '<path d="M100 55 l12 28 30 3 -23 20 7 30 -26 -16 -26 16 7 -30 -23 -20 30 -3 z" fill="none" stroke="currentColor" stroke-width="4"/>',
};

const PALETTES = [
  ["#F3EDFA", "#7C5FA6"],
  ["#EFE7F7", "#8A6BB0"],
  ["#F7F2FB", "#6B4E8E"],
  ["#F0E9F8", "#9A7BC0"],
];

/**
 * @param {string} categorySlug
 * @param {number} seed used to vary the palette a little between products
 * @returns {string} data: URI
 */
export function placeholderImage(categorySlug, seed = 0) {
  const icon = ICONS[categorySlug] || ICONS["home-decor"];
  const [bg, fg] = PALETTES[seed % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${bg}"/>
    <g color="${fg}" transform="translate(0,4)">${icon}</g>
    <text x="100" y="182" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="${fg}" opacity="0.75">Knots by Liza</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
