import type { Rol } from "../types/Rol";
import { getUser } from "./localStorage";

export const navigate = (route: string): void => {
  window.location.href = route;
};

const HOME_STORE = "/src/pages/store/home/home.html";
const HOME_ADMIN = "/src/pages/admin/adminHome/adminHome.html";
const LOGIN = "/src/pages/auth/login/index.html";

const homeParaRol = (rol: Rol): string => (rol === "ADMIN" ? HOME_ADMIN : HOME_STORE);

// Usada en login/registro: si ya hay una sesion activa, redirige directo al home
// que corresponda segun el rol en vez de mostrar el formulario de nuevo.
export const initAuthPage = (): void => {
  const user = getUser();
  if (user) {
    navigate(homeParaRol(user.rol));
  }
};

// Usada en paginas protegidas: exige sesion activa y, opcionalmente, un rol
// especifico. Si no se cumple, redirige al login o al home que corresponda.
export const initPage = (rolRequerido?: Rol): boolean => {
  const user = getUser();

  if (!user) {
    navigate(LOGIN);
    return false;
  }

  if (rolRequerido && user.rol !== rolRequerido) {
    navigate(homeParaRol(user.rol));
    return false;
  }

  return true;
};
