import ErrnoException = NodeJS.ErrnoException;
import fs, { PathLike, WatchEventType } from 'fs';
import path from 'path';
import {
    addPrefSlash,
    addSlash,
    deletePrefSlash,
    deleteSlash,
    getScanName,
    rmDir,
    routesMap,
    templateCompile,
} from './utils';
import { ResolvedConfig, ViteDevServer, normalizePath } from 'vite';
import { ReplaceParams } from './types';

export const scan = (
    mergedOptions: {
        templateName: string;
        dir: PathLike;
        publicTemplateSrc?: string;
        scanFileName?: string;
    },
    sourceUrl: PathLike,
) => {
    const scanName = getScanName(mergedOptions);
    fs.readdir(sourceUrl, (err: ErrnoException | null, files: string[]) => {
        // 解析文件类型，如果是目录则继续向目录内遍历
        // console.log(files)
        const source = sourceUrl.toString();
        for (const key of files) {
            if (key === scanName) {
                const mapKey =
                    sourceUrl
                        .toString()
                        .replace(mergedOptions.dir.toString(), '')
                        .replaceAll('\\', '/') || '/';
                routesMap.set(mapKey, path.join(source, scanName));
                // console.log('mapkey:', mapKey)
                // console.log('mapsource:', routesMap.get(mapKey))
            }
            fs.stat(
                path.resolve(sourceUrl as string, key),
                (_err: ErrnoException | null, stat: fs.Stats) => {
                    if (stat.isDirectory()) {
                        scan(mergedOptions, path.join(source, `${key}`));
                    }
                },
            );
        }
    });
};

export function watchDir(mergedOptions: { templateName: string; dir: PathLike }) {
    const scanName = getScanName(mergedOptions);
    return fs.watch(
        mergedOptions.dir,
        { recursive: true },
        (e: WatchEventType, filename: string) => {
            if (e === 'rename') {
                const filePath = path.join(mergedOptions.dir.toString(), filename);
                const mapKey = addPrefSlash(
                    filename.replaceAll('\\', '/').replace(`/${scanName}`, ''),
                );
                if (fs.existsSync(filePath) && filename.endsWith(scanName)) {
                    routesMap.set(mapKey, filePath);
                } else {
                    routesMap.has(mapKey) && routesMap.delete(mapKey);
                }
            }
        },
    );
}

export function redirect(
    server: ViteDevServer,
    mergedOptions: {
        templateName: string;
        dir: PathLike;
        publicTemplateSrc?: string;
        scanFileName?: string;
        replace?: ReplaceParams;
    },
) {
    server.middlewares.use((req, res, next) => {
        if (req.url) {
            const urlWithSlash = addSlash(req.url as string);
            const urlWithoutSlash = deleteSlash(urlWithSlash);
            const dir = mergedOptions.dir.toString();
            if (
                routesMap.has(req.url) ||
                routesMap.has(urlWithSlash) ||
                routesMap.has(urlWithoutSlash)
            ) {
                if (!mergedOptions.publicTemplateSrc) {
                    req.url = addPrefSlash([dir, req.url, mergedOptions.templateName].join('/'));
                } else {
                    const filePath = addPrefSlash(path.join(dir, req.url));
                    const content = fs.readFileSync(mergedOptions.publicTemplateSrc).toString();
                    res.setHeader('200', 'ok');
                    res.write(templateCompile(content, mergedOptions.replace || {}, filePath));
                    res.end();
                    return;
                }
            }
        }
        next();
    });
}

export function initBuildOptions(
    itr: IterableIterator<[PathLike, string]>,
    config: ResolvedConfig,
    mergedOptions: {
        templateName: string;
        replace?: ReplaceParams;
        dir: PathLike;
        publicTemplateSrc?: string;
        scanFileName?: string;
    },
) {
    let next = itr.next();
    while (!next.done) {
        const [key] = next.value;
        const keyPath = key.toString();
        const pageName = key === '' || key === '/' ? 'index' : deletePrefSlash(keyPath);
        if (!config.build.rollupOptions) config.build.rollupOptions = {};
        if (!config.build.rollupOptions.input) config.build.rollupOptions.input = {};
        const inputOption = config.build.rollupOptions.input;
        (inputOption as { [entryAlias: string]: string })[pageName] = path.join(
            config.root,
            mergedOptions.dir as string,
            keyPath,
            mergedOptions.templateName ?? 'index.html',
        );
        next = itr.next();
    }
}

export function transformTemplate(
    publicTemplateSrc: string,
    id: string,
    mergedOptions: {
        templateName: string;
        replace?: ReplaceParams;
        dir: string | PathLike;
        publicPath: string;
        publicTemplateSrc?: string;
        scanFileName?: string;
    },
) {
    const content = fs.readFileSync(publicTemplateSrc).toString();
    const filePath = deleteSlash(
        id.replace(publicTemplateSrc, '').replace(mergedOptions.templateName ?? '/index.html', ''),
    );
    console.log('id:', filePath);
    return `${templateCompile(content, mergedOptions.replace || {}, filePath)}`;
}

export function movePageFiles(
    config: ResolvedConfig,
    mergedOptions: {
        templateName: string;
        replace?: ReplaceParams;
        dir: string | PathLike;
        publicPath: string;
        publicTemplateSrc?: string;
        scanFileName?: string;
    },
) {
    fs.cp(
        path.join(`${config.root}`, `${config.build.outDir}`, `${mergedOptions.dir}`),
        path.join(`${config.root}`, `${mergedOptions.publicPath}`),
        {
            recursive: true,
        },
        (err) => {
            console.log(err);
            if (!err) {
                const removedDir = path.join(
                    `${config.root}`,
                    `${config.build.outDir}`,
                    `${deletePrefSlash(normalizePath(mergedOptions.dir.toString())).split('/')[0]}`,
                );
                rmDir(removedDir).then((end) => {
                    if (end) fs.rmdirSync(removedDir);
                });
            }
        },
    );
}
