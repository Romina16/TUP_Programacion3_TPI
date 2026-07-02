import type { EstadoPedido, Pedido } from "../../../types/pedido";
import type { Product } from "../../../types/product";
import type { Usuario } from "../../../types/usuario";
import { logout } from "../../../utils/auth";
import { getProductos } from "../../../utils/catalogo";
import { fetchJson } from "../../../utils/fetchJson";
import { actualizarPedidoLocal, getPedidosLocales, getUsuariosRegistrados } from "../../../utils/localStorage";
import { initPage } from "../../../utils/navigate";

if (!initPage("ADMIN")) {
  throw new Error("redirecting");
}

const ordersList = document.getElementById("ordersList") as HTMLDivElement;
const filtroEstado = document.getElementById("filtroEstado") as HTMLSelectElement;
const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;
const modalContent = document.getElementById("modalContent") as HTMLDivElement;

btnLogout.addEventListener("click", logout);

const BADGE_CLASS: Record<EstadoPedido, string> = {
  PENDIENTE: "badge--pendiente",
  CONFIRMADO: "badge--confirmado",
  TERMINADO: "badge--terminado",
  CANCELADO: "badge--cancelado",
};

let pedidos: Pedido[] = [];
let productos: Product[] = [];
let usuarios: Usuario[] = [];
let idsLocales = new Set<number>();

function fmt(valor: number): string {
  return `$${valor.toLocaleString("es-AR")}`;
}

function nombreCliente(idUsuario: number): string {
  const u = usuarios.find((u) => u.id === idUsuario);
  return u ? `${u.nombre} ${u.apellido}` : "Desconocido";
}

function render(): void {
  const filtro = filtroEstado.value as EstadoPedido | "";
  const visibles = pedidos
    .filter((p) => !filtro || p.estado === filtro)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  if (visibles.length === 0) {
    ordersList.innerHTML = `<div class="empty-state"><p>No hay pedidos para mostrar.</p></div>`;
    return;
  }

  ordersList.innerHTML = "";
  visibles.forEach((pedido) => {
    const cantidadProductos = pedido.detalles.reduce((acc, d) => acc + d.cantidad, 0);
    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-card__header">
        <strong>Pedido #${pedido.id} - ${nombreCliente(pedido.idUsuario)}</strong>
        <span class="badge ${BADGE_CLASS[pedido.estado]}">${pedido.estado}</span>
      </div>
      <p>Fecha: ${pedido.fecha} | Productos: ${cantidadProductos}</p>
      <p class="order-card__total">Total: ${fmt(pedido.total)}</p>
    `;
    card.addEventListener("click", () => abrirDetalle(pedido));
    ordersList.appendChild(card);
  });
}

function abrirDetalle(pedido: Pedido): void {
  const filas = pedido.detalles
    .map((d) => {
      const producto = productos.find((p) => p.id === d.idProducto);
      return `<li>${producto?.nombre ?? "Producto"} x${d.cantidad} — ${fmt(d.subtotal)}</li>`;
    })
    .join("");

  modalContent.innerHTML = `
    <h2>Pedido #${pedido.id}</h2>
    <p>Cliente: ${nombreCliente(pedido.idUsuario)}</p>
    <p>Fecha: ${pedido.fecha}</p>
    <p>Forma de pago: ${pedido.formaPago}</p>
    <ul>${filas}</ul>
    <p><strong>Total: ${fmt(pedido.total)}</strong></p>
    <div class="form-group">
      <label for="nuevoEstado">Cambiar estado</label>
      <select id="nuevoEstado">
        <option value="PENDIENTE" ${pedido.estado === "PENDIENTE" ? "selected" : ""}>Pendiente</option>
        <option value="CONFIRMADO" ${pedido.estado === "CONFIRMADO" ? "selected" : ""}>Confirmado</option>
        <option value="TERMINADO" ${pedido.estado === "TERMINADO" ? "selected" : ""}>Terminado</option>
        <option value="CANCELADO" ${pedido.estado === "CANCELADO" ? "selected" : ""}>Cancelado</option>
      </select>
    </div>
    <button class="btn-checkout" id="btnGuardarEstado">Guardar estado</button>
  `;
  modalOverlay.classList.add("modal--show");

  const btnGuardar = document.getElementById("btnGuardarEstado") as HTMLButtonElement;
  const select = document.getElementById("nuevoEstado") as HTMLSelectElement;

  btnGuardar.addEventListener("click", () => {
    const nuevoEstado = select.value as EstadoPedido;
    pedidos = pedidos.map((p) => (p.id === pedido.id ? { ...p, estado: nuevoEstado } : p));

    // Los pedidos que se originaron en el checkout (guardados en localStorage) se
    // actualizan tambien ahi para que "Mis Pedidos" refleje el nuevo estado.
    if (idsLocales.has(pedido.id)) {
      actualizarPedidoLocal({ ...pedido, estado: nuevoEstado });
    }

    modalOverlay.classList.remove("modal--show");
    render();
  });
}

modalClose.addEventListener("click", () => modalOverlay.classList.remove("modal--show"));
filtroEstado.addEventListener("change", render);

async function init(): Promise<void> {
  const [pedidosJson, productosJson, usuariosJson] = await Promise.all([
    fetchJson<Pedido[]>("pedidos.json"),
    getProductos(),
    fetchJson<Usuario[]>("usuarios.json"),
  ]);

  const pedidosLocales = getPedidosLocales();
  idsLocales = new Set(pedidosLocales.map((p) => p.id));

  pedidos = [...pedidosJson, ...pedidosLocales];
  productos = productosJson;
  usuarios = [...usuariosJson, ...getUsuariosRegistrados()];

  render();
}

init();
