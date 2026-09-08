import { renderNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { getCartTotals, updateQty, removeFromCart } from "../services/cartService.js";
import { getProductById, canOrder } from "../services/productService.js";
import { formatPrice } from "../utils/currency.js";
import { CONFIG } from "../config.js";
import { escapeHTML } from "../components/productCard.js";
import { showToast } from "../components/toast.js";

renderNavbar("", "");
renderFooter("");

function variationText(variation) {
  if (!variation || !Object.keys(variation).length) return "";
  return Object.values(variation).join(" · ");
}

function render() {
  const { subtotal, delivery, total, lines } = getCartTotals(CONFIG.DELIVERY_FEE, CONFIG.FREE_DELIVERY_THRESHOLD);

  const emptyEl = document.getElementById("cart-empty");
  const layoutEl = document.getElementById("cart-layout");

  if (!lines.length) {
    emptyEl.style.display = "";
    layoutEl.style.display = "none";
    return;
  }
  emptyEl.style.display = "none";
  layoutEl.style.display = "";

  const linesRoot = document.getElementById("cart-lines");
  linesRoot.innerHTML = lines
        .map((line) => {
      const product = getProductById(line.productId);
      const orderable = product ? canOrder(product) : false;
      return `
      <div class="cart-line" data-product-id="${line.productId}" data-variation='${escapeHTML(JSON.stringify(line.variation))}'>
        <img class="cart-line__img" src="${line.image}" alt="${escapeHTML(line.name)}" />
        <div>
          <p class="cart-line__name">${escapeHTML(line.name)}</p>
          ${line.variation && Object.keys(line.variation).length ? `<p class="cart-line__variation">${escapeHTML(variationText(line.variation))}</p>` : ""}
          <p class="cart-line__price">${formatPrice(line.price)} each</p>
          ${!orderable ? `<p class="cart-line__warning">⚠ ${!product ? "This item is no longer available." : "We're not accepting orders for this item right now."} Please remove it to check out.</p>` : ""}
          <div class="qty-stepper" style="margin-top:8px">
            <button type="button" class="js-qty-minus" aria-label="Decrease quantity">–</button>
            <input type="number" class="js-qty-input" value="${line.qty}" min="1" max="${CONFIG.MAX_QTY_PER_LINE}" />
            <button type="button" class="js-qty-plus" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="cart-line__right">
          <p style="font-weight:700">${formatPrice(line.price * line.qty)}</p>
          <button class="cart-line__remove js-remove">Remove</button>
        </div>
      </div>`;
    })
    .join("");
    

  linesRoot.querySelectorAll(".cart-line").forEach((lineEl) => {
    const productId = lineEl.dataset.productId;
    const variation = JSON.parse(lineEl.dataset.variation);
    const qtyInput = lineEl.querySelector(".js-qty-input");

    lineEl.querySelector(".js-qty-minus").addEventListener("click", () => {
      updateQty(productId, variation, Math.max(1, Number(qtyInput.value) - 1));
      render();
    });
    lineEl.querySelector(".js-qty-plus").addEventListener("click", () => {
      const before = Number(qtyInput.value);
      updateQty(productId, variation, before + 1);
      render();
      showToastIfCapped(productId, before);
    });
    qtyInput.addEventListener("change", () => {
      updateQty(productId, variation, Number(qtyInput.value) || 1);
      render();
    });
    lineEl.querySelector(".js-remove").addEventListener("click", () => {
      removeFromCart(productId, variation);
      showToast("Item removed", "info");
      render();
    });
  });

  document.getElementById("summary-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("summary-delivery").textContent = delivery === 0 ? "Free" : formatPrice(delivery);
  document.getElementById("summary-total").textContent = formatPrice(total);

  const noteEl = document.getElementById("free-delivery-note");
  if (CONFIG.FREE_DELIVERY_THRESHOLD && subtotal < CONFIG.FREE_DELIVERY_THRESHOLD) {
    const remaining = CONFIG.FREE_DELIVERY_THRESHOLD - subtotal;
    noteEl.textContent = `Add ${formatPrice(remaining)} more to get free delivery.`;
  } else {
    noteEl.textContent = "";
  }
}

function showToastIfCapped(productId, before) {
  if (before >= CONFIG.MAX_QTY_PER_LINE) {
    showToast(`You've reached the max quantity for this item.`, "error");
  }
}


render();
document.addEventListener("cart:changed", render);
