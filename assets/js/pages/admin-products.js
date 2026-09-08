import { requireAdminAuth } from "../services/adminAuth.js";
import { renderAdminSidebar } from "../components/adminSidebar.js";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  canOrder,
  AVAILABILITY_STATUSES,
} from "../services/productService.js";
import { CATEGORIES, getCategoryName } from "../data/categories.js";
import { formatPrice } from "../utils/currency.js";
import { escapeHTML } from "../components/productCard.js";
import { placeholderImage } from "../utils/placeholder.js";

let searchTerm = "";
let categoryFilter = "all";

requireAdminAuth(document.getElementById("admin-login-root"), document.getElementById("admin-content"), init);

function init() {
  renderAdminSidebar("products");
  populateCategoryFilter();
  bindToolbar();
  document.getElementById("add-product-btn").addEventListener("click", () => openProductModal(null));
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
      <tr><th></th><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Availability</th><th>Processing Time</th><th>Actions</th></tr>
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
          <td style="white-space:nowrap">
            <button class="btn btn--ghost btn--small js-edit" data-id="${p.id}">Edit</button>
            <button class="btn btn--ghost btn--small js-toggle-pause" data-id="${p.id}">${canOrder(p) ? "Pause Orders" : "Resume Orders"}</button>
            <button class="btn btn--ghost btn--small js-delete" data-id="${p.id}" style="color:var(--error)">Delete</button>
          </td>
        </tr>`
        )
        .join("")}
    </tbody>
  `;

  table.querySelectorAll(".js-edit").forEach((btn) =>
    btn.addEventListener("click", () => openProductModal(getAllProducts().find((p) => p.id === btn.dataset.id)))
  );
    table.querySelectorAll(".js-toggle-pause").forEach((btn) =>
    btn.addEventListener("click", () => {
      const product = getAllProducts().find((p) => p.id === btn.dataset.id);
      updateProduct(product.id, { availability: canOrder(product) ? "paused" : "accepting" });
      renderTable();
    })
  );

  table.querySelectorAll(".js-delete").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (confirm("Delete this product? This cannot be undone.")) {
        deleteProduct(btn.dataset.id);
        renderTable();
      }
    })
  );
}

