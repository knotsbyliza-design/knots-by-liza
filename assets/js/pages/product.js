import { renderNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { productCardHTML, bindAddToCartButtons, escapeHTML } from "../components/productCard.js";
import { getProductById, getRelatedProducts, canOrder, getAvailabilityLabel, getProcessingTime } from "../services/productService.js";
import { addToCart } from "../services/cartService.js";
import { formatPrice } from "../utils/currency.js";
import { getCategoryName } from "../data/categories.js";
import { showToast } from "../components/toast.js";
import { CONFIG } from "../config.js";

renderNavbar("", "shop");
renderFooter("");

const params = new URLSearchParams(location.search);
const productId = params.get("id");
const product = productId ? getProductById(productId) : null;
const root = document.getElementById("product-root");

if (!product) {
  root.innerHTML = `
    <div class="empty-state">
      <h3>We couldn't find that product</h3>
      <p>It may have sold out permanently or been removed.</p>
      <a href="shop.html" class="btn btn--primary" style="margin-top:16px">Back to Shop</a>
    </div>`;
} else {
  document.getElementById("page-title").textContent = `${product.name} — Knots by Liza`;
  document.getElementById("page-description").setAttribute("content", product.description.slice(0, 155));
  renderProduct(product);
  renderRelated(product);
}

function renderProduct(p) {
  const orderable = canOrder(p);
  const variationKeys = Object.keys(p.variations || {}).filter((k) => p.variations[k] && p.variations[k].length);
  root.innerHTML = `
    <div class="product-detail">
      <div>
        <div class="product-detail__gallery-main">
          <img id="main-image" src="${p.images[0] || ""}" alt="${escapeHTML(p.name)}" />
        </div>
        ${
          p.images.length > 1
            ? `<div class="product-detail__thumbs">${p.images
                .map((img, i) => `<img src="${img}" class="${i === 0 ? "active" : ""}" data-index="${i}" alt="${escapeHTML(p.name)} view ${i + 1}" />`)
                .join("")}</div>`
            : ""
        }
      </div>

      <div>
        <p class="product-detail__category">${getCategoryName(p.category)}</p>
        <h1 class="product-detail__title">${escapeHTML(p.name)}</h1>
        <p class="product-detail__price">${formatPrice(p.price)}</p>

                <p class="product-detail__stock ${availabilityClass(p)}">${getAvailabilityLabel(p)}</p>
        ${orderable ? `<p class="product-detail__processing">Estimated processing time: ${escapeHTML(getProcessingTime(p))}</p>` : ""}
        <div id="variation-form">
          ${variationKeys
            .map(
              (key) => `
            <div class="variation-group" data-variation-key="${key}">
              <span class="variation-group__label">${capitalize(key)}</span>
              <div class="variation-options">
                ${p.variations[key]
                  .map(
                    (val, i) =>
                      `<button type="button" class="variation-chip ${i === 0 ? "selected" : ""}" data-value="${escapeHTML(val)}">${escapeHTML(val)}</button>`
                  )
                  .join("")}
              </div>
            </div>`
            )
            .join("")}
        </div>

        <div class="form-field" style="max-width:160px">
          <label for="qty-input">Quantity</label>
          <div class="qty-stepper">
            <button type="button" id="qty-minus" aria-label="Decrease quantity">–</button>
         <input type="number" id="qty-input" value="1" min="1" max="${CONFIG.MAX_QTY_PER_LINE}" ${orderable ? "" : "disabled"} />
            <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
          </div>
        </div>

         <div class="product-detail__actions">
          <button class="btn btn--secondary" id="add-to-cart-btn" ${orderable ? "" : "disabled"}>${orderable ? "Add to Cart" : "Not Accepting Orders"}</button>
          <button class="btn btn--primary" id="buy-now-btn" ${orderable ? "" : "disabled"}>Buy Now</button>
        </div>

        <p class="product-detail__desc">${escapeHTML(p.description)}</p>
        <p style="font-size:0.8rem; color:var(--ink-faint)">SKU: ${escapeHTML(p.sku || "—")}</p>
      </div>
    </div>
  `;

  // Gallery thumbs
  root.querySelectorAll(".product-detail__thumbs img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      root.querySelector("#main-image").src = thumb.src;
      root.querySelectorAll(".product-detail__thumbs img").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // Variation chips
  root.querySelectorAll(".variation-group").forEach((group) => {
    group.querySelectorAll(".variation-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        group.querySelectorAll(".variation-chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
      });
    });
  });

  // Qty stepper
  const qtyInput = root.querySelector("#qty-input");
  root.querySelector("#qty-minus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });
    root.querySelector("#qty-plus").addEventListener("click", () => {
    qtyInput.value = Math.min(CONFIG.MAX_QTY_PER_LINE, Number(qtyInput.value) + 1);
  });
  qtyInput.addEventListener("change", () => {
    qtyInput.value = Math.max(1, Math.min(CONFIG.MAX_QTY_PER_LINE, Number(qtyInput.value) || 1));
  });

  function getSelectedVariation() {
    const variation = {};
    root.querySelectorAll(".variation-group").forEach((group) => {
      const key = group.dataset.variationKey;
      const selected = group.querySelector(".variation-chip.selected");
      if (selected) variation[key] = selected.dataset.value;
    });
    return variation;
  }

    root.querySelector("#add-to-cart-btn")?.addEventListener("click", () => {
    const qty = Number(qtyInput.value) || 1;
    const result = addToCart(p.id, getSelectedVariation(), qty);
    if (result.ok) {
      showToast("Added to cart 💜", "success");
    } else if (result.reason === "max-qty") {
      showToast(`You've reached the max quantity for this item.`, "error");
    } else {
      showToast("Sorry, I am not accepting orders for that item right now.", "error");
    }
  });

  root.querySelector("#buy-now-btn")?.addEventListener("click", () => {
    const qty = Number(qtyInput.value) || 1;
    const result = addToCart(p.id, getSelectedVariation(), qty);
    if (result.ok) {
      location.href = "cart.html";
    } else {
      showToast("Sorry, we couldn't add that item.", "error");
    }
  });
}

function renderRelated(p) {
  const related = getRelatedProducts(p, 4);
  if (!related.length) return;
  document.getElementById("related-section").style.display = "";
  const grid = document.getElementById("related-grid");
  grid.innerHTML = related.map((r) => productCardHTML(r)).join("");
  bindAddToCartButtons(grid);
}

function availabilityClass(p) {
  if (p.availability === "paused") return "product-detail__stock--out";
  if (p.availability === "limited") return "product-detail__stock--limited";
  return "product-detail__stock--ok";
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}