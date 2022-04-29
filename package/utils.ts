import fs, { PathLike } from 'fs';
import { Options, ReplaceParams } from './types';
import * as path from 'path';

export const routesMap = new Map<string | PathLike, string>();

export const addSlash = (url: string) => {
    if (!url.endsWith('/')) return `${url}/`;
    return url;
};

export const addPrefSlash = (url: string) => {
    if (!url.startsWith('/')) return `/${url}`;
    return url;
};

export const deletePrefSlash = (url: string) => {
    if (url.startsWith('/')) return url.slice(1);
    return url;
};

export const deleteSlash = (url: string) => {
    if (url.endsWith('/')) return url.slice(0, url.length - 1);
    return url;
};

export const getScanName = (options: Options) => {
    if (options.publicTemplateSrc) return options.scanFileName ?? 'main.ts';
    return options.templateName ?? 'index.html';
};

export const templateCompile = (str: string, params: ReplaceParams, filePath: string) => {
    const itr = str.matchAll(new RegExp('(?:{{\\s*)([a-zA-Z]+)(?:\\s*}})', 'g'));
    let next = itr.next();
    while (!next.done) {
        const [raw, key] = next.value;
        let newStr: string;
        if (typeof params[key] === 'string') newStr = params[key] as string;
        else newStr = (params[key] as CallableFunction)(filePath);
        str = str.replace(raw, newStr);
        next = itr.next();
    }
    return str;
};

export const rmDir = async (source: string, parentFolder?: string): Promise<boolean> => {
    let childClear = false;
    const files = fs.readdirSync(source);
    for (let item of files) {
        const itemPath = path.join(source, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
            childClear = await rmDir(itemPath, source);
        } else {
            fs.rmSync(itemPath);
        }
    }
    const newFiles = fs.readdirSync(source);
    if (childClear) {
        for (let item of newFiles) fs.rmdirSync(path.join(source, item));
    }
    return true;
};
