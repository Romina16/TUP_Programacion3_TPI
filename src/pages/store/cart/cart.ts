import type { CartItem } from "../../../types/product";

const itemsList = document.getElementById("itemsList") as HTMLDivElement;
const summarySubtotal = document.getElementById("summarySubtotal") as HTMLSpanElement;
const summaryTotal = document.getElementById("summaryTotal") as HTMLSpanElement;
const btnFinalizar = document.getElementById("btnFinalizar") as HTMLButtonElement;
const btnVaciar = document.getElementById("btnVaciar") as HTMLButtonElement;

// Le ponemos "| null" porque estos elementos pueden no estar en el HTML
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement | null;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement | null;

const CATEGORY_EMOJI: Record<string, string> = {
  Pizzas: "🍕",
  Hamburguesas: "🍔",
  Bebidas: "🥤",
  Postres: "🍰",
  Empanadas: "🥟",
  Ensaladas: "🥗",
};

function getCart(): CartItem[] {
  const raw = localStorage.getItem("cart");
  return raw ? (JSON.parse(raw) as CartItem[]) : [];
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem("cart", JSON.stringify(items));
}

function updateSummary(items: CartItem[]): void {
  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const formatted = `$${total.toLocaleString("es-AR")}`;
  
  if (summarySubtotal) summarySubtotal.textContent = formatted;
  if (summaryTotal) summaryTotal.textContent = formatted;
  
  // Habilitar o deshabilitar el botón según si hay items
  if (btnFinalizar) {
      btnFinalizar.disabled = items.length === 0;
  }
}
// CARGAR CARRITO
function renderCart(): void {
  if (!itemsList) return;
  itemsList.innerHTML = "";
  const items = getCart();

  if (items.length === 0) { // SI EL CARRITO ESTÁ VACÍO
    const empty = document.createElement("p");
    empty.style.textAlign = "center";
    empty.style.fontSize = "1.2rem";
    empty.style.color = "var(--color-texto)";
    empty.style.marginTop = "2rem";
    empty.textContent = "Tu carrito está vacío.";
    itemsList.appendChild(empty);
    updateSummary([]);
    return;
  }

  items.forEach((item) => {// RECORREMOS LOS ITEMS DEL CARRITO PARA MOSTRARLOS
    const card = document.createElement("article");
    card.className = "product-card";

    const icon = document.createElement("div");
    icon.className = "product-img";
    icon.style.display = "flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.fontSize = "3.5rem"; // Emoji grande
    icon.textContent = CATEGORY_EMOJI[item.categoria] ?? "🍽️";

    const info = document.createElement("div");
    info.className = "product-details";
    info.style.flex = "1";

    const name = document.createElement("h3");
    name.textContent = item.nombre;

    const category = document.createElement("p");
    category.className = "category";
    category.style.color = "#666";
    category.style.margin = "0 0 10px 0";
    category.textContent = item.categoria;

    const subtotal = document.createElement("p");
    subtotal.className = "subtotal-text";
    subtotal.style.margin = "0";
    subtotal.innerHTML = `Subtotal: <strong>$${(item.precio * item.cantidad).toLocaleString("es-AR")}</strong>`;

    info.append(name, category, subtotal);

    const controls = document.createElement("div");
    controls.className = "product-controls";

    const qtySelector = document.createElement("div");
    qtySelector.className = "quantity-selector";

    const btnDecrement = document.createElement("button");
    btnDecrement.textContent = "-";
    btnDecrement.disabled = item.cantidad <= 1;
    btnDecrement.addEventListener("click", () => {
      const cart = getCart();
      const found = cart.find((i) => i.id === item.id);
      if (found && found.cantidad > 1) {
        found.cantidad -= 1;
        saveCart(cart);
        renderCart();
      }
    });

    const qty = document.createElement("span");
    qty.textContent = String(item.cantidad);

    const btnIncrement = document.createElement("button");
    btnIncrement.textContent = "+";
    btnIncrement.addEventListener("click", () => {
      const cart = getCart();
      const found = cart.find((i) => i.id === item.id);
      if (found) {
        found.cantidad += 1;
        saveCart(cart);
        renderCart();
      }
    });

    qtySelector.append(btnDecrement, qty, btnIncrement);

    const btnRemove = document.createElement("button");
    btnRemove.className = "btn-delete";
    btnRemove.textContent = "Eliminar";
    btnRemove.addEventListener("click", () => {
      saveCart(getCart().filter((i) => i.id !== item.id));
      renderCart();
    });

    controls.append(qtySelector, btnRemove);
    card.append(icon, info, controls);
    itemsList.appendChild(card);
  });

  updateSummary(items);
}

// Eventos de botones con Optional Chaining (?.) para evitar errores si no existen
btnFinalizar?.addEventListener("click", () => {
  if (modalOverlay) {
    modalOverlay.classList.add("modal--show");
  } else {
    alert("¡Funcionalidad de checkout en construcción!");
  }
});

modalClose?.addEventListener("click", () => {
  modalOverlay?.classList.remove("modal--show");
});

btnVaciar?.addEventListener("click", () => {
  saveCart([]);
  renderCart();
});

// Inicializamos el carrito
renderCart();