import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import type { Usuario } from "../types/usuario";
import { fetchJson } from "./fetchJson";
import { getUser, getUsuariosRegistrados, removeUser, saveUser } from "./localStorage";
import { navigate } from "./navigate";

const aIUser = (u: Usuario): IUser => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  mail: u.mail,
  celular: u.celular,
  rol: u.rol,
});

// Busca el usuario por mail y contraseña contra usuarios.json (mas los registrados
// en esta sesion), tal como describe F4.1. Devuelve el usuario sin password, o null
// si las credenciales no coinciden.
export const login = async (mail: string, password: string): Promise<IUser | null> => {
  const usuariosJson = await fetchJson<Usuario[]>("usuarios.json");
  const usuarios = [...usuariosJson, ...getUsuariosRegistrados()];

  const encontrado = usuarios.find(
    (u) => u.mail === mail && !u.eliminado && u.password === password
  );

  return encontrado ? aIUser(encontrado) : null;
};

export const getCurrentUser = (): IUser | null => getUser();

export const checkAuhtUser = (
  redireccion1: string,
  redireccion2: string,
  rol?: Rol
): boolean => {
  const user = getUser();

  if (!user) {
    navigate(redireccion1);
    return false;
  }

  if (rol && user.rol !== rol) {
    navigate(redireccion2);
    return false;
  }

  return true;
};

export const logout = (): void => {
  removeUser();
  navigate("/src/pages/auth/login/index.html");
};

export { saveUser };
