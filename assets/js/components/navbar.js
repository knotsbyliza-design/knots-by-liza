import { CONFIG } from "../config.js";
import { getCartCount } from "../services/cartService.js";

/**
 * Renders the site navbar into #navbar-root.
 * @param {string} base - relative path prefix to the site root ("" for root pages, "../" for /admin/*)
 * @param {string} active - which link to mark active: "home" | "shop" | "about" | "contact"
 */
export function renderNavbar(base = "", active = "") {
  const root = document.getElementById("navbar-root");
  if (!root) return;

  const link = (href, label, key) =>
    `<a href="${base}${href}" class="navbar__link${active === key ? " navbar__link--active" : ""}">${label}</a>`;

  root.innerHTML = `
    <div class="navbar">
      <div class="navbar__inner">
        <a href="${base}index.html" class="navbar__brand" aria-label="${CONFIG.BUSINESS_NAME} home">
          <span class="knot-mark" aria-hidden="true">${knotMarkSVG()}</span>
          <span class="navbar__brand-text">${CONFIG.BUSINESS_NAME}</span>
        </a>

        <nav class="navbar__links" id="navbar-links" aria-label="Main navigation">
          ${link("index.html", "Home", "home")}
          ${link("shop.html", "Shop", "shop")}
          ${link("shop.html#categories", "Categories", "categories")}
          ${link("about.html", "About", "about")}
          ${link("contact.html", "Contact", "contact")}
          <a href="${CONFIG.INSTAGRAM_URL}" class="navbar__link" target="_blank" rel="noopener">Instagram</a>
        </nav>

        <div class="navbar__actions">
          <a href="${base}cart.html" class="navbar__cart" aria-label="View cart">
            ${cartIconSVG()}
            <span class="navbar__cart-count" id="navbar-cart-count">0</span>
          </a>
          <button class="navbar__hamburger" id="navbar-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="navbar-links">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>
  `;

  const hamburger = document.getElementById("navbar-hamburger");
  const links = document.getElementById("navbar-links");
  hamburger.addEventListener("click", () => {
    const open = links.classList.toggle("navbar__links--open");
    hamburger.classList.toggle("navbar__hamburger--open", open);
    hamburger.setAttribute("aria-expanded", String(open));
  });

  updateCartBadge();
  document.addEventListener("cart:changed", updateCartBadge);
}

function updateCartBadge() {
  const el = document.getElementById("navbar-cart-count");
  if (!el) return;
  const count = getCartCount();
  el.textContent = String(count);
  el.style.display = count > 0 ? "" : "none";
}

function cartIconSVG() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
    <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="10" cy="21" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="17" cy="21" r="1.4" fill="currentColor" stroke="none"/>
  </svg>`;
}

export function knotMarkSVG() {
  return `<svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20c0-6 4-9 8-9s6 3 6 6-3 5-6 5-4-2-4-4 2-3 3-3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M28 20c0 6-4 9-8 9s-6-3-6-6 3-5 6-5 4 2 4 4-2 3-3 3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}
