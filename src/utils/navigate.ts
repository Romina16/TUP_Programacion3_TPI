import { getCurrentUser, seedAdminUser } from './auth';
import type { Rol } from '../types/Rol';

/** Configuración para páginas protegidas. */
export interface PageConfig {
  allowedRoles?: Rol[];  /** Roles que pueden acceder. */
  loginUrl: string; /** Ruta al login. */
  adminUrl: string;/** Ruta al panel admin. */
  clientUrl: string; /** Ruta al panel cliente. */
}

export function initPage(config: PageConfig): void {
  seedAdminUser();

  const user = getCurrentUser();

  if (!user) {
    window.location.replace(config.loginUrl);
    return;
  }

  if (config.allowedRoles && !config.allowedRoles.includes(user.rol)) {
    const target = user.rol === 'admin' ? config.adminUrl : config.clientUrl;
    window.location.replace(target);
  }
}

export function initAuthPage(redirects: {
  adminUrl: string;
  clientUrl: string;
}): void {
  seedAdminUser();

  const user = getCurrentUser();
  if (!user) return;

  const target = user.rol === 'admin' ? redirects.adminUrl : redirects.clientUrl;
  window.location.replace(target);
}