import {match, matchAll} from '@utils/regex';

export enum SwaggerPathType {
    Root,
    Count,
    Entity
}

export interface SwaggerPath {
    path: string;
    entity: string;
    params: string[];
    name: string | null;
    type: SwaggerPathType | null;
}

/**
 * Parses the openapi endpoint path
 * @param path
 */
export const parseSwaggerPath = (path: string): SwaggerPath | null => {
    const entity = match(path, /^\/(\w+)/, 1);
    const name = match(path, /.*\/(\w+)$/, 1);
    const params = matchAll(path, /{(.*?)}/g, 1);
    let type: SwaggerPathType | null = null;

    /* eslint-disable no-constant-condition */
    if (/^\/\w+$/.test(path)) {
        type = SwaggerPathType.Root;
    } else if (path.endsWith('/count')) {
        type = SwaggerPathType.Count;
    } else if (/\/(\w+)\/{\1}$/) {
        type = SwaggerPathType.Entity;
    }

    return entity && params ? {
        path, entity, params, type, name
    } : null;
};

/**
 * Injects the given params into the path
 * @param path
 * @param params
 */
export const injectParams = (path: string, params: Record<string, string>): string=>{
    return path.replace(/{(.*?)}/g, (_, args: string) => {
        return params[args];
    })
}
