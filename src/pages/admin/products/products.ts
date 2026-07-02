import type { ICategory } from "../../../types/categoria";
import type { Product } from "../../../types/product";
import { logout } from "../../../utils/auth";
import { fetchJson } from "../../../utils/fetchJson";
import { initPage } from "../../../utils/navigate";

if (!initPage("ADMIN")) {
  throw new Error("redirecting");
}

const tbody = document.getElementById("tbody") as HTMLTableSectionElement;
const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
const btnNuevo = document.getElementById("btnNuevo") as HTMLButtonElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;
const modalTitle = document.getElementById("modalTitle") as HTMLHeadingElement;
const form = document.getElementById("form") as HTMLFormElement;
const formError = document.getElementById("formError") as HTMLParagraphElement;
const prodIdInput = document.getElementById("prodId") as HTMLInputElement;
const categoriaSelect = document.getElementById("categoriaId") as HTMLSelectElement;

btnLogout.addEventListener("click", logout);

// CRUD en memoria: los cambios se pierden al recargar (F7), consistente con el
// resto del panel de administracion.
let productos: Product[] = [];
let categorias: ICategory[] = [];

function nombreCategoria(categoriaId: number): string {
  return categorias.find((c) => c.id === categoriaId)?.nombre ?? "Sin categoría";
}

function render(): void {
  tbody.innerHTML = "";
  productos
    .filter((p) => !p.eliminado)
    .forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td><img src="${p.imagen}" alt="${p.nombre}" /></td>
        <td>${p.nombre}</td>
        <td>${p.descripcion}</td>
        <td>$${p.precio.toLocaleString("es-AR")}</td>
        <td>${nombreCategoria(p.categoriaId)}</td>
        <td>${p.stock}</td>
        <td>${p.disponible ? "Disponible" : "No disponible"}</td>
        <td class="action-links">
          <button class="btn-edit" data-id="${p.id}" data-action="editar">Editar</button>
          <button class="btn-delete" data-id="${p.id}" data-action="eliminar">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

function renderSelectCategorias(): void {
  categoriaSelect.innerHTML = categorias
    .filter((c) => !c.eliminado)
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
}

function abrirModal(producto?: Product): void {
  form.reset();
  formError.hidden = true;
  modalTitle.textContent = producto ? "Editar Producto" : "Nuevo Producto";
  prodIdInput.value = producto ? String(producto.id) : "";
  (document.getElementById("nombre") as HTMLInputElement).value = producto?.nombre ?? "";
  (document.getElementById("descripcion") as HTMLTextAreaElement).value = producto?.descripcion ?? "";
  (document.getElementById("precio") as HTMLInputElement).value = producto ? String(producto.precio) : "";
  (document.getElementById("stock") as HTMLInputElement).value = producto ? String(producto.stock) : "";
  (document.getElementById("imagen") as HTMLInputElement).value = producto?.imagen ?? "";
  (document.getElementById("disponible") as HTMLSelectElement).value = String(producto?.disponible ?? true);
  categoriaSelect.value = producto ? String(producto.categoriaId) : (categorias[0]?.id.toString() ?? "");
  modalOverlay.classList.add("modal--show");
}

btnNuevo.addEventListener("click", () => abrirModal());
modalClose.addEventListener("click", () => modalOverlay.classList.remove("modal--show"));

tbody.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const id = Number(target.dataset.id);
  if (!id) return;

  if (target.dataset.action === "editar") {
    const producto = productos.find((p) => p.id === id);
    if (producto) abrirModal(producto);
  }

  if (target.dataset.action === "eliminar") {
    if (confirm("¿Confirma dar de baja este producto?")) {
      productos = productos.map((p) => (p.id === id ? { ...p, eliminado: true } : p));
      render();
    }
  }
});

form.addEventListener("submit", (e: Event) => {
  e.preventDefault();
  formError.hidden = true;

  const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim();
  const precio = Number((document.getElementById("precio") as HTMLInputElement).value);
  const stock = Number((document.getElementById("stock") as HTMLInputElement).value);
  const imagen = (document.getElementById("imagen") as HTMLInputElement).value.trim();
  const disponible = (document.getElementById("disponible") as HTMLSelectElement).value === "true";
  const categoriaId = Number(categoriaSelect.value);

  if (!nombre || precio <= 0 || stock < 0 || !categoriaId) {
    formError.textContent = "Verificá los datos: precio > 0, stock >= 0 y categoría válida.";
    formError.hidden = false;
    return;
  }

  const id = prodIdInput.value ? Number(prodIdInput.value) : null;

  if (id) {
    productos = productos.map((p) =>
      p.id === id ? { ...p, nombre, descripcion, precio, stock, imagen, disponible, categoriaId } : p
    );
  } else {
    const nuevoId = Math.max(0, ...productos.map((p) => p.id)) + 1;
    productos.push({
      id: nuevoId,
      nombre,
      descripcion,
      precio,
      stock,
      imagen,
      disponible,
      eliminado: false,
      categoriaId,
    });
  }

  modalOverlay.classList.remove("modal--show");
  render();
});

async function init(): Promise<void> {
  [productos, categorias] = await Promise.all([
    fetchJson<Product[]>("productos.json"),
    fetchJson<ICategory[]>("categorias.json"),
  ]);
  renderSelectCategorias();
  render();
}

init();
