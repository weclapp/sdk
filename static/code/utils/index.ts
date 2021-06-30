import {WeclappResponse} from '../types.api';
export * from './customAttributes';
export * from './resolver';
export * from './flatter';

/**
 * Unwraps the result property from a weclapp response.
 * @param res The response
 */
export const unwrap = <T>(res: WeclappResponse<T>): T => res.result;

/**
 * Builds a search query base on the given object
 * @param url Base url
 * @param params Search params
 * @returns {string} The whole url string
 */
export const params = (url: string, params: Record<string, unknown> = {}): string => {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            search.append(key, Array.isArray(value) ? `[${value.join(',')}]` : String(value));
        }
    }

    const query = search.toString();
    return query ? `${url}?${query}` : url;
};