function openProductModal(product) {
  const isEdit = !!product;
  const root = document.getElementById("product-modal-root");
  const variationColours = (product?.variations?.colour || []).join(", ");
  const variationSizes = (product?.variations?.size || []).join(", ");

  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal">
        <h2 style="margin-bottom:18px">${isEdit ? "Edit Product" : "Add Product"}</h2>
        <form id="product-form">
          <div class="form-field">
            <label for="pf-name">Product Name</label>
            <input type="text" id="pf-name" class="text-input" required value="${escapeAttr(product?.name)}" />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="pf-sku">SKU / Product Code</label>
              <input type="text" id="pf-sku" class="text-input" value="${escapeAttr(product?.sku)}" />
            </div>
            <div class="form-field">
              <label for="pf-category">Category</label>
              <select id="pf-category" class="select-input">
                ${CATEGORIES.map((c) => `<option value="${c.slug}" ${product?.category === c.slug ? "selected" : ""}>${c.name}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="pf-price">Price (PKR)</label>
              <input type="number" min="0" id="pf-price" class="text-input" required value="${product?.price ?? ""}" />
            </div>
                        <div class="form-field">
              <label for="pf-availability">Availability</label>
              <select id="pf-availability" class="select-input">
                ${AVAILABILITY_STATUSES.map(
                  (s) => `<option value="${s.value}" ${(product?.availability || "accepting") === s.value ? "selected" : ""}>${s.label}</option>`
                ).join("")}
              </select>
            </div>
          </div>
          <div class="form-field">
            <label for="pf-processingTime">Processing Time <span class="hint">(e.g. "5–7 business days")</span></label>
            <input type="text" id="pf-processingTime" class="text-input" value="${escapeAttr(product?.processingTime)}" placeholder="5–7 business days" />
          </div>
          <div class="form-field">
            <label for="pf-description">Description</label>
            <textarea id="pf-description" class="text-input" rows="3">${escapeHTML(product?.description || "")}</textarea>
          </div>

          <div class="form-field">
            <label>Product Images</label>
            <input type="file" id="pf-images" accept="image/*" multiple class="text-input" />
            <p class="hint">Upload photos from your device. Leave empty to keep a placeholder image.</p>
            <div id="pf-image-preview" style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap"></div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="pf-colours">Colour Variations <span class="hint">(comma separated, optional)</span></label>
              <input type="text" id="pf-colours" class="text-input" placeholder="Lavender, White, Pink" value="${escapeAttr(variationColours)}" />
            </div>
            <div class="form-field">
              <label for="pf-sizes">Size Variations <span class="hint">(comma separated, optional)</span></label>
              <input type="text" id="pf-sizes" class="text-input" placeholder="Small, Medium, Large" value="${escapeAttr(variationSizes)}" />
            </div>
          </div>

          <div class="form-row">
            <label class="filters__option"><input type="checkbox" id="pf-featured" ${product?.featured ? "checked" : ""} /> Featured (show on homepage best sellers)</label>
            <label class="filters__option"><input type="checkbox" id="pf-isNew" ${product?.isNew ? "checked" : ""} /> Mark as New Arrival</label>
          </div>

          <div style="display:flex; gap:10px; margin-top:20px">
            <button type="submit" class="btn btn--primary" style="flex:1">${isEdit ? "Save Changes" : "Add Product"}</button>
            <button type="button" class="btn btn--ghost" id="modal-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  let uploadedImages = product?.images ? [...product.images] : [];
  renderImagePreview();

  function renderImagePreview() {
    document.getElementById("pf-image-preview").innerHTML = uploadedImages
      .map((src, i) => `<img src="${src}" style="width:56px;height:56px;object-fit:cover;border-radius:6px" data-index="${i}" />`)
      .join("");
  }

  document.getElementById("pf-images").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    const dataUrls = await Promise.all(readers);
    uploadedImages = dataUrls; // replace: latest upload wins for this edit session
    renderImagePreview();
  });

  document.getElementById("modal-cancel-btn").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });

  document.getElementById("product-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const category = document.getElementById("pf-category").value;
    const colours = splitList(document.getElementById("pf-colours").value);
    const sizes = splitList(document.getElementById("pf-sizes").value);
    const variations = {};
    if (colours.length) variations.colour = colours;
    if (sizes.length) variations.size = sizes;

        const data = {
      name: document.getElementById("pf-name").value.trim(),
      sku: document.getElementById("pf-sku").value.trim(),
      category,
      price: Number(document.getElementById("pf-price").value) || 0,
      availability: document.getElementById("pf-availability").value,
      processingTime: document.getElementById("pf-processingTime").value.trim(),
      description: document.getElementById("pf-description").value.trim(),
      images: uploadedImages.length ? uploadedImages : [placeholderImage(category, Date.now())],
      featured: document.getElementById("pf-featured").checked,
      isNew: document.getElementById("pf-isNew").checked,
      variations,
    };

    if (isEdit) {
      updateProduct(product.id, data);
    } else {
      createProduct(data);
    }
    closeModal();
    renderTable();
  });
}

function closeModal() {
  document.getElementById("product-modal-root").innerHTML = "";
}

function availabilityPill(p) {
  if (p.availability === "paused") return '<span class="pill pill--out">Not Accepting</span>';
  if (p.availability === "limited") return '<span class="pill pill--limited">Longer Wait</span>';
  return '<span class="pill pill--status">Accepting</span>';
}


function splitList(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function escapeAttr(str) {
  return (str ?? "").toString().replace(/"/g, "&quot;");
}
