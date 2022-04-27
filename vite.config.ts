import { defineConfig } from 'vite';

export default defineConfig({
    build:{
        lib: {
            entry: 'package/main.ts',
            formats: ['es', 'cjs'],
            fileName: 'main'
        },
    },
    plugins: [],
});
