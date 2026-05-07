//  Ruta protegida: solo accesible para usuarios con rol 'admin'.

import { getCurrentUser, logout } from '../../utils/auth';
import { initPage } from '../../utils/navigate';
import { productos, categorias } from '../../data/index';
import type { IProducto } from '../../types/IUser';

// Guard: solo admins; sin sesión → login; client → panel cliente
initPage({
  allowedRoles: ['admin'],
  loginUrl:     '/src/pages/auth/login/index.html',
  adminUrl:     '/src/pages/admin/index.html',
  clientUrl:    '/src/pages/client/index.html',
});

// --- Bienvenida ---
const user      = getCurrentUser();
const welcomeEl = document.getElementById('welcome-msg');

if (welcomeEl && user) {
  welcomeEl.textContent = `Hola, ${user.nombre}`; // Saludo personalizado
}

// --- Cierre de sesión ---
document.getElementById('logout-btn')?.addEventListener('click', (): void => {
  logout();
  window.location.replace('/src/pages/auth/login/index.html');
});
