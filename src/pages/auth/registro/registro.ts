/*import { register } from '../../../utils/auth';
import { initAuthPage } from '../../../utils/navigate';

// Guard: si ya hay sesión activa, no tiene sentido registrarse
initAuthPage({
  adminUrl:  '/src/pages/admin/index.html',
  clientUrl: '/src/pages/client/index.html',
});

// Atrapamos el formulario
const form = document.getElementById('register-form') as HTMLFormElement | null;

form?.addEventListener('submit', (e: Event): void => {
  e.preventDefault(); // ¡Crucial! Evita que la página recargue

  // Capturamos los datos que escribió el usuario
  const nombre = (document.getElementById('fullname') as HTMLInputElement).value.trim();
  const email = (document.getElementById('email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value;
  
  // Opcional: Podés agregar acá un if para verificar que las contraseñas coincidan

  // Ejecutamos el registro
  const resultado = register(email, password, nombre);

  if (resultado.success) {
    alert('¡Registro exitoso! Ya podés iniciar sesión.');
    window.location.replace('../login/index.html'); // Te manda al login
  } else {
    alert(`Error: ${resultado.error}`); // Te avisa si el mail ya existe
  }
});*/

import { register } from '../../../utils/auth';
import { initAuthPage } from '../../../utils/navigate';

// Guard: si ya hay sesión activa, no tiene sentido registrarse
initAuthPage({
  adminUrl:  '/src/pages/admin/index.html',
  clientUrl: '/src/pages/client/index.html',
});

const form       = document.getElementById('register-form') as HTMLFormElement | null;
const errorMsg   = document.getElementById('error-msg')     as HTMLParagraphElement | null;
const successMsg = document.getElementById('success-msg')   as HTMLParagraphElement | null;

form?.addEventListener('submit', (e: Event): void => {
  e.preventDefault();

  const nombre   = (document.getElementById('fullname')   as HTMLInputElement).value.trim();
  const email    = (document.getElementById('email')    as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value;

  // Limpiar mensajes previos
  if (errorMsg)   errorMsg.hidden   = true;
  if (successMsg) successMsg.hidden = true;

  // Intentar registrar: verifica duplicados y guarda en localStorage
  const result = register(email, password, nombre);

  if (!result.success) {
    if (errorMsg) {
      errorMsg.textContent = result.error ?? 'Error al registrarse.';
      errorMsg.hidden = false;
    }
    return;
  }

  // Éxito: mostrar mensaje y redirigir al login
  if (successMsg) {
    successMsg.textContent = '¡Cuenta creada exitosamente! Redirigiendo al login...';
    successMsg.hidden = false;
  }

  setTimeout((): void => {
    window.location.replace('/src/pages/auth/login/index.html');
  }, 1500);
});
/**/