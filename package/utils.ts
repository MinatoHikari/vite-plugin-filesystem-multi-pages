export const addSlash = (url: string) => {
    if (!url.endsWith('/')) return `${url}/`;
    return url;
};
export const addPrefSlash = (url: string) => {
    if (!url.startsWith('/')) return `/${url}`;
    return url;
};
