import { PathLike } from 'fs';
import { UserConfig, ViteDevServer } from 'vite';
import { redirect, scan, watchDir } from './service';

export interface Options {
    dir?: PathLike;
    templateName?: string;
}

export const defaultOptions = {
    dir: 'src/pages',
    templateName: 'index.html',
};

export const routesMap = new Map<string | PathLike, string>();

export default function VitePluginFileSystemMultiPages(options?: Options) {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

    return {
        name: 'vite-plugin-filesystem-multi-pages',
        buildStart: () => {
            scan(mergedOptions, mergedOptions.dir);

            watchDir(mergedOptions);
        },
        config(config: UserConfig) {
            // console.log(config.server)
            // if (!config.server || !config.server.proxy) config.server = { proxy: {} }
            // config.server &&
            //   config.server.proxy &&
            //   (config.server.proxy['/auth/login'] = {
            //     target: 'http://localhost:3000',
            //     rewrite: (opath) => path.join('/src/pages', opath, '/index.html')
            //   })
        },
        configureServer(server: ViteDevServer) {
            redirect(server, mergedOptions);
        },
    };
}
