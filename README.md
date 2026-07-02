# Food Store — Frontend Web

Frontend del TPI de Programación III: interfaz web del sistema Food Store, desarrollada con
TypeScript, Vite, HTML5 y CSS3. En esta iteración, todos los datos se obtienen mediante `fetch()`
a archivos `.json` locales ubicados en `public/data/`, de forma que los flujos de usuario puedan
construirse y verificarse de forma independiente al backend (Parte 2).

## Tecnologías

- TypeScript
- Vite (proyecto multipágina, vanilla TS — sin frameworks)
- HTML5 / CSS3

## Cómo ejecutar

```bash
npm install
npm run dev
```

Luego abrir la URL que indique Vite (por defecto `http://localhost:5173`).

Para compilar:

```bash
npm run build
```

## Credenciales de prueba

| Rol     | Email             | Contraseña  |
|---------|-------------------|-------------|
| ADMIN   | admin@admin.com   | 123456      |
| USUARIO | cliente@food.com  | cliente123  |

## Estructura

```
public/data/            # categorias.json, productos.json, usuarios.json, pedidos.json
src/
  types/                 # Tipos TypeScript (Product, ICategory, Usuario, Pedido, IUser, Rol)
  utils/
    fetchJson.ts         # Capa de acceso a datos (fetch a los JSON locales)
    auth.ts               # login, getCurrentUser, checkAuhtUser, logout
    navigate.ts            # navigate, initAuthPage, initPage (guards de sesión/rol)
    cart.ts                 # Manejo del carrito y cálculo de subtotal/envío/total
    localStorage.ts          # Persistencia en localStorage (sesión, carrito, pedidos y usuarios locales)
  pages/
    auth/login/            # Login
    auth/registro/          # Registro de clientes
    store/home/              # Catálogo de productos
    store/productDetail/      # Detalle de producto
    store/cart/                 # Carrito de compras y checkout
    client/orders/                # Mis Pedidos (cliente)
    admin/adminHome/                # Dashboard de administración
    admin/categories/                 # CRUD de categorías
    admin/products/                    # CRUD de productos
    admin/orders/                        # Gestión de pedidos (cambio de estado)
```

## Notas de implementación

- **Autenticación**: se compara el email y la contraseña ingresados contra `usuarios.json`
  (comparación en texto plano, solo con fines educativos — no hay tokens ni seguridad real). La
  sesión se guarda en `localStorage` bajo la clave `userData` (sin la contraseña).
- **Registro**: los nuevos usuarios no se persisten en el JSON; se guardan en `localStorage`
  (`usuariosRegistrados`) para que el login funcione tras el auto-login, ya que al ser una app
  multipágina cada navegación implica una recarga completa.
- **Carrito**: se persiste en `localStorage` (`cart`). El costo de envío es una constante fija
  `ENVIO = 500` definida en `src/utils/cart.ts`. El total del pedido = subtotal + envío.
- **Pedidos generados desde el checkout**: por el mismo motivo que el registro (no se puede
  escribir en el JSON de solo lectura), se guardan en `localStorage` (`pedidosLocal`) y se
  combinan con `pedidos.json` al listar en "Mis Pedidos" y en la gestión de pedidos del admin.
- **CRUD del panel de administración** (categorías, productos, cambio de estado de pedidos sobre
  datos del JSON): se aplica únicamente en memoria de la página — al recargar el navegador se
  pierde el estado modificado, tal como especifica la consigna para esta iteración.
- **Reemplazo futuro por API REST**: toda la obtención de datos pasa por `fetchJson()`
  (`src/utils/fetchJson.ts`), que apunta a `public/data/*.json`. Para conectar el backend real
  alcanza con cambiar la `BASE_URL` de ese archivo (o los nombres de recurso) para que apunte a
  los endpoints de la API (ej. `/api/products` en lugar de `/data/productos.json`).
