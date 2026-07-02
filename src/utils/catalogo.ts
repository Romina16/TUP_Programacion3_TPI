import type { ICategory } from "../types/categoria";
import type { Product } from "../types/product";
import { fetchJson } from "./fetchJson";
import { getCategoriaOverrides, getProductoOverrides } from "./localStorage";

// Combina el JSON base con los cambios hechos desde el panel de administración
// (guardados en localStorage) para que altas/ediciones/bajas persistan en toda la
// app durante la sesión, aunque el JSON en sí no se modifique.
export async function getCategorias(): Promise<ICategory[]> {
  const base = await fetchJson<ICategory[]>("categorias.json");
  const overrides = getCategoriaOverrides();

  const combinadas = base.map((c) => overrides[c.id] ?? c);
  const nuevas = Object.values(overrides).filter((c) => !base.some((b) => b.id === c.id));

  return [...combinadas, ...nuevas];
}

export async function getProductos(): Promise<Product[]> {
  const base = await fetchJson<Product[]>("productos.json");
  const overrides = getProductoOverrides();

  const combinados = base.map((p) => overrides[p.id] ?? p);
  const nuevos = Object.values(overrides).filter((p) => !base.some((b) => b.id === p.id));

  return [...combinados, ...nuevos];
}
