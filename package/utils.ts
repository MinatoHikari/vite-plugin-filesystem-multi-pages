import { PathLike } from 'fs';
import { Options, ReplaceParams } from './types';

export const addSlash = (url: string) => {
    if (!url.endsWith('/')) return `${url}/`;
    return url;
};

export const addPrefSlash = (url: string) => {
    if (!url.startsWith('/')) return `/${url}`;
    return url;
};

export const getScanName = (options: Options) => {
    if (options.publicTemplateSrc) return options.scanFileName ?? 'main.ts';
    return options.templateName ?? 'index.html';
};

export const templateCompile = (str: string, params: ReplaceParams, filePath: string) => {
    console.log(new RegExp('{{s*[a-zA-Z]+s*}}', 'g'));
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

export const routesMap = new Map<string | PathLike, string>();
