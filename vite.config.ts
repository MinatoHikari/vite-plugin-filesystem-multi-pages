import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
import fmpa from './package/main';
// import path from 'path';

export default defineConfig({
    build: {
        target: 'es2021',
        sourcemap: true,
    },
    plugins: [
        Inspect(),
        fmpa({
            // publicTemplateSrc: path.resolve(__dirname, 'index.html'),
            // scanFileName: 'main.ts',
            // replace: {
            //     title: 'vite app',
            //     src: (path) => path,
            // },
        }),
    ],
});
