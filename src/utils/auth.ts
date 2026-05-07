import type { IUser, IRegisterResult } from '../types/IUser';

const USERS_KEY = 'users';
const SESSION_KEY = 'userData';

function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getUsers(): IUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as IUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: IUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* Retorna el usuario con sesión activa, o null si no hay sesión. */
export function getCurrentUser(): IUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IUser;
  } catch {
    return null;
  }
}

/**
 * Verifica las credenciales contra el array de usuarios en localStorage.
 * Si son correctas, guarda el usuario en la clave "userData" e inicia sesión.
 * @returns El usuario encontrado, o null si las credenciales son incorrectas.
 */
export function login(email: string, password: string): IUser | null {
  const user =
    getUsers().find(u => u.email === email && u.password === password) ?? null;

  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  return user;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Registra un nuevo usuario con rol 'client' en el array "users".
 * Retorna error si el email ya está en uso.
 */
export function register(
  email: string,
  password: string,
  nombre: string,
): IRegisterResult {
  const users = getUsers();

  if (users.some(u => u.email === email)) {
    return { success: false, error: 'Ya existe una cuenta con ese email.' };
  }

  const newUser: IUser = {
    id: generateId(),
    email,
    password,
    nombre,
    rol: 'client',
  };

  users.push(newUser);
  saveUsers(users);
  return { success: true };
}

export function seedAdminUser(): void {
  const users = getUsers();
  if (users.some(u => u.rol === 'admin')) return;

  const admin: IUser = {
    id: 'admin_default',
    email: 'admin@foodstore.com',
    password: 'admin123',
    nombre: 'Administrador',
    rol: 'admin',
  };

  users.unshift(admin);
  saveUsers(users);
}