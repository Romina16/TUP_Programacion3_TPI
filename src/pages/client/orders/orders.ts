import type { EstadoPedido, Pedido } from "../../../types/pedido";
import type { Product } from "../../../types/product";
import { getProductos } from "../../../utils/catalogo";
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
    getProductos(),
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
    const itemsPreview = pedido.detalles
      .slice(0, 3)
      .map((d) => {
        const nombre = productos.find((p) => p.id === d.idProducto)?.nombre ?? "Producto";
        return `<li>${nombre} (x${d.cantidad})</li>`;
      })
      .join("");
    const cantidadProductos = pedido.detalles.reduce((acc, d) => acc + d.cantidad, 0);

    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-card__header">
        <strong>Pedido #${pedido.id}</strong>
        <span class="badge ${BADGE_CLASS[pedido.estado]}">${pedido.estado}</span>
      </div>
      <p class="order-card__date">📅 ${pedido.fecha}</p>
      <ul class="order-card__products">
        ${itemsPreview}
        ${pedido.detalles.length > 3 ? "<li>…</li>" : ""}
      </ul>
      <div class="order-card__footer">
        <span>📦 ${cantidadProductos} producto(s)</span>
        <span class="order-card__total">${fmt(pedido.total)}</span>
      </div>
    `;
    card.addEventListener("click", () => abrirDetalle(pedido, productos));
    ordersList.appendChild(card);
  });
}

const FORMA_PAGO_ICON: Record<string, string> = {
  TARJETA: "💳",
  TRANSFERENCIA: "🏦",
  EFECTIVO: "💵",
};

const FORMA_PAGO_LABEL: Record<string, string> = {
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo",
};

const ESTADO_MENSAJE: Record<EstadoPedido, { clase: string; titulo: string; texto: string }> = {
  PENDIENTE: {
    clase: "order-status--pendiente",
    titulo: "⏳ Tu pedido está siendo procesado",
    texto: "Te notificaremos cuando esté listo para entrega.",
  },
  CONFIRMADO: {
    clase: "order-status--confirmado",
    titulo: "✅ Tu pedido fue confirmado",
    texto: "Estamos preparando tu pedido.",
  },
  TERMINADO: {
    clase: "order-status--terminado",
    titulo: "🎉 Tu pedido fue entregado",
    texto: "¡Gracias por tu compra!",
  },
  CANCELADO: {
    clase: "order-status--cancelado",
    titulo: "❌ Tu pedido fue cancelado",
    texto: "Si tenés dudas, contactanos.",
  },
};

function abrirDetalle(pedido: Pedido, productos: Product[]): void {
  const filas = pedido.detalles
    .map((d) => {
      const producto = productos.find((p) => p.id === d.idProducto);
      return `
        <div class="order-product-line">
          <div>
            <strong>${producto?.nombre ?? "Producto"}</strong>
            <p>Cantidad: ${d.cantidad} × ${fmt(producto?.precio ?? d.subtotal / d.cantidad)}</p>
          </div>
          <span class="order-product-line__subtotal">${fmt(d.subtotal)}</span>
        </div>`;
    })
    .join("");

  const subtotal = pedido.detalles.reduce((acc, d) => acc + d.subtotal, 0);
  const envio = pedido.total - subtotal;
  const estadoInfo = ESTADO_MENSAJE[pedido.estado];

  modalContent.innerHTML = `
    <h2>Pedido #${pedido.id}</h2>
    <div style="text-align:center; margin-bottom:1rem;">
      <span class="badge ${BADGE_CLASS[pedido.estado]}">${pedido.estado}</span>
      <p class="order-card__date">📅 ${pedido.fecha}</p>
    </div>

    <div class="delivery-info-card">
      <h3>📍 Información de Entrega</h3>
      <p><strong>Dirección:</strong> ${pedido.direccion ?? "No especificada"}</p>
      <p><strong>Teléfono:</strong> ${pedido.telefono ?? "No especificado"}</p>
      <p><strong>Método de pago:</strong> ${FORMA_PAGO_ICON[pedido.formaPago]} ${FORMA_PAGO_LABEL[pedido.formaPago]}</p>
    </div>

    <h3>🛍️ Productos</h3>
    ${filas}

    <div class="order-totals">
      <div class="summary-row"><span>Subtotal:</span><span>${fmt(subtotal)}</span></div>
      <div class="summary-row"><span>Envío:</span><span>${fmt(envio)}</span></div>
      <div class="summary-row total"><span>Total:</span><span>${fmt(pedido.total)}</span></div>
    </div>

    <div class="order-status-message ${estadoInfo.clase}">
      <p><strong>${estadoInfo.titulo}</strong></p>
      <p>${estadoInfo.texto}</p>
    </div>
  `;
  modalOverlay.classList.add("modal--show");
}

modalClose.addEventListener("click", () => modalOverlay.classList.remove("modal--show"));

init();
