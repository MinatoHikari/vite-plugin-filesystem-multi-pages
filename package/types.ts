import { PathLike } from 'fs';

export type ReplaceParams = Record<string, string | ((filePath: string) => string)>;

export interface Options {
    dir?: PathLike;
    templateName?: string;
    publicTemplateSrc?: string;
    scanFileName?: string;
    replace?: ReplaceParams;
    publicPath?: string;
}

export const defaultOptions = {
    dir: 'src/pages',
    templateName: 'index.html',
    publicPath: '/dist/',
};
