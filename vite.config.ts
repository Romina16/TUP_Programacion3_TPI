import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                login: 'src/pages/auth/login/index.html',
                registro: 'src/pages/auth/registro/index.html',
                admin: 'src/pages/admin/index.html',
                client: 'src/pages/client/index.html'
            }

        }
    }
});