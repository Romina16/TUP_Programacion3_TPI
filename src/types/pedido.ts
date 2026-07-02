export type EstadoPedido = "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";
export type FormaPago = "TARJETA" | "TRANSFERENCIA" | "EFECTIVO";

export interface DetallePedido {
  idProducto: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  formaPago: FormaPago;
  idUsuario: number;
  detalles: DetallePedido[];
  // Datos de contacto del checkout (F5.2). No forman parte del JSON de prueba
  // (que es de solo lectura); solo están presentes en los pedidos generados
  // en esta sesión y guardados en localStorage.
  telefono?: string;
  direccion?: string;
  notas?: string;
}
