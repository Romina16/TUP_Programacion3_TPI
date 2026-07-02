import type { EstadoPedido, Pedido } from "../../../types/pedido";
import type { Product } from "../../../types/product";
import { fetchJson } from "../../../utils/fetchJson";
import { getPedidosLocales, getUser } from "../../../utils/localStorage";
import { initPage } from "../../../utils/navigate";

if (!initPage("USUARIO")) {
  throw new Error("redirecting");
}

const ordersList = document.getElementById("ordersList") as HTMLDivElement;
const confirmMsg = document.getElementById("confirmMsg") as HTMLParagraphElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;
const modalContent = document.getElementById("modalContent") as HTMLDivElement;

const BADGE_CLASS: Record<EstadoPedido, string> = {
  PENDIENTE: "badge--pendiente",
  CONFIRMADO: "badge--confirmado",
  TERMINADO: "badge--terminado",
  CANCELADO: "badge--cancelado",
};

function fmt(valor: number): string {
  return `$${valor.toLocaleString("es-AR")}`;
}

async function init(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  if (params.get("confirmado") === "1") confirmMsg.hidden = false;

  const user = getUser();
  if (!user) return;

  const [pedidosJson, productos] = await Promise.all([
    fetchJson<Pedido[]>("pedidos.json"),
    fetchJson<Product[]>("productos.json"),
  ]);

  const pedidos = [...pedidosJson, ...getPedidosLocales()]
    .filter((p) => p.idUsuario === user.id)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  if (pedidos.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-state">
        <p>Todavía no tenés pedidos.</p>
        <a class="btn-checkout" href="../../store/home/home.html">Ir a la tienda</a>
      </div>`;
    return;
  }

  ordersList.innerHTML = "";
  pedidos.forEach((pedido) => {
    const nombresProductos = pedido.detalles
      .slice(0, 3)
      .map((d) => productos.find((p) => p.id === d.idProducto)?.nombre ?? "Producto")
      .join(", ");

    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-card__header">
        <strong>Pedido #${pedido.id}</strong>
        <span class="badge ${BADGE_CLASS[pedido.estado]}">${pedido.estado}</span>
      </div>
      <p>Fecha: ${pedido.fecha}</p>
      <p>${nombresProductos}${pedido.detalles.length > 3 ? "…" : ""}</p>
      <p class="order-card__total">Total: ${fmt(pedido.total)}</p>
    `;
    card.addEventListener("click", () => abrirDetalle(pedido, productos));
    ordersList.appendChild(card);
  });
}

function abrirDetalle(pedido: Pedido, productos: Product[]): void {
  const filas = pedido.detalles
    .map((d) => {
      const producto = productos.find((p) => p.id === d.idProducto);
      return `<li>${producto?.nombre ?? "Producto"} x${d.cantidad} — ${fmt(d.subtotal)}</li>`;
    })
    .join("");

  modalContent.innerHTML = `
    <h2>Pedido #${pedido.id}</h2>
    <p>Estado: <span class="badge ${BADGE_CLASS[pedido.estado]}">${pedido.estado}</span></p>
    <p>Fecha: ${pedido.fecha}</p>
    <p>Forma de pago: ${pedido.formaPago}</p>
    <ul>${filas}</ul>
    <p><strong>Total: ${fmt(pedido.total)}</strong></p>
  `;
  modalOverlay.classList.add("modal--show");
}

modalClose.addEventListener("click", () => modalOverlay.classList.remove("modal--show"));

init();
