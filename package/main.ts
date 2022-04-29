import { IndexHtmlTransformContext, ResolvedConfig, UserConfig, ViteDevServer } from 'vite';
import {
    initBuildOptions,
    movePageFiles,
    redirect,
    scan,
    transformTemplate,
    watchDir,
} from './service';
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
            return id;
        },
        load(id: string) {
            const publicTemplateSrc = mergedOptions.publicTemplateSrc;
            if (publicTemplateSrc && id.endsWith('.html')) {
                return transformTemplate(publicTemplateSrc, id, mergedOptions);
            }
            return;
        },
        transform(code: string, id: string) {
            return code;
        },
        buildEnd() {
            watcher.close();
        },
        closeBundle() {
            if (mergedOptions.publicPath) {
                movePageFiles(config, mergedOptions);
            }
        },
    };
}
