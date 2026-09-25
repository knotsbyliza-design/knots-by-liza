let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-stack";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Shows a brief toast message. type: "success" | "error" | "info"
 */
/**
 * @param {string} message
 * @param {string} type "success" | "error" | "info"
 * @param {{label: string, href: string} | null} action optional clickable
 *   link shown alongside the message (e.g. "View Cart" → cart.html)
 */
export function showToast(message, type = "success", action = null) {
  const stack = getContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  if (action) {
    const link = document.createElement("a");
    link.className = "toast__action";
    link.href = action.href;
    link.textContent = action.label;
    toast.appendChild(link);
  }

  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  const duration = action ? 4000 : 2600;
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
