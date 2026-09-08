import { renderNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { getCartTotals, clearCart } from "../services/cartService.js";
import { getProductById, canOrder } from "../services/productService.js";
import { saveOrder } from "../services/orderService.js";
import { formatPrice } from "../utils/currency.js";
import { CONFIG } from "../config.js";
import { generateOrderNumber } from "../utils/orderNumber.js";
import { buildOrderMessage, buildWhatsAppLink } from "../utils/whatsapp.js";
import { escapeHTML } from "../components/productCard.js";
import { showToast } from "../components/toast.js";

renderNavbar("", "");
renderFooter("");

const { subtotal, delivery, total, lines } = getCartTotals(CONFIG.DELIVERY_FEE, CONFIG.FREE_DELIVERY_THRESHOLD);
const form = document.getElementById("checkout-form");

if (!lines.length) {
  document.getElementById("checkout-empty").style.display = "";
  form.style.display = "none";
} else {
  renderSummary();
  setupPaymentToggle();
  form.addEventListener("submit", handleSubmit);
}

function renderSummary() {
  const itemsRoot = document.getElementById("checkout-items");
  itemsRoot.innerHTML = lines
    .map((l) => {
      const variationText = l.variation && Object.keys(l.variation).length ? ` (${Object.values(l.variation).join(", ")})` : "";
      const processingLine = l.processingTime ? `<p class="summary-row__processing">Est. ${escapeHTML(l.processingTime)}</p>` : "";
      return `<div class="summary-row-block"><div class="summary-row"><span>${l.qty} × ${escapeHTML(l.name)}${escapeHTML(variationText)}</span><span>${formatPrice(l.price * l.qty)}</span></div>${processingLine}</div>`;
    })
    .join("");
  document.getElementById("checkout-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("checkout-delivery").textContent = delivery === 0 ? "Free" : formatPrice(delivery);
  document.getElementById("checkout-total").textContent = formatPrice(total);
}

function setupPaymentToggle() {
  document.querySelectorAll(".payment-option").forEach((label) => {
    label.addEventListener("click", () => {
      document.querySelectorAll(".payment-option").forEach((l) => l.classList.remove("selected"));
      label.classList.add("selected");
      label.querySelector('input[type="radio"]').checked = true;
    });
  });
}

const FIELDS = [
  { id: "fullName", required: true },
  { id: "phone", required: true, pattern: /^[0-9+\-\s]{7,15}$/ },
  { id: "whatsapp", required: false, pattern: /^[0-9+\-\s]{7,15}$/ },
  { id: "email", required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { id: "address", required: true },
  { id: "city", required: true },
  { id: "postalCode", required: false },
];

function validate() {
  let valid = true;
  FIELDS.forEach(({ id, required, pattern }) => {
    const input = document.getElementById(id);
    const fieldEl = document.getElementById("field-" + id);
    const value = input.value.trim();
    let fieldValid = true;
    if (required && !value) fieldValid = false;
    if (value && pattern && !pattern.test(value)) fieldValid = false;

    fieldEl.classList.toggle("has-error", !fieldValid);
    if (!fieldValid) valid = false;
  });
  return valid;
}

function handleSubmit(e) {
  e.preventDefault();

  const unavailable = lines.filter((l) => {
    const product = getProductById(l.productId);
    return !product || !canOrder(product);
  });
  if (unavailable.length) {
    showToast("One or more items in your cart are no longer accepting orders. Please update your cart.", "error");
    setTimeout(() => (location.href = "cart.html"), 1200);
    return;
  }

  if (!validate()) {
    document.querySelector(".form-field.has-error input, .form-field.has-error textarea")?.focus();
    return;
  }

  const submitBtn = document.getElementById("place-order-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Placing order...";

  const customer = {
    fullName: val("fullName"),
    phone: val("phone"),
    whatsapp: val("whatsapp") || val("phone"),
    email: val("email"),
    address: val("address"),
    city: val("city"),
    postalCode: val("postalCode"),
  };
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  const order = {
    orderId: generateOrderNumber(),
    customer,
    items: lines.map((l) => ({ ...l })),
    subtotal,
    deliveryFee: delivery,
    total,
    paymentMethod,
    date: new Date().toISOString(),
    status: "Pending",
  };

   saveOrder(order);

  const message = buildOrderMessage(order);
  const waLink = buildWhatsAppLink(message);

  clearCart();

  // Persist which order to show on the confirmation screen, then hand off to WhatsApp.
  sessionStorage.setItem("kbl_last_order_id", order.orderId);
  window.open(waLink, "_blank");
  location.href = "order-confirmation.html?orderId=" + encodeURIComponent(order.orderId);
}

function val(id) {
  return document.getElementById(id).value.trim();
}
