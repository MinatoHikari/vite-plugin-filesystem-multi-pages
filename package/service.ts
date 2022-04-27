import ErrnoException = NodeJS.ErrnoException;
import fs, { PathLike, WatchEventType } from 'fs';
import path from 'path';
import { routesMap } from './main';
import { addPrefSlash, addSlash } from './utils';
import { ViteDevServer } from 'vite';
import { Options } from "./types";

export const scan = (mergedOptions: Required<Options>, sourceUrl: PathLike) => {
    fs.readdir(sourceUrl, (err: ErrnoException | null, files: string[]) => {
        // 解析文件类型，如果是目录则继续向目录内遍历
        // console.log(files)
        for (const key of files) {
            if (key === mergedOptions.templateName) {
                const mapKey =
                    (sourceUrl as string)
                        .replace(mergedOptions.dir as string, '')
                        .replaceAll('\\', '/') || '/';
                routesMap.set(mapKey, path.join(sourceUrl as string, mergedOptions.templateName));
                // console.log('mapkey:', mapKey)
                // console.log('mapsource:', routesMap.get(mapKey))
            }
            fs.stat(
                path.resolve(sourceUrl as string, key),
                (_err: ErrnoException | null, stat: fs.Stats) => {
                    if (stat.isDirectory()) {
                        scan(mergedOptions, path.join(sourceUrl as string, `${key}`));
                    }
                },
            );
        }
    });
};

export function watchDir(mergedOptions: { templateName: string; dir: string | PathLike }) {
    fs.watch(mergedOptions.dir, { recursive: true }, (e: WatchEventType, filename: string) => {
        if (e === 'rename') {
            const filePath = path.join(mergedOptions.dir as string, filename);
            const mapKey = addPrefSlash(
                filename.replaceAll('\\', '/').replace(`/${mergedOptions.templateName}`, ''),
            );
            if (fs.existsSync(filePath) && filename.endsWith(mergedOptions.templateName)) {
                console.log(mapKey);
                routesMap.set(mapKey, filePath);
            } else {
                routesMap.has(mapKey) && routesMap.delete(mapKey);
            }
        }
    });
}

export function redirect(
    server: ViteDevServer,
    mergedOptions: { templateName: string; dir: string | PathLike },
) {
    server.middlewares.use((req, res, next) => {
        if (req.url) {
            const urlWithSlash = addSlash(req.url as string);
            if (routesMap.has(req.url) || routesMap.has(urlWithSlash)) {
                req.url = addPrefSlash(
                    [mergedOptions.dir as string, req.url, mergedOptions.templateName].join('/'),
                );
            }
        }

        next();
    });
}
