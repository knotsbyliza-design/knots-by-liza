import { readJSON, writeJSON, KEYS } from "./storage.js";

export const ORDER_STATUSES = ["Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];

export function getAllOrders() {
  return readJSON(KEYS.ORDERS, []);
}

export function getOrderById(orderId) {
  return getAllOrders().find((o) => o.orderId === orderId) || null;
}

export function saveOrder(order) {
  const orders = getAllOrders();
  orders.unshift(order); // newest first
  writeJSON(KEYS.ORDERS, orders);
  return order;
}

export function updateOrderStatus(orderId, status) {
  const orders = getAllOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) return null;
  order.status = status;
  writeJSON(KEYS.ORDERS, orders);
  return order;
}

export function getOrderStats() {
  const orders = getAllOrders();
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
  };
}
