import type { Product } from "../../../types/product";
import { addToCart } from "../../../utils/cart";
import { fetchJson } from "../../../utils/fetchJson";
import { getCart } from "../../../utils/localStorage";
import { initPage } from "../../../utils/navigate";

if (!initPage("USUARIO")) {
  throw new Error("redirecting");
}

const container = document.getElementById("productDetail") as HTMLElement;
const cartCount = document.getElementById("cartCount") as HTMLSpanElement;
const toast = document.getElementById("toast") as HTMLDivElement;

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

  const productos = await fetchJson<Product[]>("productos.json");
  const producto = productos.find((p) => p.id === id && !p.eliminado);

  if (!producto) {
    container.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  const puedeComprar = producto.disponible && producto.stock > 0;

  container.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" />
    <div class="product-detail__info">
      <h2>${producto.nombre}</h2>
      <p>${producto.descripcion}</p>
      <span class="product-detail__price">$${producto.precio.toLocaleString("es-AR")}</span>
      <p>Stock disponible: ${producto.stock}</p>
      ${!puedeComprar ? '<p class="product-card__unavailable">No disponible</p>' : ""}
      <div class="quantity-selector" style="max-width:150px;">
        <button type="button" id="btnMenos">-</button>
        <span id="cantidad">1</span>
        <button type="button" id="btnMas">+</button>
      </div>
      <button class="product-card__btn ${puedeComprar ? "" : "product-card__btn--disabled"}" id="btnAgregar" style="margin-top:1rem;max-width:260px;">
        Agregar al carrito
      </button>
      <p><a href="../home/home.html">← Volver al catálogo</a></p>
    </div>
  `;

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
