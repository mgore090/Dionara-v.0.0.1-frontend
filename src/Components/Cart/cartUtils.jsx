
export const CART_KEY = "dinoraCart";
export const CART_UPDATED_EVENT = "dinoraCartUpdated";

export function getCartItems() {
  try {
    const items = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function notifyCartUpdated() {
  window.dispatchEvent(
    new Event(CART_UPDATED_EVENT)
  );
}

export function getCartCount(items = getCartItems()) {
  return items.reduce(
    (total, item) =>
      total + Math.max(0, Number(item.quantity) || 0),
    0
  );
}
