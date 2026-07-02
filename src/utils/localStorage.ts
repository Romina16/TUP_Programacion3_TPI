import type { IUser } from "../types/IUser";
import type { ICategory } from "../types/categoria";
import type { CartItem, Product } from "../types/product";
import type { Pedido } from "../types/pedido";
import type { Usuario } from "../types/usuario";

const KEY_USER = "userData";
const KEY_CART = "cart";
const KEY_PEDIDOS_LOCALES = "pedidosLocal";
const KEY_USUARIOS_REGISTRADOS = "usuariosRegistrados";
const KEY_CATEGORIAS_OVERRIDES = "categoriasOverrides";
const KEY_PRODUCTOS_OVERRIDES = "productosOverrides";

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

// El panel de administración no puede escribir en los JSON de solo lectura, pero al
// ser una app multipágina cada navegación recarga el script de la página: sin esto,
// una categoría o producto creado en una pantalla del admin no aparece en las demás.
// Se guarda un "overlay" por ID en localStorage (altas, ediciones y bajas lógicas)
// que se combina con el JSON base cada vez que se listan categorías/productos, para
// que los cambios persistan durante la sesión en todo el sitio (catálogo incluido).
export const getCategoriaOverrides = (): Record<number, ICategory> => {
  const raw = localStorage.getItem(KEY_CATEGORIAS_OVERRIDES);
  return raw ? (JSON.parse(raw) as Record<number, ICategory>) : {};
};

export const saveCategoriaOverride = (categoria: ICategory): void => {
  const overrides = getCategoriaOverrides();
  overrides[categoria.id] = categoria;
  localStorage.setItem(KEY_CATEGORIAS_OVERRIDES, JSON.stringify(overrides));
};

export const getProductoOverrides = (): Record<number, Product> => {
  const raw = localStorage.getItem(KEY_PRODUCTOS_OVERRIDES);
  return raw ? (JSON.parse(raw) as Record<number, Product>) : {};
};

export const saveProductoOverride = (producto: Product): void => {
  const overrides = getProductoOverrides();
  overrides[producto.id] = producto;
  localStorage.setItem(KEY_PRODUCTOS_OVERRIDES, JSON.stringify(overrides));
};
