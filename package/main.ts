import { UserConfig, ViteDevServer, IndexHtmlTransformContext } from 'vite';
import { redirect, scan, watchDir } from './service';
import { defaultOptions, Options } from './types';
import { FSWatcher } from 'fs';
// import path from 'path';

export default function VitePluginFileSystemMultiPages(options?: Options) {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };
    let watcher: FSWatcher;

    return {
        name: 'vite-plugin-filesystem-multi-pages',
        buildStart: () => {
            scan(mergedOptions, mergedOptions.dir);

            watcher = watchDir(mergedOptions);
        },
        config(config: UserConfig) {},
        resolveId(id: string) {
            console.log(id);
            return id;
        },
        load(id: string) {
            // if (id.endsWith('login.html'))
            //     return `${fs
            //         .readFileSync(
            //             path.join(mergedOptions.dir as string, mergedOptions.templateName),
            //         )
            //         .toString()}`;
            return;
        },
        transform(code: string, id: string) {
            return code;
        },
        configureServer(server: ViteDevServer) {
            redirect(server, mergedOptions);
        },
        buildEnd() {
            watcher.close();
        },
        transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
            return html;
        },
    };
}
