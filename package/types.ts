import { PathLike } from "fs";

export interface Options {
    dir?: PathLike;
    templateName?: string;
}

export const defaultOptions = {
    dir: 'src/pages',
    templateName: 'index.html',
};
