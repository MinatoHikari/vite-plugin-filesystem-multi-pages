import { IndexHtmlTransformContext, ResolvedConfig, UserConfig, ViteDevServer } from 'vite';
import { initBuildOptions, redirect, scan, watchDir } from './service';
import { defaultOptions, Options } from './types';
import { FSWatcher } from 'fs';
import { routesMap } from './utils';

export default function VitePluginFileSystemMultiPages(options?: Options) {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };
    let watcher: FSWatcher;
    let config: ResolvedConfig;

    return {
        name: 'vite-plugin-filesystem-multi-pages',
        config(config: UserConfig) {
            scan(mergedOptions, mergedOptions.dir);
        },
        configResolved(resolvedConfig: ResolvedConfig) {
            config = resolvedConfig;
            const itr = routesMap.entries();
            initBuildOptions(itr, config, mergedOptions);
        },
        configureServer(server: ViteDevServer) {
            redirect(server, mergedOptions);
        },
        buildStart: () => {
            watcher = watchDir(mergedOptions);
        },
        transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
            return html;
        },
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
        buildEnd() {
            watcher.close();
        },
    };
}
