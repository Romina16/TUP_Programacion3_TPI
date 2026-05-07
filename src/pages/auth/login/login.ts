
import { login } from '../../../utils/auth';
import { initAuthPage } from '../../../utils/navigate';

// si ya hay sesión activa, redirigir sin mostrar el formulario
initAuthPage({
  adminUrl:  '/src/pages/admin/index.html',
  clientUrl: '/src/pages/client/index.html',
});

const form     = document.getElementById('login-form') as HTMLFormElement | null;
const errorMsg = document.getElementById('error-msg')  as HTMLParagraphElement | null;

form?.addEventListener('submit', (e: Event): void => {
  e.preventDefault();

  const email    = (document.getElementById('email')    as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value;

  if (errorMsg) errorMsg.hidden = true;

  // Buscar coincidencia en localStorage
  const user = login(email, password);

  if (!user) {
    if (errorMsg) {
      errorMsg.textContent = 'Email o contraseña incorrectos.';
      errorMsg.hidden = false;
    }
    return;
  }

  // Redirigir según el rol
  const target = user.rol === 'admin'
    ? '/src/pages/admin/index.html'
    : '/src/pages/client/index.html';

  window.location.replace(target);
});