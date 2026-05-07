//Aquí irá la lógica de renderizado

import { getCurrentUser, logout } from '../../utils/auth';
import { initPage } from '../../utils/navigate';
import { productos, categorias } from '../../data/index';
import type { IProducto } from '../../types/IUser';

// Guard: admin y client pueden ver el catálogo; sin sesión → login
initPage({
  allowedRoles: ['admin', 'client'],
  loginUrl:     '/src/pages/auth/login/index.html',
  adminUrl:     '/src/pages/admin/index.html',
  clientUrl:    '/src/pages/client/index.html',
});

// --- Bienvenida ---
const user      = getCurrentUser();
const welcomeEl = document.getElementById('welcome-msg');

if (welcomeEl && user) {
  welcomeEl.textContent = `Hola, ${user.nombre}!`;
}

// --- Cierre de sesión ---
document.getElementById('logout-btn')?.addEventListener('click', (): void => {
  logout();
  window.location.replace('/src/pages/auth/login/index.html');
});

// --- Formateo de precios ---
function formatearPrecio(precio: number): string {
  return precio.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
}

// --- Renderizado de categorías en el sidebar ---
const listaCategorias = document.getElementById('lista-categorias');

categorias.forEach((cat): void => {
  const item = document.createElement('li');
  item.classList.add('sidebar__item');
  item.innerHTML = `<a class="sidebar__link" href="#" data-categoria="${cat.nombre}">${cat.nombre}</a>`;
  listaCategorias?.appendChild(item);
});

// --- Renderizado de tarjetas de productos ---
const contenedor = document.getElementById('contenedor-productos');
let categoriaActiva: string | null = null;

function renderProductos(lista: IProducto[]): void {
  if (!contenedor) return;
  contenedor.innerHTML = '';

  if (lista.length === 0) {
    contenedor.innerHTML = '<p style="padding:1rem;color:#888;">No hay productos en esta categoría.</p>';
    return;
  }

   lista.forEach((p: IProducto): void => {
    const article = document.createElement('article');
    article.classList.add('tarjeta-producto');
    article.innerHTML = `
        <img src= "${p.imagen}" alt ="${p.alt}">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p class ="precio">${formatearPrecio(p.precio)}</p>
        <div class="tarjeta-producto__actions">
        <button class="btn" type="button" data-id="${p.id}">Agregar</button>
        <button class="btn btn--secondary" type="button">Ver detalles</button>
      </div>
        `;

    article
      .querySelector<HTMLButtonElement>('.btn[data-id]')
      ?.addEventListener('click', (): void => {
        alert(`"${p.nombre}" agregado al carrito.`);
      });

    contenedor.appendChild(article);
  });
}

renderProductos(productos);

// --- Filtro por categoría (toggle: clic de nuevo deselecciona) ---
listaCategorias?.addEventListener('click', (e: Event): void => {
  const target = e.target as HTMLElement;
  if (!target.matches('.sidebar__link')) return;
  e.preventDefault();

  const cat = target.dataset['categoria'] ?? null;
  categoriaActiva = categoriaActiva === cat ? null : cat;

  listaCategorias
    .querySelectorAll('.sidebar__link')
    .forEach(el => el.classList.remove('sidebar__link--active'));

  if (categoriaActiva) target.classList.add('sidebar__link--active');

  const filtrados = categoriaActiva
    ? productos.filter(p => p.categoria === categoriaActiva)
    : productos;

  renderProductos(filtrados);
});
