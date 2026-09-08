import { CONFIG } from "../config.js";
import { knotMarkSVG } from "./navbar.js";

export function renderFooter(base = "") {
  const root = document.getElementById("footer-root");
  if (!root) return;

  root.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__brand">
          <span class="knot-mark" aria-hidden="true">${knotMarkSVG()}</span>
          <div>
            <p class="site-footer__name">${CONFIG.BUSINESS_NAME}</p>
            <p class="site-footer__tagline">${CONFIG.BUSINESS_TAGLINE}</p>
          </div>
        </div>

        <nav class="site-footer__links" aria-label="Footer navigation">
          <a href="${base}shop.html">Shop</a>
          <a href="${base}about.html">About</a>
          <a href="${base}contact.html">Contact</a>
          <a href="${CONFIG.INSTAGRAM_URL}" target="_blank" rel="noopener">Instagram</a>
          <a href="https://wa.me/${CONFIG.BUSINESS_WHATSAPP_NUMBER}" target="_blank" rel="noopener">WhatsApp</a>
        </nav>

        <p class="site-footer__copy">© ${new Date().getFullYear()} ${CONFIG.BUSINESS_NAME}. All rights reserved.</p>
      </div>
    </footer>
  `;
}
