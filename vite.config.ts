import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target:'node16',
        lib: {
            entry: 'package/main.ts',
            fileName: 'main',
            name: 'VitePluginFileSystemMultiPages',
        },
    },
    plugins: [],
});
