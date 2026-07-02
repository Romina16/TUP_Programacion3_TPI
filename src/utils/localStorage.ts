import type { IUser } from "../types/IUser";
import type { CartItem } from "../types/product";
import type { Pedido } from "../types/pedido";
import type { Usuario } from "../types/usuario";

const KEY_USER = "userData";
const KEY_CART = "cart";
const KEY_PEDIDOS_LOCALES = "pedidosLocal";
const KEY_USUARIOS_REGISTRADOS = "usuariosRegistrados";

export const saveUser = (user: IUser): void => {
  localStorage.setItem(KEY_USER, JSON.stringify(user));
};

export const getUser = (): IUser | null => {
  const raw = localStorage.getItem(KEY_USER);
  return raw ? (JSON.parse(raw) as IUser) : null;
};

export const removeUser = (): void => {
  localStorage.removeItem(KEY_USER);
};

export const getCart = (): CartItem[] => {
  const raw = localStorage.getItem(KEY_CART);
  return raw ? (JSON.parse(raw) as CartItem[]) : [];
};

export const saveCart = (items: CartItem[]): void => {
  localStorage.setItem(KEY_CART, JSON.stringify(items));
};

// Los pedidos confirmados en el checkout no se pueden persistir en el JSON (es de
// solo lectura), pero deben sobrevivir a la navegación entre páginas (Carrito ->
// Mis Pedidos) propia de esta app multipágina. Se guardan en localStorage y se
// combinan con pedidos.json al listar.
export const getPedidosLocales = (): Pedido[] => {
  const raw = localStorage.getItem(KEY_PEDIDOS_LOCALES);
  return raw ? (JSON.parse(raw) as Pedido[]) : [];
};

export const savePedidoLocal = (pedido: Pedido): void => {
  const pedidos = getPedidosLocales();
  pedidos.push(pedido);
  localStorage.setItem(KEY_PEDIDOS_LOCALES, JSON.stringify(pedidos));
};

export const actualizarPedidoLocal = (pedido: Pedido): void => {
  const pedidos = getPedidosLocales().map((p) => (p.id === pedido.id ? pedido : p));
  localStorage.setItem(KEY_PEDIDOS_LOCALES, JSON.stringify(pedidos));
};

// Los usuarios registrados en el formulario de registro tampoco se persisten en el
// JSON (F8.1); se guardan en localStorage para que el login funcione tras el
// auto-login y la navegación a la página siguiente.
export const getUsuariosRegistrados = (): Usuario[] => {
  const raw = localStorage.getItem(KEY_USUARIOS_REGISTRADOS);
  return raw ? (JSON.parse(raw) as Usuario[]) : [];
};

export const addUsuarioRegistrado = (usuario: Usuario): void => {
  const usuarios = getUsuariosRegistrados();
  usuarios.push(usuario);
  localStorage.setItem(KEY_USUARIOS_REGISTRADOS, JSON.stringify(usuarios));
};
