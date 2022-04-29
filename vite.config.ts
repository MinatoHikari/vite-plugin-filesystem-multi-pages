import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
import fmpa from './package/main';
import path from 'path';

export default defineConfig({
    build: {
        target: 'es2021',
        rollupOptions: {
            input: {
                index: path.resolve(path.join(__dirname, 'src', 'pages'), 'index.html'),
                login: path.resolve(path.join(__dirname, 'src'), 'login.html'),
            },
        },
    },
    plugins: [
        Inspect(),
        fmpa({
            publicTemplateSrc: path.resolve(path.join(__dirname, 'src', 'pages'), 'index.html'),
            scanFileName: 'main.ts',
            replace: {
                title: 'vite app',
                src: (path) => path,
            },
        }),
    ],
});
