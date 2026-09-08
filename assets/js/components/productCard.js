import { formatPrice } from "../utils/currency.js";
import { getCategoryName } from "../data/categories.js";
import { canOrder, getAvailabilityBadge, getProcessingTime } from "../services/productService.js";
import { addToCart } from "../services/cartService.js";
import { showToast } from "./toast.js";

/**
 * Returns an HTML string for a single product card.
 * @param {object} product
 * @param {string} base - relative path prefix to site root
 */
export function productCardHTML(product, base = "") {
  const orderable = canOrder(product);
  const availabilityBadge = getAvailabilityBadge(product); // null | "Longer Wait" | "Not Accepting Orders"
  const badge = product.isNew
    ? '<span class="badge badge--new">New</span>'
    : availabilityBadge === "Not Accepting Orders"
    ? '<span class="badge badge--paused">Not Accepting Orders</span>'
    : availabilityBadge === "Longer Wait"
    ? '<span class="badge badge--limited">Longer Wait</span>'
    : "";

  return `
    <article class="product-card" data-product-id="${product.id}">
      <a href="${base}product.html?id=${product.id}" class="product-card__media">
        <img src="${product.images[0] || ""}" alt="${escapeHTML(product.name)}" loading="lazy" />
        ${badge}
      </a>
      <div class="product-card__body">
        <p class="product-card__category">${getCategoryName(product.category)}</p>
        <a href="${base}product.html?id=${product.id}" class="product-card__name">${escapeHTML(product.name)}</a>
        <p class="product-card__desc">${escapeHTML(truncate(product.description, 70))}</p>
        <p class="product-card__price">${formatPrice(product.price)}</p>
        ${orderable ? `<p class="product-card__processing">Ready in ${escapeHTML(getProcessingTime(product))}</p>` : ""}
        <div class="product-card__actions">
          <a href="${base}product.html?id=${product.id}" class="btn btn--ghost btn--small">View Details</a>
          <button class="btn btn--primary btn--small js-add-to-cart" data-product-id="${product.id}" ${orderable ? "" : "disabled"}>
            ${orderable ? "Add to Cart" : "Not Accepting Orders"}
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Attaches click handlers for "Add to Cart" buttons within a container.
 * Call this after inserting productCardHTML into the DOM.
 * Only for products with NO variations — variation products should use
 * their product detail page.
 */
export function bindAddToCartButtons(container) {
  container.querySelectorAll(".js-add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.productId;
      const result = addToCart(id, {}, 1);
      if (result.ok) {
        btn.classList.add("btn--bounce");
        setTimeout(() => btn.classList.remove("btn--bounce"), 300);
        showToast("Added to cart 💜", "success");
            } else if (result.reason === "max-qty") {
        showToast(`You've reached the max quantity for this item.`, "error");
      } else if (result.reason === "not-accepting") {
        showToast("Sorry, I'm not accepting orders for that item right now.", "error");
      }
    });
  });
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max).trim() + "…" : str;
}

export function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
