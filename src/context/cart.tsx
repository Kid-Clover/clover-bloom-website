import { createContext, useContext, useEffect, useState } from "react";
import {
  type Cart,
  type CartItem,
  loadCart,
  saveCart,
  addToCart,
  updateQuantity,
  removeItem,
  cartItemCount,
} from "@/lib/cart";

type CartContextValue = {
  cart: Cart;
  itemCount: number;
  addItem: (item: CartItem) => void;
  setQuantity: (index: number, quantity: number) => void;
  remove: (index: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] });

  useEffect(() => {
    setCart(loadCart());
  }, []);

  function update(next: Cart) {
    setCart(next);
    saveCart(next);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cartItemCount(cart),
        addItem: (item) => update(addToCart(cart, item)),
        setQuantity: (index, qty) => update(updateQuantity(cart, index, qty)),
        remove: (index) => update(removeItem(cart, index)),
        clear: () => update({ items: [] }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
