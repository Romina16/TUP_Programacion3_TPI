import type { ICategory } from "../../../types/categoria";
import type { EstadoPedido, Pedido } from "../../../types/pedido";
import type { Product } from "../../../types/product";
import { logout } from "../../../utils/auth";
import { fetchJson } from "../../../utils/fetchJson";
import { getPedidosLocales, getUser } from "../../../utils/localStorage";
import { initPage } from "../../../utils/navigate";

if (!initPage("ADMIN")) {
  throw new Error("redirecting");
}

const statsGrid = document.getElementById("statsGrid") as HTMLDivElement;
const resumenPanel = document.getElementById("resumenPanel") as HTMLDivElement;
const welcomeMsg = document.getElementById("welcome-msg") as HTMLLIElement;
const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;

btnLogout.addEventListener("click", logout);

function statCard(valor: number, label: string): string {
  return `<div class="stat-card"><div class="stat-card__value">${valor}</div><div class="stat-card__label">${label}</div></div>`;
}

async function init(): Promise<void> {
  const user = getUser();
  if (user) welcomeMsg.textContent = `Hola, ${user.nombre}`;

  const [categorias, productos, pedidosJson] = await Promise.all([
    fetchJson<ICategory[]>("categorias.json"),
    fetchJson<Product[]>("productos.json"),
    fetchJson<Pedido[]>("pedidos.json"),
  ]);
  const pedidos = [...pedidosJson, ...getPedidosLocales()];

  const categoriasActivas = categorias.filter((c) => !c.eliminado).length;
  const productosActivos = productos.filter((p) => !p.eliminado);
  const disponibles = productosActivos.filter((p) => p.disponible).length;

  statsGrid.innerHTML =
    statCard(categoriasActivas, "Categorías") +
    statCard(productosActivos.length, "Productos") +
    statCard(pedidos.length, "Pedidos") +
    statCard(disponibles, "Productos disponibles");

  const porEstado: Record<EstadoPedido, number> = {
    PENDIENTE: 0,
    CONFIRMADO: 0,
    TERMINADO: 0,
    CANCELADO: 0,
  };
  pedidos.forEach((p) => porEstado[p.estado]++);

  resumenPanel.innerHTML = `
    <h3>Resumen</h3>
    <ul>
      <li>Categorías activas: ${categoriasActivas} / ${categorias.length}</li>
      <li>Productos activos: ${productosActivos.length} / ${productos.length} (disponibles: ${disponibles})</li>
      <li>Pedidos: PENDIENTE ${porEstado.PENDIENTE} | CONFIRMADO ${porEstado.CONFIRMADO} | TERMINADO ${porEstado.TERMINADO} | CANCELADO ${porEstado.CANCELADO}</li>
    </ul>
  `;
}

init();
