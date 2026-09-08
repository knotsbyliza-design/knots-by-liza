import { CONFIG } from "../config.js";

const SESSION_KEY = "kbl_admin_session";

/**
 * IMPORTANT: This is a client-side convenience gate only. The password
 * lives in a JS file that ships to the browser, so it is NOT secure
 * against anyone who opens dev tools or views source. Do not use this
 * to protect anything truly sensitive. It exists only to keep the
 * admin screens from being stumbled onto by casual visitors.
 */
export function isAdminAuthed() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export function attemptLogin(password) {
  const ok = password === CONFIG.ADMIN_PASSWORD;
  if (ok) sessionStorage.setItem(SESSION_KEY, "true");
  return ok;
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Gates access to an admin page without destroying the page's own markup.
 * @param {HTMLElement} loginRoot - an empty element the login form renders into
 * @param {HTMLElement} contentRoot - the real admin page content, hidden until authenticated
 * @param {Function} onSuccess - called once authenticated (immediately, or after login)
 */
export function requireAdminAuth(loginRoot, contentRoot, onSuccess) {
  if (isAdminAuthed()) {
    contentRoot.style.display = "";
    onSuccess();
    return;
  }

  contentRoot.style.display = "none";
  loginRoot.innerHTML = `
    <div class="admin-login">
      <h2>Admin Login</h2>
      <p class="note-box">This is a simple client-side password gate for convenience only.
      It is <strong>not secure</strong> — anyone with access to the site's code can bypass it.
      Do not store real secrets behind it.</p>
      <div class="form-field">
        <label for="admin-password">Password</label>
        <input type="password" id="admin-password" class="text-input" autocomplete="current-password" />
      </div>
      <button class="btn btn--primary btn--block" id="admin-login-btn">Log In</button>
      <p class="form-error" id="admin-login-error" style="display:none; margin-top:10px">Incorrect password.</p>
    </div>
  `;

  const input = loginRoot.querySelector("#admin-password");
  const btn = loginRoot.querySelector("#admin-login-btn");
  const errorEl = loginRoot.querySelector("#admin-login-error");

  function tryLogin() {
    if (attemptLogin(input.value)) {
      loginRoot.innerHTML = "";
      contentRoot.style.display = "";
      onSuccess();
    } else {
      errorEl.style.display = "block";
    }
  }

  btn.addEventListener("click", tryLogin);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });
  input.focus();
}
