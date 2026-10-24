import { renderNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { productCardHTML, bindAddToCartButtons } from "../components/productCard.js";
import { queryProducts } from "../services/productService.js";
import { CATEGORIES } from "../data/categories.js";

renderNavbar("", "shop");
renderFooter("");

const params = new URLSearchParams(location.search);

const state = {
  search: "",
  category: params.get("category") || "all",
  minPrice: null,
  maxPrice: null,
  sort: "featured",
};

// On phones/tablets the filters stack above the products, so after picking a
// category we scroll down to the results. On desktop the sidebar sits beside
// the products, so no scrolling is needed.
function scrollToResults() {
  if (!window.matchMedia("(max-width: 900px)").matches) return;
  const target = document.querySelector(".shop-toolbar");
  if (!target) return;
  // Wait for the new product grid to finish laying out, then scroll to it.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

// Render category filter checkboxes
const categoryFilterEl = document.getElementById("filter-categories");
function renderCategoryFilters() {
  const all = [{ slug: "all", name: "All Categories" }, ...CATEGORIES];
  categoryFilterEl.innerHTML = all
    .map(
      (c) => `
    <label class="filters__option">
      <input type="radio" name="category" value="${c.slug}" ${state.category === c.slug ? "checked" : ""} />
      ${c.name}
    </label>`
    )
    .join("");
  categoryFilterEl.querySelectorAll('input[name="category"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.category = input.value;
      render();
      scrollToResults();
    });
  });
}

document.getElementById("search-input").addEventListener("input", (e) => {
  state.search = e.target.value;
  render();
});
document.getElementById("sort-select").addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});
document.getElementById("filter-min-price").addEventListener("input", (e) => {
  state.minPrice = e.target.value ? Number(e.target.value) : null;
  render();
});
document.getElementById("filter-max-price").addEventListener("input", (e) => {
  state.maxPrice = e.target.value ? Number(e.target.value) : null;
  render();
});

document.getElementById("clear-filters").addEventListener("click", () => {
  state.search = "";
  state.category = "all";
  state.minPrice = null;
  state.maxPrice = null;
  state.sort = "featured";
  document.getElementById("search-input").value = "";
  document.getElementById("sort-select").value = "featured";
  document.getElementById("filter-min-price").value = "";
  document.getElementById("filter-max-price").value = "";
  renderCategoryFilters();
  render();
});

const grid = document.getElementById("product-grid");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");

function render() {
  const results = queryProducts(state);
  resultCount.textContent = `${results.length} product${results.length === 1 ? "" : "s"}`;
  grid.style.display = results.length ? "" : "none";
  emptyState.style.display = results.length ? "none" : "";
  grid.innerHTML = results.map((p) => productCardHTML(p)).join("");
  bindAddToCartButtons(grid);
}

renderCategoryFilters();
render();

// Arriving from a homepage category card (shop.html?category=...): go straight
// to the products. Skipped when the link has a #categories anchor, because that
// link is meant to land on the filters.
if (params.get("category") && !location.hash) {
  setTimeout(scrollToResults, 150);
}