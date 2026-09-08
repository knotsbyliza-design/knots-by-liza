import { requireAdminAuth } from "../services/adminAuth.js";
import { renderAdminSidebar } from "../components/adminSidebar.js";
import { getAllOrders, updateOrderStatus, ORDER_STATUSES } from "../services/orderService.js";
import { formatPrice } from "../utils/currency.js";
import { escapeHTML } from "../components/productCard.js";

requireAdminAuth(document.getElementById("admin-login-root"), document.getElementById("admin-content"), init);

function init() {
  renderAdminSidebar("orders");
  renderTable();
}

function renderTable() {
  const orders = getAllOrders();
  const table = document.getElementById("orders-table");

  if (!orders.length) {
    table.innerHTML = "";
    table.outerHTML = `<div class="empty-state"><h3>No orders yet</h3><p>Orders placed through checkout will appear here.</p></div>`;
    return;
  }

  table.innerHTML = `
    <thead>
      <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th></th></tr>
    </thead>
    <tbody>
      ${orders
        .map(
          (o) => `
        <tr>
          <td>${escapeHTML(o.orderId)}</td>
          <td>${escapeHTML(o.customer.fullName)}<br/><span style="color:var(--ink-faint);font-size:0.78rem">${escapeHTML(o.customer.phone)}</span></td>
          <td>${o.items.reduce((s, i) => s + i.qty, 0)}</td>
          <td>${formatPrice(o.total)}</td>
          <td>${escapeHTML(o.paymentMethod)}</td>
          <td>${new Date(o.date).toLocaleDateString()}</td>
          <td>
            <select class="select-input js-status" data-id="${o.orderId}" style="font-size:0.82rem;padding:6px 8px">
              ${ORDER_STATUSES.map((s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </td>
          <td><button class="btn btn--ghost btn--small js-view" data-id="${o.orderId}">View</button></td>
        </tr>`
        )
        .join("")}
    </tbody>
  `;

  table.querySelectorAll(".js-status").forEach((select) =>
    select.addEventListener("change", () => {
      updateOrderStatus(select.dataset.id, select.value);
    })
  );
  table.querySelectorAll(".js-view").forEach((btn) =>
    btn.addEventListener("click", () => openOrderModal(getAllOrders().find((o) => o.orderId === btn.dataset.id)))
  );
}

function openOrderModal(order) {
  const root = document.getElementById("order-modal-root");
  root.innerHTML = `
    <div class="modal-backdrop" id="order-modal-backdrop">
      <div class="modal">
        <h2 style="margin-bottom:10px">${escapeHTML(order.orderId)}</h2>
        <p style="color:var(--ink-muted); font-size:0.9rem; margin-bottom:16px">${new Date(order.date).toLocaleString()}</p>

        <div class="confirmation-row"><span>Customer</span><span>${escapeHTML(order.customer.fullName)}</span></div>
        <div class="confirmation-row"><span>Phone</span><span>${escapeHTML(order.customer.phone)}</span></div>
        <div class="confirmation-row"><span>WhatsApp</span><span>${escapeHTML(order.customer.whatsapp)}</span></div>
        ${order.customer.email ? `<div class="confirmation-row"><span>Email</span><span>${escapeHTML(order.customer.email)}</span></div>` : ""}
        <div class="confirmation-row"><span>Address</span><span>${escapeHTML(order.customer.address)}, ${escapeHTML(order.customer.city)} ${escapeHTML(order.customer.postalCode || "")}</span></div>
        <div class="confirmation-row"><span>Payment</span><span>${escapeHTML(order.paymentMethod)}</span></div>

        <h3 style="margin:18px 0 10px">Items</h3>
        ${order.items
          .map((i) => {
            const variation = i.variation && Object.keys(i.variation).length ? ` (${Object.values(i.variation).join(", ")})` : "";
            return `<div class="confirmation-row"><span>${i.qty} × ${escapeHTML(i.name)}${escapeHTML(variation)}</span><span>${formatPrice(i.price * i.qty)}</span></div>`;
          })
          .join("")}
        <div class="confirmation-row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
        <div class="confirmation-row"><span>Delivery</span><span>${formatPrice(order.deliveryFee)}</span></div>
        <div class="confirmation-row"><span><strong>Total</strong></span><span><strong>${formatPrice(order.total)}</strong></span></div>

        <button class="btn btn--ghost btn--block" id="order-modal-close" style="margin-top:20px">Close</button>
      </div>
    </div>
  `;
  document.getElementById("order-modal-close").addEventListener("click", () => (root.innerHTML = ""));
  document.getElementById("order-modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "order-modal-backdrop") root.innerHTML = "";
  });
}
