import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { getUSer, removeUser } from "./localStorage";
import { navigate } from "./navigate";

export const checkAuhtUser = (
  redireccion1: string,
  redireccion2: string,
  rol: Rol
) => {
  console.log("comienzo de checkeo");

  const user = getUSer();

  if (!user) {
    console.log("no existe en local");
    navigate(redireccion1);
    return false;
  }

  try {
    const parseUser: IUser = JSON.parse(user);
    if (rol && parseUser.role !== rol) {
      console.log("existe pero no tiene el rol necesario");
      navigate(redireccion2);
      return false;
    }
  } catch (err) {
    removeUser();
    navigate(redireccion1);
    return false;
  }

  return true;
};

export const logout = () => {
  removeUser();
  navigate("/src/pages/auth/login/login.html");
};
