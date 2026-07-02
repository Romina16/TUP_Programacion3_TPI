import type { CartItem } from "../../../types/product";
import type { FormaPago, Pedido } from "../../../types/pedido";
import { ENVIO, calcularSubtotal, calcularTotal, clearCart, removeFromCart, updateCantidad } from "../../../utils/cart";
import { fetchJson } from "../../../utils/fetchJson";
import { getCart, getPedidosLocales, getUser, savePedidoLocal } from "../../../utils/localStorage";
import { initPage, navigate } from "../../../utils/navigate";

if (!initPage("USUARIO")) {
  throw new Error("redirecting");
}

const itemsList = document.getElementById("itemsList") as HTMLDivElement;
const summarySubtotal = document.getElementById("summarySubtotal") as HTMLSpanElement;
const summaryEnvio = document.getElementById("summaryEnvio") as HTMLSpanElement;
const summaryTotal = document.getElementById("summaryTotal") as HTMLSpanElement;
const btnFinalizar = document.getElementById("btnFinalizar") as HTMLButtonElement;
const btnVaciar = document.getElementById("btnVaciar") as HTMLButtonElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;
const checkoutForm = document.getElementById("checkoutForm") as HTMLFormElement;
const checkoutError = document.getElementById("checkoutError") as HTMLParagraphElement;

function fmt(valor: number): string {
  return `$${valor.toLocaleString("es-AR")}`;
}

function updateSummary(items: CartItem[]): void {
  summarySubtotal.textContent = fmt(calcularSubtotal(items));
  summaryEnvio.textContent = items.length > 0 ? fmt(ENVIO) : fmt(0);
  summaryTotal.textContent = fmt(calcularTotal(items));
  btnFinalizar.disabled = items.length === 0;
}

function renderCart(): void {
  itemsList.innerHTML = "";
  const items = getCart();

  if (items.length === 0) {
    itemsList.innerHTML = `
      <div class="empty-state">
        <p>Tu carrito está vacío.</p>
        <a class="btn-checkout" href="../home/home.html">Ir a la tienda</a>
      </div>`;
    updateSummary([]);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const img = document.createElement("img");
    img.className = "product-img";
    img.src = item.imagen;
    img.alt = item.nombre;

    const info = document.createElement("div");
    info.className = "product-details";
    info.style.flex = "1";

    const name = document.createElement("h3");
    name.textContent = item.nombre;

    const subtotal = document.createElement("p");
    subtotal.className = "subtotal-text";
    subtotal.innerHTML = `Subtotal: <strong>${fmt(item.precio * item.cantidad)}</strong>`;

    info.append(name, subtotal);

    const controls = document.createElement("div");
    controls.className = "product-controls";

    const qtySelector = document.createElement("div");
    qtySelector.className = "quantity-selector";

    const btnDecrement = document.createElement("button");
    btnDecrement.textContent = "-";
    btnDecrement.disabled = item.cantidad <= 1;
    btnDecrement.addEventListener("click", () => {
      updateCantidad(item.id, item.cantidad - 1);
      renderCart();
    });

    const qty = document.createElement("span");
    qty.textContent = String(item.cantidad);

    const btnIncrement = document.createElement("button");
    btnIncrement.textContent = "+";
    btnIncrement.disabled = item.cantidad >= item.stock;
    btnIncrement.addEventListener("click", () => {
      updateCantidad(item.id, item.cantidad + 1);
      renderCart();
    });

    qtySelector.append(btnDecrement, qty, btnIncrement);

    const btnRemove = document.createElement("button");
    btnRemove.className = "btn-delete";
    btnRemove.textContent = "Eliminar";
    btnRemove.addEventListener("click", () => {
      removeFromCart(item.id);
      renderCart();
    });

    controls.append(qtySelector, btnRemove);
    card.append(img, info, controls);
    itemsList.appendChild(card);
  });

  updateSummary(items);
}

btnFinalizar.addEventListener("click", () => {
  modalOverlay.classList.add("modal--show");
});

modalClose.addEventListener("click", () => {
  modalOverlay.classList.remove("modal--show");
});

btnVaciar.addEventListener("click", () => {
  clearCart();
  renderCart();
});

checkoutForm.addEventListener("submit", async (e: Event) => {
  e.preventDefault();
  checkoutError.hidden = true;

  const telefono = (document.getElementById("telefono") as HTMLInputElement).value.trim();
  const formaPago = (document.getElementById("formaPago") as HTMLSelectElement).value as FormaPago;
  const items = getCart();

  if (!telefono) {
    checkoutError.textContent = "Ingresá un teléfono de contacto.";
    checkoutError.hidden = false;
    return;
  }
  if (items.length === 0) {
    checkoutError.textContent = "El carrito está vacío.";
    checkoutError.hidden = false;
    return;
  }

  const user = getUser();
  if (!user) {
    navigate("/src/pages/auth/login/index.html");
    return;
  }

  const pedidosJson = await fetchJson<Pedido[]>("pedidos.json");
  const todosLosPedidos = [...pedidosJson, ...getPedidosLocales()];
  const nuevoId = Math.max(0, ...todosLosPedidos.map((p) => p.id)) + 1;
  const subtotal = calcularSubtotal(items);

  const pedido: Pedido = {
    id: nuevoId,
    fecha: new Date().toISOString().slice(0, 10),
    estado: "PENDIENTE",
    total: subtotal + ENVIO,
    formaPago,
    idUsuario: user.id,
    detalles: items.map((item) => ({
      idProducto: item.id,
      cantidad: item.cantidad,
      subtotal: item.precio * item.cantidad,
    })),
  };

  savePedidoLocal(pedido);
  clearCart();
  navigate("/src/pages/client/orders/orders.html?confirmado=1");
});

renderCart();
