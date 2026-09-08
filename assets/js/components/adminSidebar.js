import { CONFIG } from "../config.js";
import { adminLogout } from "../services/adminAuth.js";

export function renderAdminSidebar(active) {
  const root = document.getElementById("admin-sidebar-root");
  if (!root) return;

  const link = (href, label, key) =>
    `<a href="${href}" class="${active === key ? "active" : ""}">${label}</a>`;

  root.innerHTML = `
    <aside class="admin-sidebar">
      <span class="admin-sidebar__brand">${CONFIG.BUSINESS_NAME} Admin</span>
      ${link("index.html", "Dashboard", "dashboard")}
      ${link("products.html", "Products", "products")}
      ${link("orders.html", "Orders", "orders")}
      <a href="../index.html">View Store</a>
      <button id="admin-logout-btn" style="background:none;border:none;color:#E4D6F5;text-align:left;width:100%;padding:10px 12px;cursor:pointer;font-size:0.92rem;margin-top:20px;border-top:1px solid rgba(255,255,255,0.15)">Log Out</button>
    </aside>
  `;

  root.querySelector("#admin-logout-btn").addEventListener("click", () => {
    adminLogout();
    location.reload();
  });
}
