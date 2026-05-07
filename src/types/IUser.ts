import type { Rol } from './Rol';

export interface IUser {
    id: String;
    email: string;
    password: string;
    nombre: string;
    rol: Rol;
}

export interface IProducto {
    id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  alt: string;
  categoria: string;
}

export interface IRegisterResult {
    success: boolean;
    error?: string;
}