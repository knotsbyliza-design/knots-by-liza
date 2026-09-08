import { renderNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { getOrderById } from "../services/orderService.js";
import { formatPrice } from "../utils/currency.js";
import { buildOrderMessage, buildWhatsAppLink } from "../utils/whatsapp.js";
import { escapeHTML } from "../components/productCard.js";

renderNavbar("", "");
renderFooter("");

const params = new URLSearchParams(location.search);
const orderId = params.get("orderId") || sessionStorage.getItem("kbl_last_order_id");
const order = orderId ? getOrderById(orderId) : null;
const root = document.getElementById("confirmation-root");

if (!order) {
  root.innerHTML = `
    <div class="empty-state">
      <h3>We couldn't find that order</h3>
      <p>If you just placed an order, please check your WhatsApp for confirmation, or contact us directly.</p>
      <a href="index.html" class="btn btn--primary" style="margin-top:16px">Back to Home</a>
    </div>`;
} else {
  const waLink = buildWhatsAppLink(buildOrderMessage(order));

  root.innerHTML = `
    <div class="confirmation__icon">💜</div>
    <h1>Thank you for your order!</h1>
    <p style="color:var(--ink-muted)">
      Thank you! I've received your order request. Please contact me on WhatsApp to receive payment details for your ${escapeHTML(order.paymentMethod).toLowerCase()}.
    </p>

    <div class="confirmation-card">
      <div class="confirmation-row"><span>Order Number</span><span><strong>${escapeHTML(order.orderId)}</strong></span></div>
      <div class="confirmation-row"><span>Name</span><span>${escapeHTML(order.customer.fullName)}</span></div>
      <div class="confirmation-row"><span>Delivery Address</span><span>${escapeHTML(order.customer.address)}, ${escapeHTML(order.customer.city)}</span></div>
      <div class="confirmation-row"><span>Payment Method</span><span>${escapeHTML(order.paymentMethod)}</span></div>
      <div class="confirmation-row"><span>Items</span><span>${order.items.reduce((s, i) => s + i.qty, 0)}</span></div>
      <div class="confirmation-row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
      <div class="confirmation-row"><span>Delivery</span><span>${formatPrice(order.deliveryFee)}</span></div>
      <div class="confirmation-row"><span><strong>Total</strong></span><span><strong>${formatPrice(order.total)}</strong></span></div>
    </div>

    <p style="font-size:0.85rem;color:var(--ink-faint);margin-bottom:24px">
      This order number is generated on your device for your reference, not a centrally guaranteed database ID.
    </p>

    <div class="confirmation__ctas">
      <a href="shop.html" class="btn btn--secondary">Continue Shopping</a>
      <a href="${waLink}" target="_blank" rel="noopener" class="btn btn--whatsapp">Contact me on WhatsApp</a>
      <a href="index.html" class="btn btn--ghost">Back to Home</a>
    </div>
  `;
}
