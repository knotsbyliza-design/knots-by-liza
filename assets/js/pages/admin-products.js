import { requireAdminAuth } from "../services/adminAuth.js";
import { renderAdminSidebar } from "../components/adminSidebar.js";
import { getAllProducts } from "../services/productService.js";
import { CATEGORIES, getCategoryName } from "../data/categories.js";
import { formatPrice } from "../utils/currency.js";
import { escapeHTML } from "../components/productCard.js";

let searchTerm = "";
let categoryFilter = "all";

requireAdminAuth(document.getElementById("admin-login-root"), document.getElementById("admin-content"), init);

function init() {
  renderAdminSidebar("products");
  populateCategoryFilter();
  bindToolbar();
  renderTable();
}

function populateCategoryFilter() {
  const select = document.getElementById("admin-category-filter");
  select.innerHTML =
    `<option value="all">All Categories</option>` +
    CATEGORIES.map((c) => `<option value="${c.slug}">${c.name}</option>`).join("");
  select.addEventListener("change", () => {
    categoryFilter = select.value;
    renderTable();
  });
}

function bindToolbar() {
  document.getElementById("admin-search").addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderTable();
  });
}

function renderTable() {
  let products = getAllProducts();
  if (searchTerm) products = products.filter((p) => p.name.toLowerCase().includes(searchTerm));
  if (categoryFilter !== "all") products = products.filter((p) => p.category === categoryFilter);

  const table = document.getElementById("products-table");
  if (!products.length) {
    table.innerHTML = `<tr><td style="padding:30px;text-align:center;color:var(--ink-muted)">No products match.</td></tr>`;
    return;
  }

  table.innerHTML = `
    <thead>
      <tr><th></th><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Availability</th><th>Processing Time</th></tr>
    </thead>
    <tbody>
      ${products
        .map(
          (p) => `
        <tr>
          <td><img src="${p.images[0] || ""}" alt="" /></td>
          <td>${escapeHTML(p.name)} ${p.featured ? "⭐" : ""} ${p.isNew ? '<span class="pill">New</span>' : ""}</td>
          <td>${escapeHTML(p.sku || "—")}</td>
          <td>${getCategoryName(p.category)}</td>
          <td>${formatPrice(p.price)}</td>
          <td>${availabilityPill(p)}</td>
          <td>${escapeHTML(p.processingTime || "—")}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  `;
}

function availabilityPill(p) {
  if (p.availability === "paused") return '<span class="pill pill--out">Not Accepting</span>';
  if (p.availability === "limited") return '<span class="pill pill--limited">Longer Wait</span>';
  return '<span class="pill pill--status">Accepting</span>';
}