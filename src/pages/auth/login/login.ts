import { login } from "../../../utils/auth";
import { saveUser } from "../../../utils/localStorage";
import { initAuthPage, navigate } from "../../../utils/navigate";

// Si ya hay una sesion activa, redirige sin mostrar el formulario.
initAuthPage();

const form = document.getElementById("login-form") as HTMLFormElement;
const errorMsg = document.getElementById("error-msg") as HTMLParagraphElement;

form.addEventListener("submit", async (e: Event) => {
  e.preventDefault();
  errorMsg.hidden = true;

  const mail = (document.getElementById("mail") as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value;

  if (!mail || !password) {
    errorMsg.textContent = "Completá email y contraseña.";
    errorMsg.hidden = false;
    return;
  }

  try {
    const user = await login(mail, password);

    if (!user) {
      errorMsg.textContent = "Email o contraseña incorrectos.";
      errorMsg.hidden = false;
      return;
    }

    saveUser(user);
    navigate(
      user.rol === "ADMIN"
        ? "/src/pages/admin/adminHome/adminHome.html"
        : "/src/pages/store/home/home.html"
    );
  } catch (err) {
    errorMsg.textContent = "Ocurrió un error al iniciar sesión. Intente nuevamente.";
    errorMsg.hidden = false;
  }
});
