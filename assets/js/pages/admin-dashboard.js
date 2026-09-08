import { requireAdminAuth } from "../services/adminAuth.js";
import { renderAdminSidebar } from "../components/adminSidebar.js";
import { getAllProducts, canOrder } from "../services/productService.js";
import { getAllOrders } from "../services/orderService.js";
import { formatPrice } from "../utils/currency.js";
import { escapeHTML } from "../components/productCard.js";

requireAdminAuth(document.getElementById("admin-login-root"), document.getElementById("admin-content"), init);

function init() {
  renderAdminSidebar("dashboard");
  renderStats();
  renderRecentOrders();
}

function renderStats() {
  const products = getAllProducts();
  const orders = getAllOrders();
  const notAccepting = products.filter((p) => !canOrder(p)).length;
  const pending = orders.filter((o) => o.status === "Pending").length;

  const stats = [
    { label: "Total Products", value: products.length },
    { label: "Currently Accepting Orders", value: products.length - notAccepting },
    { label: "Not Accepting Orders", value: notAccepting },
    { label: "Total Local Orders", value: orders.length },
    { label: "Pending Orders", value: pending },
  ];

  document.getElementById("stat-grid").innerHTML = stats
    .map((s) => `<div class="stat-card"><p class="stat-card__label">${s.label}</p><p class="stat-card__value">${s.value}</p></div>`)
    .join("");
}

function renderRecentOrders() {
  const orders = getAllOrders().slice(0, 8);
  const table = document.getElementById("recent-orders-table");

  if (!orders.length) {
    table.outerHTML = `<div class="empty-state"><h3>No orders yet</h3><p>Orders placed through checkout will show up here.</p></div>`;
    return;
  }

  table.innerHTML = `
    <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>
      ${orders
        .map(
          (o) => `
        <tr>
          <td>${escapeHTML(o.orderId)}</td>
          <td>${escapeHTML(o.customer.fullName)}</td>
          <td>${formatPrice(o.total)}</td>
          <td>${escapeHTML(o.paymentMethod)}</td>
          <td><span class="pill">${escapeHTML(o.status)}</span></td>
          <td>${new Date(o.date).toLocaleDateString()}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  `;
}
