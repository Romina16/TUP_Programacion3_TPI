import type { CartItem, Product } from "../types/product";
import { getCart, saveCart } from "./localStorage";

// Costo de envio fijo para esta iteracion (F5.2 Carrito de Compras). El total del
// pedido generado en el checkout es subtotal + ENVIO.
export const ENVIO = 500;

export const addToCart = (product: Product, cantidad: number): void => {
  const cart = getCart();
  const existente = cart.find((i) => i.id === product.id);

  if (existente) {
    existente.cantidad = Math.min(existente.cantidad + cantidad, product.stock);
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad,
      imagen: product.imagen,
      stock: product.stock,
    });
  }

  saveCart(cart);
};

export const removeFromCart = (productId: number): void => {
  saveCart(getCart().filter((i) => i.id !== productId));
};

export const updateCantidad = (productId: number, cantidad: number): void => {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.cantidad = Math.max(1, Math.min(cantidad, item.stock));
    saveCart(cart);
  }
};

export const clearCart = (): void => {
  saveCart([]);
};

export const calcularSubtotal = (items: CartItem[]): number =>
  items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

export const calcularTotal = (items: CartItem[]): number =>
  items.length === 0 ? 0 : calcularSubtotal(items) + ENVIO;
