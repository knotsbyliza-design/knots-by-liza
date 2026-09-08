import { CONFIG } from "../config.js";
import { formatPrice } from "./currency.js";

/**
 * Builds the plain-text WhatsApp order message for a placed order.
 */
export function buildOrderMessage(order) {
    const lines = order.items
    .map((item) => {
      const variationText = formatVariation(item.variation);
      const nameLine = `${item.qty} × ${item.name}${variationText}`;
      const priceLine = item.qty > 1 ? `${formatPrice(item.price)} each` : formatPrice(item.price);
      const processingLine = item.processingTime ? `Est. processing time: ${item.processingTime}` : "";
      return [nameLine, priceLine, processingLine].filter(Boolean).join("\n");
    })
    .join("\n\n");

    const paymentNote = `${order.paymentMethod} (please send payment details)`;

  return [
    `NEW ORDER — ${CONFIG.BUSINESS_NAME.toUpperCase()}`,
    ``,
    `Order Number:`,
    order.orderId,
    ``,
    `Customer:`,
    order.customer.fullName,
    ``,
    `Phone:`,
    order.customer.phone,
    ``,
    `WhatsApp:`,
    order.customer.whatsapp,
    ``,
    `Address:`,
    `${order.customer.address}, ${order.customer.city}${order.customer.postalCode ? " " + order.customer.postalCode : ""}`,
    ``,
    `Payment:`,
    paymentNote,
    ``,
    `ORDER DETAILS:`,
    ``,
    lines,
    ``,
    `Subtotal:`,
    formatPrice(order.subtotal),
    ``,
    `Delivery:`,
    formatPrice(order.deliveryFee),
    ``,
    `TOTAL:`,
    formatPrice(order.total),
    ``,
    `Please prepare this order.`,
  ].join("\n");
}

function formatVariation(variation) {
  if (!variation || Object.keys(variation).length === 0) return "";
  const parts = Object.entries(variation).map(([k, v]) => `${v}`);
  return ` (${parts.join(", ")})`;
}

/**
 * Builds a wa.me link that opens WhatsApp with the message pre-filled.
 * The business number comes from CONFIG.BUSINESS_WHATSAPP_NUMBER only —
 * it is never hard-coded anywhere else in the app.
 */
export function buildWhatsAppLink(message, phoneNumber = CONFIG.BUSINESS_WHATSAPP_NUMBER) {
  const digits = String(phoneNumber).replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
