import { renderNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { CONFIG } from "../config.js";
import { buildWhatsAppLink } from "../utils/whatsapp.js";

renderNavbar("", "contact");
renderFooter("");

document.getElementById("contact-whatsapp").href = buildWhatsAppLink("Hi! I have a question about Knots by Liza.");
document.getElementById("contact-instagram").href = CONFIG.INSTAGRAM_URL;
document.getElementById("contact-instagram-handle").textContent = "@" + CONFIG.INSTAGRAM_USERNAME;
document.getElementById("contact-email").textContent = CONFIG.BUSINESS_EMAIL;
document.getElementById("contact-hours").textContent = CONFIG.BUSINESS_HOURS;
