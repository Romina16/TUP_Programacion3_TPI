/*import { PRODUCTS, getCategories } from "../../../data/data";
import type { Product, CartItem } from "../../../types/product";

const CATEGORY_EMOJI: Record<string, string> = {
  Pizzas: "🍕",
  Hamburguesas: "🍔",
  Bebidas: "🥤",
  Postres: "🍰",
  Empanadas: "🥟",
  Ensaladas: "🥗",
};

let activeCategory: number | null = null;
let searchQuery = "";

const productList = document.getElementById("productList") as HTMLDivElement;
const noResults = document.getElementById("noResults") as HTMLParagraphElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const categoryList = document.getElementById("categoryList") as HTMLUListElement;
const cartCountEl = document.getElementById("cartCount") as HTMLSpanElement;
const toast = document.getElementById("toast") as HTMLDivElement;

function getCart(): CartItem[] {
  const raw = localStorage.getItem("cart");
  return raw ? (JSON.parse(raw) as CartItem[]) : [];
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem("cart", JSON.stringify(items));
}

function addToCart(product: Product): void {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({ id: product.id, nombre: product.nombre, precio: product.precio, cantidad: 1, categoria: product.categorias[0]?.nombre ?? "" });
  }
  saveCart(cart);
  updateCartCount();
  showToast();
}

function updateCartCount(): void {
  const cart = getCart();
  const total = cart.reduce((acc, item) => acc + item.cantidad, 0);
  cartCountEl.textContent = String(total);
}

function showToast(): void {
  toast.classList.add("toast--show");
  setTimeout(() => toast.classList.remove("toast--show"), 2000);
}

function getFilteredProducts(): Product[] {
  return PRODUCTS.filter((p) => {
    const matchesCategory =
      activeCategory === null || p.categorias.some((c) => c.id === activeCategory);
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}
//CARGAR PRODUCTOS
function renderProducts(list: Product[]): void {
  productList.innerHTML = "";

  if (list.length === 0) {
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";

  list.forEach((p) => {//Recorro los productos
    const emoji = CATEGORY_EMOJI[p.categorias[0]?.nombre ?? ""] ?? "🍽️";

    const card = document.createElement("div");
    card.className = "product-card";

    const image = document.createElement("div");
    image.className = "product-card__image" + (p.disponible ? "" : " product-card__image--no-stock");
    image.textContent = emoji;

    const body = document.createElement("div");
    body.className = "product-card__body";

    const title = document.createElement("h3");
    title.className = "product-card__title";
    title.textContent = p.nombre;

    const description = document.createElement("p");
    description.className = "product-card__description";
    description.textContent = p.descripcion;

    const price = document.createElement("span");
    price.className = "product-card__price";
    price.textContent = `$${p.precio.toLocaleString("es-AR")}`;

    const btn = document.createElement("button");
    btn.className = `product-card__btn ${!p.disponible ? "product-card__btn--disabled" : ""}`;
    btn.textContent = "Agregar al carrito";
    btn.disabled = !p.disponible;
    btn.addEventListener("click", () => addToCart(p));

    if (!p.disponible) {
      const unavailable = document.createElement("span");
      unavailable.className = "product-card__unavailable";
      unavailable.textContent = "Sin stock";
      body.appendChild(unavailable);
    }
  
    body.append(title, description, price, btn);
    card.append(image, body);
    productList.appendChild(card);
  });
}

function renderCategories(): void {
  const categories = getCategories();
  const allItem = document.createElement("li");
  allItem.textContent = "Ver todos";
  allItem.className = "sidebar__item";
  allItem.classList.toggle("sidebar__item--active", activeCategory === null);
  allItem.addEventListener("click", () => {
    activeCategory = null;
    refreshCategoryList();
    renderProducts(getFilteredProducts());
  });
  categoryList.appendChild(allItem);

  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.textContent = cat.nombre;
    li.className = "sidebar__item";
    li.dataset.id = String(cat.id);
    li.classList.toggle("sidebar__item--active", activeCategory === cat.id);
    li.addEventListener("click", () => {
      activeCategory = cat.id;
      refreshCategoryList();
      renderProducts(getFilteredProducts());
    });
    categoryList.appendChild(li);
  });
}

function refreshCategoryList(): void {
  categoryList.querySelectorAll<HTMLLIElement>(".sidebar__item").forEach((li) => {
    const id = li.dataset.id ? Number(li.dataset.id) : null;
    li.classList.toggle("sidebar__item--active", id === activeCategory);
  });
}

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  renderProducts(getFilteredProducts());
});

renderCategories();
renderProducts(PRODUCTS);
updateCartCount();*/