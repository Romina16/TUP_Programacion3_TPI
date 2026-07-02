import type { ICategory } from "../../../types/categoria";
import type { Product } from "../../../types/product";
import { logout } from "../../../utils/auth";
import { getCategorias, getProductos } from "../../../utils/catalogo";
import { getCart, getUser } from "../../../utils/localStorage";
import { initPage } from "../../../utils/navigate";

// Sin rol requerido: ADMIN también puede navegar la tienda desde "Ver Tienda".
if (!initPage()) {
  throw new Error("redirecting");
}

const categoryList = document.getElementById("categoryList") as HTMLUListElement;
const productList = document.getElementById("productList") as HTMLDivElement;
const noResults = document.getElementById("noResults") as HTMLParagraphElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement;
const cartCount = document.getElementById("cartCount") as HTMLSpanElement;
const welcomeMsg = document.getElementById("welcome-msg") as HTMLLIElement;
const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
const navOrdersItem = document.getElementById("navOrdersItem") as HTMLLIElement;
const navCartItem = document.getElementById("navCartItem") as HTMLLIElement;

let categorias: ICategory[] = [];
let productos: Product[] = [];
let categoriaSeleccionada: number | null = null;

function updateCartBadge(): void {
  const cart = getCart();
  cartCount.textContent = String(cart.reduce((acc, i) => acc + i.cantidad, 0));
}

function renderCategorias(): void {
  categoryList.innerHTML = "";

  const todas = document.createElement("li");
  todas.className = "sidebar__item" + (categoriaSeleccionada === null ? " sidebar__item--active" : "");
  todas.textContent = "Todas";
  todas.addEventListener("click", () => {
    categoriaSeleccionada = null;
    renderCategorias();
    renderProductos();
  });
  categoryList.appendChild(todas);

  categorias
    .filter((c) => !c.eliminado)
    .forEach((c) => {
      const li = document.createElement("li");
      li.className = "sidebar__item" + (categoriaSeleccionada === c.id ? " sidebar__item--active" : "");
      li.textContent = c.nombre;
      li.addEventListener("click", () => {
        categoriaSeleccionada = c.id;
        renderCategorias();
        renderProductos();
      });
      categoryList.appendChild(li);
    });
}

function renderProductos(): void {
  const busqueda = searchInput.value.trim().toLowerCase();
  const orden = sortSelect.value;

  let visibles = productos.filter((p) => p.disponible && !p.eliminado);

  if (categoriaSeleccionada !== null) {
    visibles = visibles.filter((p) => p.categoriaId === categoriaSeleccionada);
  }
  if (busqueda) {
    visibles = visibles.filter((p) => p.nombre.toLowerCase().includes(busqueda));
  }

  if (orden === "nombre-asc") visibles.sort((a, b) => a.nombre.localeCompare(b.nombre));
  if (orden === "nombre-desc") visibles.sort((a, b) => b.nombre.localeCompare(a.nombre));
  if (orden === "precio-asc") visibles.sort((a, b) => a.precio - b.precio);
  if (orden === "precio-desc") visibles.sort((a, b) => b.precio - a.precio);

  productList.innerHTML = "";
  noResults.style.display = visibles.length === 0 ? "block" : "none";

  visibles.forEach((p) => {
    const card = document.createElement("div");

    const img = document.createElement("img");
    img.src = p.imagen;
    img.alt = p.nombre;

    const title = document.createElement("h3");
    title.className = "product-card__title";
    title.textContent = p.nombre;

    const desc = document.createElement("p");
    desc.className = "product-card__description";
    desc.textContent = p.descripcion;

    const price = document.createElement("span");
    price.className = "product-card__price";
    price.textContent = `$${p.precio.toLocaleString("es-AR")}`;

    const btn = document.createElement("button");
    btn.className = "product-card__btn";
    btn.textContent = "Ver detalle";
    btn.addEventListener("click", () => {
      window.location.href = `../productDetail/productDetail.html?id=${p.id}`;
    });

    card.append(img, title, desc, price, btn);
    card.addEventListener("click", (ev) => {
      if (ev.target !== btn) {
        window.location.href = `../productDetail/productDetail.html?id=${p.id}`;
      }
    });
    productList.appendChild(card);
  });
}

async function init(): Promise<void> {
  const user = getUser();
  if (user) welcomeMsg.textContent = `Hola, ${user.nombre}`;

  if (user?.rol === "ADMIN") {
    // El admin navega la tienda solo para consultar el catálogo: no compra, por lo
    // que no tiene sentido mostrarle "Mis Pedidos" ni el carrito (tabla de roles F4.2).
    navCartItem.style.display = "none";
    navOrdersItem.innerHTML = `<a href="../../admin/adminHome/adminHome.html">Panel Admin</a>`;
  }

  [categorias, productos] = await Promise.all([getCategorias(), getProductos()]);

  renderCategorias();
  renderProductos();
  updateCartBadge();
}

searchInput.addEventListener("input", renderProductos);
sortSelect.addEventListener("change", renderProductos);
btnLogout.addEventListener("click", logout);

init();
