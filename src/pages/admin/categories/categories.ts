import type { ICategory } from "../../../types/categoria";
import { logout } from "../../../utils/auth";
import { getCategorias } from "../../../utils/catalogo";
import { saveCategoriaOverride } from "../../../utils/localStorage";
import { initPage } from "../../../utils/navigate";

if (!initPage("ADMIN")) {
  throw new Error("redirecting");
}

const tbody = document.getElementById("tbody") as HTMLTableSectionElement;
const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
const btnNueva = document.getElementById("btnNueva") as HTMLButtonElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;
const modalTitle = document.getElementById("modalTitle") as HTMLHeadingElement;
const form = document.getElementById("form") as HTMLFormElement;
const formError = document.getElementById("formError") as HTMLParagraphElement;
const catIdInput = document.getElementById("catId") as HTMLInputElement;

btnLogout.addEventListener("click", logout);

// Las altas/ediciones/bajas se guardan como overlay en localStorage (ver
// utils/catalogo.ts) para que persistan durante la sesión en toda la app, ya que
// el JSON base es de solo lectura.
let categorias: ICategory[] = [];

function render(): void {
  tbody.innerHTML = "";
  categorias
    .filter((c) => !c.eliminado)
    .forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td><img src="${c.imagen}" alt="${c.nombre}" /></td>
        <td>${c.nombre}</td>
        <td>${c.descripcion}</td>
        <td class="action-links">
          <button class="btn-edit" data-id="${c.id}" data-action="editar">Editar</button>
          <button class="btn-delete" data-id="${c.id}" data-action="eliminar">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

function abrirModal(categoria?: ICategory): void {
  form.reset();
  formError.hidden = true;
  modalTitle.textContent = categoria ? "Editar Categoría" : "Nueva Categoría";
  catIdInput.value = categoria ? String(categoria.id) : "";
  (document.getElementById("nombre") as HTMLInputElement).value = categoria?.nombre ?? "";
  (document.getElementById("descripcion") as HTMLTextAreaElement).value = categoria?.descripcion ?? "";
  (document.getElementById("imagen") as HTMLInputElement).value = categoria?.imagen ?? "";
  modalOverlay.classList.add("modal--show");
}

btnNueva.addEventListener("click", () => abrirModal());
modalClose.addEventListener("click", () => modalOverlay.classList.remove("modal--show"));

tbody.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const id = Number(target.dataset.id);
  if (!id) return;

  if (target.dataset.action === "editar") {
    const categoria = categorias.find((c) => c.id === id);
    if (categoria) abrirModal(categoria);
  }

  if (target.dataset.action === "eliminar") {
    if (confirm("¿Confirma dar de baja esta categoría?")) {
      const categoria = categorias.find((c) => c.id === id);
      if (categoria) {
        const actualizada = { ...categoria, eliminado: true };
        saveCategoriaOverride(actualizada);
        categorias = categorias.map((c) => (c.id === id ? actualizada : c));
        render();
      }
    }
  }
});

form.addEventListener("submit", (e: Event) => {
  e.preventDefault();
  formError.hidden = true;

  const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim();
  const imagen = (document.getElementById("imagen") as HTMLInputElement).value.trim();

  if (!nombre || !descripcion || !imagen) {
    formError.textContent = "Todos los campos son obligatorios.";
    formError.hidden = false;
    return;
  }

  const id = catIdInput.value ? Number(catIdInput.value) : null;
  const categoria: ICategory = id
    ? { ...(categorias.find((c) => c.id === id) as ICategory), nombre, descripcion, imagen }
    : { id: Math.max(0, ...categorias.map((c) => c.id)) + 1, nombre, descripcion, imagen, eliminado: false };

  saveCategoriaOverride(categoria);
  categorias = id ? categorias.map((c) => (c.id === id ? categoria : c)) : [...categorias, categoria];

  modalOverlay.classList.remove("modal--show");
  render();
});

async function init(): Promise<void> {
  categorias = await getCategorias();
  render();
}

init();
