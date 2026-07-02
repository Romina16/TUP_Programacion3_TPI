import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                login: 'src/pages/auth/login/index.html',
                registro: 'src/pages/auth/registro/index.html',
                home: 'src/pages/store/home/home.html',
                productDetail: 'src/pages/store/productDetail/productDetail.html',
                cart: 'src/pages/store/cart/cart.html',
                clientOrders: 'src/pages/client/orders/orders.html',
                adminHome: 'src/pages/admin/adminHome/adminHome.html',
                adminCategories: 'src/pages/admin/categories/categories.html',
                adminProducts: 'src/pages/admin/products/products.html',
                adminOrders: 'src/pages/admin/orders/orders.html',
            }
        }
    }
});
