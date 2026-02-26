// src/lib/cart.js
// localStorage cart utilities — cart lives in the browser.
// Called by: ProductDetailPage (addToCart), CartPage (getCart, removeFromCart),
//            CheckoutPage (getCart, clearCart), Navbar (getCartCount).

const CART_KEY = 'revibe_cart';

// Returns the full cart array from localStorage
export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Returns the number of items in the cart (for the Navbar badge)
export function getCartCount() {
  return getCart().length;
}

// Adds a product to the cart. Second-hand items are unique — prevents duplicates.
// Returns true if added, false if already in cart.
export function addToCart(product) {
  const cart = getCart();
  if (cart.some(item => item.id === product.id)) return false;
  cart.push({
    id: product.id,
    title: product.title,
    brand: product.brand,
    price: product.price,
    size: product.size,
    fit: product.fit,
    wash: product.wash,
    image: product.images?.[0] || null,
  });
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  return true;
}

// Removes a single item from the cart by product id
export function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}

// Empties the entire cart (called after a successful order)
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
}
