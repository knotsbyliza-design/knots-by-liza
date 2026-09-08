import { renderNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { productCardHTML, bindAddToCartButtons } from "../components/productCard.js";
import { queryProducts } from "../services/productService.js";
import { CATEGORIES } from "../data/categories.js";
import { CONFIG } from "../config.js";
import { buildWhatsAppLink } from "../utils/whatsapp.js";

renderNavbar("", "home");
renderFooter("");

const featured = queryProducts({ sort: "featured" }).filter((p) => p.featured).slice(0, 4);
const fresh = queryProducts({ sort: "newest" }).filter((p) => p.isNew).slice(0, 4);

const featuredGrid = document.getElementById("featured-grid");
featuredGrid.innerHTML = (featured.length ? featured : queryProducts().slice(0, 4))
  .map((p) => productCardHTML(p))
  .join("");
bindAddToCartButtons(featuredGrid);

const newGrid = document.getElementById("new-grid");
newGrid.innerHTML = (fresh.length ? fresh : queryProducts().slice(0, 4)).map((p) => productCardHTML(p)).join("");
bindAddToCartButtons(newGrid);

const categoryGrid = document.getElementById("category-grid");
categoryGrid.innerHTML = CATEGORIES.map(
  (c) => `
  <a href="shop.html?category=${c.slug}" class="category-card">
    <span class="category-card__name">${c.name}</span>
    <span class="category-card__blurb">${c.blurb}</span>
  </a>`
).join("");

document.getElementById("instagram-link").href = CONFIG.INSTAGRAM_URL;
document.getElementById("custom-whatsapp-link").href = buildWhatsAppLink(
  "Hi! I have a custom crochet idea I'd love to ask about."
);
