import type { Usuario } from "../../../types/usuario";
import { fetchJson } from "../../../utils/fetchJson";
import { addUsuarioRegistrado, getUsuariosRegistrados, saveUser } from "../../../utils/localStorage";
import { initAuthPage, navigate } from "../../../utils/navigate";

initAuthPage();

const form = document.getElementById("registro-form") as HTMLFormElement;
const errorMsg = document.getElementById("error-msg") as HTMLParagraphElement;

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", async (e: Event) => {
  e.preventDefault();
  errorMsg.hidden = true;

  const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
  const apellido = (document.getElementById("apellido") as HTMLInputElement).value.trim();
  const mail = (document.getElementById("mail") as HTMLInputElement).value.trim();
  const celular = (document.getElementById("celular") as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value;

  if (!MAIL_REGEX.test(mail)) {
    errorMsg.textContent = "Ingresá un email válido.";
    errorMsg.hidden = false;
    return;
  }
  if (password.length < 6) {
    errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
    errorMsg.hidden = false;
    return;
  }

  const usuariosJson = await fetchJson<Usuario[]>("usuarios.json");
  const usuarios = [...usuariosJson, ...getUsuariosRegistrados()];
  const yaExiste = usuarios.some((u) => u.mail.toLowerCase() === mail.toLowerCase() && !u.eliminado);

  if (yaExiste) {
    errorMsg.textContent = "Ya existe una cuenta registrada con ese email.";
    errorMsg.hidden = false;
    return;
  }

  const nuevoId = Math.max(0, ...usuarios.map((u) => u.id)) + 1;
  const nuevoUsuario: Usuario = {
    id: nuevoId,
    nombre,
    apellido,
    mail,
    celular,
    password,
    rol: "USUARIO",
    eliminado: false,
  };

  addUsuarioRegistrado(nuevoUsuario);
  saveUser({
    id: nuevoUsuario.id,
    nombre: nuevoUsuario.nombre,
    apellido: nuevoUsuario.apellido,
    mail: nuevoUsuario.mail,
    celular: nuevoUsuario.celular,
    rol: nuevoUsuario.rol,
  });

  navigate("/src/pages/store/home/home.html");
});
