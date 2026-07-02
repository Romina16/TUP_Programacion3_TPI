import type { ICategory } from "../../../types/categoria";
import { logout } from "../../../utils/auth";
import { fetchJson } from "../../../utils/fetchJson";
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

// Las operaciones de esta pantalla se aplican solo en memoria (estado local de la
// pagina): al recargar el navegador se pierde lo modificado, tal como indica F7.
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
      categorias = categorias.map((c) => (c.id === id ? { ...c, eliminado: true } : c));
      render();
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

  if (id) {
    categorias = categorias.map((c) => (c.id === id ? { ...c, nombre, descripcion, imagen } : c));
  } else {
    const nuevoId = Math.max(0, ...categorias.map((c) => c.id)) + 1;
    categorias.push({ id: nuevoId, nombre, descripcion, imagen, eliminado: false });
  }

  modalOverlay.classList.remove("modal--show");
  render();
});

async function init(): Promise<void> {
  categorias = await fetchJson<ICategory[]>("categorias.json");
  render();
}

init();
