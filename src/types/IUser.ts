import type { Rol } from './Rol.js';

export interface IUser {
    id: String;
    email: string;
    password: string;
    nombre: string;
    rol: Rol;
}

export interface IProducto {
    id: string;
    email: string;
    password: string;
    nombre: string;
    rol: Rol;
}

export interface IRegisterResult {
    success: boolean;
    error?: string;
}