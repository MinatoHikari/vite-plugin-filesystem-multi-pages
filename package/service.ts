import ErrnoException = NodeJS.ErrnoException;
import { PathLike, WatchEventType } from 'fs';
import path from 'path';
import fs from 'fs';
import { addPrefSlash, addSlash, getScanName, routesMap, templateCompile } from './utils';
import { ViteDevServer } from 'vite';
import { ReplaceParams } from "./types";

export const scan = (
    mergedOptions: {
        templateName: string;
        dir: string | PathLike;
        publicTemplateSrc?: string;
        scanFileName?: string;
    },
    sourceUrl: PathLike,
) => {
    const scanName = getScanName(mergedOptions);
    fs.readdir(sourceUrl, (err: ErrnoException | null, files: string[]) => {
        // 解析文件类型，如果是目录则继续向目录内遍历
        // console.log(files)
        for (const key of files) {
            if (key === scanName) {
                const mapKey =
                    (sourceUrl as string)
                        .replace(mergedOptions.dir as string, '')
                        .replaceAll('\\', '/') || '/';
                routesMap.set(mapKey, path.join(sourceUrl as string, scanName));
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
    const scanName = getScanName(mergedOptions);
    return fs.watch(
        mergedOptions.dir,
        { recursive: true },
        (e: WatchEventType, filename: string) => {
            if (e === 'rename') {
                const filePath = path.join(mergedOptions.dir as string, filename);
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
        dir: string | PathLike;
        publicTemplateSrc?: string;
        scanFileName?: string;
        replace?: ReplaceParams;
    },
) {
    server.middlewares.use((req, res, next) => {
        if (req.url) {
            const urlWithSlash = addSlash(req.url as string);
            if (routesMap.has(req.url) || routesMap.has(urlWithSlash)) {
                if (!mergedOptions.publicTemplateSrc) {
                    req.url = addPrefSlash(
                        [mergedOptions.dir as string, req.url, mergedOptions.templateName].join(
                            '/',
                        ),
                    );
                } else {
                    const scanFile = getScanName(mergedOptions);
                    const filePath = path.join(
                        mergedOptions.dir as string,
                        req.url,
                        scanFile,
                    );
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
