export type CartModifiers = Record<string, number>; // option productId -> count

export type CartItem = {
  productId: string;
  quantity: number;
  modifiers?: CartModifiers;
};

export type Cart = {
  items: CartItem[];
};

const STORAGE_KEY = "kc_cart";

export function loadCart(): Cart {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cart) : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function saveCart(cart: Cart): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function addToCart(cart: Cart, item: CartItem): Cart {
  const existing = cart.items.find(
    (i) =>
      i.productId === item.productId &&
      JSON.stringify(i.modifiers ?? {}) === JSON.stringify(item.modifiers ?? {})
  );
  if (existing) {
    return {
      items: cart.items.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
      ),
    };
  }
  return { items: [...cart.items, item] };
}

export function updateQuantity(cart: Cart, index: number, quantity: number): Cart {
  if (quantity <= 0) return removeItem(cart, index);
  return { items: cart.items.map((item, i) => (i === index ? { ...item, quantity } : item)) };
}

export function removeItem(cart: Cart, index: number): Cart {
  return { items: cart.items.filter((_, i) => i !== index) };
}
