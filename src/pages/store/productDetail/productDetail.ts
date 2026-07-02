import { addToCart } from "../../../utils/cart";
import { getProductos } from "../../../utils/catalogo";
import { getCart, getUser } from "../../../utils/localStorage";
import { initPage } from "../../../utils/navigate";

// Sin rol requerido: ADMIN también puede navegar la tienda desde "Ver Tienda".
if (!initPage()) {
  throw new Error("redirecting");
}

const esAdmin = getUser()?.rol === "ADMIN";

const container = document.getElementById("productDetail") as HTMLElement;
const cartCount = document.getElementById("cartCount") as HTMLSpanElement;
const toast = document.getElementById("toast") as HTMLDivElement;
const navCartItem = document.getElementById("navCartItem") as HTMLLIElement;

if (esAdmin) {
  // El admin solo consulta el catálogo desde "Ver Tienda"; no compra (F4.2).
  navCartItem.style.display = "none";
}

function updateCartBadge(): void {
  const cart = getCart();
  cartCount.textContent = String(cart.reduce((acc, i) => acc + i.cantidad, 0));
}

function showToast(mensaje: string): void {
  toast.textContent = mensaje;
  toast.classList.add("toast--show");
  setTimeout(() => toast.classList.remove("toast--show"), 2000);
}

async function init(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  const productos = await getProductos();
  const producto = productos.find((p) => p.id === id && !p.eliminado);

  if (!producto) {
    container.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  const puedeComprar = producto.disponible && producto.stock > 0 && !esAdmin;

  container.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" />
    <div class="product-detail__info">
      <h2>${producto.nombre}</h2>
      <span class="product-detail__price">$${producto.precio.toLocaleString("es-AR")}</span>
      <span class="stock-badge ${producto.disponible && producto.stock > 0 ? "stock-badge--disponible" : "stock-badge--no-disponible"}">
        ${producto.disponible && producto.stock > 0 ? `Disponible (Stock: ${producto.stock})` : "No disponible"}
      </span>
      <p style="margin-top:0.5rem;">${producto.descripcion}</p>
      ${esAdmin ? "" : `
      <p style="margin-top:0.5rem;"><strong>Cantidad:</strong></p>
      <div class="quantity-selector" style="max-width:150px;">
        <button type="button" id="btnMenos">-</button>
        <span id="cantidad">1</span>
        <button type="button" id="btnMas">+</button>
      </div>
      <button class="product-card__btn ${puedeComprar ? "" : "product-card__btn--disabled"}" id="btnAgregar" style="width:260px; margin-top:0.5rem;">
        Agregar al carrito
      </button>
      `}
      <button class="btn-empty" id="btnVolver" style="width:260px; margin-top:0.5rem;">← Volver</button>
    </div>
  `;

  document.getElementById("btnVolver")?.addEventListener("click", () => {
    window.location.href = "../home/home.html";
  });

  updateCartBadge();

  if (!puedeComprar) return;

  let cantidad = 1;
  const cantidadSpan = document.getElementById("cantidad") as HTMLSpanElement;
  const btnMenos = document.getElementById("btnMenos") as HTMLButtonElement;
  const btnMas = document.getElementById("btnMas") as HTMLButtonElement;
  const btnAgregar = document.getElementById("btnAgregar") as HTMLButtonElement;

  btnMenos.addEventListener("click", () => {
    cantidad = Math.max(1, cantidad - 1);
    cantidadSpan.textContent = String(cantidad);
  });

  btnMas.addEventListener("click", () => {
    cantidad = Math.min(producto.stock, cantidad + 1);
    cantidadSpan.textContent = String(cantidad);
  });

  btnAgregar.addEventListener("click", () => {
    addToCart(producto, cantidad);
    updateCartBadge();
    showToast("¡Producto agregado al carrito!");
  });
}

init();
