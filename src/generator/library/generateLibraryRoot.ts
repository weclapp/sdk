import pkg from '@/package.json';
import {Target} from '@enums/Target';
import {resolveServer} from '@generator/utils/resolveServer';
import {logger} from '@logger';
import {tsImport} from '@ts/modules';
import {indent} from '@utils/indent';
import {OpenAPIV3} from 'openapi-types';

/**
 * Generates all required imports for the given target.
 * @param target
 */
const resolveImports = (target: Target): string => {
    const imports: string[] = [];

    // Additional types, target-dependent
    if (target === Target.NODE_PROMISES) {
        imports.push(tsImport('node-fetch', ['Response'], 'fetch'));
        imports.push(tsImport('url', ['URLSearchParams']));
    }

    return imports.join('\n');
};

/**
 * Generates the whole sdk.
 * @param endpoints Endpoint implementations
 * @param doc OpenAPI document
 * @param target Library target
 */
export const generateLibraryRoot = (endpoints: string, doc: OpenAPIV3.Document, target: Target): string => {
    const server = resolveServer(doc);

    if (!server) {
        logger.errorLn('Couldn\'t resolve server!');
        process.exit(1);
    }

    return `${resolveImports(target)}
import {QueryFilter, EntityQuery, ListQuery, SomeReturn, UniqueReturn} from './types.base';
import {Options, Method, RawRequest} from './types.api';

// Current version.
export const version = '${pkg.version}';

/**
 * Creates a new weclapp instance using the given credentials.
 * @param domain Domain of your weclapp instance.
 * @param apiKey Your API-Key.
 * @param secure If https should be used (default is true).
 */
export const weclapp = ({
    domain,
    apiKey,
    secure = true
}: Options) => {

    // Strip protocol from domain
    domain = domain.replace(/^https?:\\/\\//, '');
    const base = \`http\${secure ? 's' : ''}://\${domain}${server}\`;

    /**
     * Takes a response and converts it to a js object if possible.
     * @param res
     */
    const handleContentType = (res: Response): Promise<Response> => {
        if (res.headers?.get('content-type')?.includes('application/json')) {
            return res.json();
        }

        return Promise.resolve(res);
    };

    /**
     * Builds a search query base on the given object
     * @param url Base url
     * @param params Search params
     * @returns {string}
     */
    const buildParams = (url: string, params: Record<string, unknown> = {}): string => {
        const search = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                search.append(key, String(value));
            }
        }

        const query = search.toString();
        return query ? \`\${url}?\${query}\` : url;
    };

    /**
     * Makes a raw request to the given endpoint.
     * @param endpoint Endpoint url.
     * @param method Request method (GET is default)
     * @param params Optional query parameters.
     * @param body Optional body data.
     */
    const makeRequest: RawRequest = async (endpoint, {
        method = Method.GET,
        params,
        body
    } = {}): Promise<any> => {
        const url = \`\${base}/\${endpoint}\`;

        return fetch(params ? buildParams(url, params) : url, {
            ...(body && {body: JSON.stringify(body)}),
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'AuthenticationToken': apiKey
            }
        }).then(async res => {
            const data = await handleContentType(res);

            // Check if response was successful
            if (!res.ok) {
                throw data;
            }

            return data;
        });
    };

    /**
     * Unwraps the result property from a weclapp response.
     * @param res
     */
    const unwrap = (res: {result: unknown}): any => res.result;

    // Internal .count implementation
    const _count = <Entity>(endpoint: string, filter?: QueryFilter<Entity>): Promise<number> => {
        return makeRequest('/user/count', {params: filter}).then(unwrap);
    };

    // Internal .unique implementation
    const _unique = <Entity, Query extends EntityQuery<Entity>>(
        endpoint: string,
        id: string,
        options?: Query
    ): Promise<UniqueReturn<Entity, Query>> => {

        // The /id/:id endpoint for an entity does not have features like
        // including referenced entities or extracting specific properties.
        // Therefore we just go with the normal endpoint and grab the first, unique result.
        return makeRequest(endpoint, {
            params: {
                'id-eq': id,
                'page': 1,
                'pageSize': 1,
                'serializeNulls': options?.serialize,
                'properties': options?.select?.join(','),
                'includeReferencedEntities': options?.include?.join(',')
            }
        }).then(res => {
            return options?.include ? {
                data: res.result?.[0] ?? null,
                references: res?.referencedEntities ?? null
            } : (res.result?.[0] ?? null);
        });
    };

    // Internal .some implementation
    const _some = <Entity, Query extends ListQuery<Entity>>(
        endpoint: string,
        options?: Query,
        filter?: Partial<Entity>
    ): Promise<SomeReturn<Entity, Query>> => makeRequest(endpoint, {
        params: {
            ...filter, // We don't want the user to be able to re-write given properties below
            'page': options?.page ?? 1,
            'pageSize': options?.pageSize ?? 10,
            'serializeNulls': options?.serialize,
            'properties': options?.select?.join(','),
            'includeReferencedEntities': options?.include?.join(','),
        }
    }).then(res => {
        return options?.include ? {
            data: res.result,
            references: res?.referencedEntities ?? null
        } : (res.result ?? null);
    });

    // Internal .delete implementation
    const _delete = <Entity>(endpoint: string): Promise<void> => {
        return makeRequest(endpoint, {method: Method.DELETE}).then(unwrap);
    };

    // Internal .create implementation
    const _create = <Entity>(endpoint: string, data: Entity): Promise<Entity> => {
        return makeRequest(endpoint, {
            method: Method.POST,
            body: data
        });
    };

    // Internal .update implementation
    const _update = <Entity>(endpoint: string, data: Partial<Entity>): Promise<Entity> => {
        return makeRequest(endpoint, {
            params: {'serializeNulls': true}
        }).then(res => {
            return {...res, ...data};
        }).then(updated => {
            return makeRequest(endpoint, {
                method: Method.PUT,
                body: updated
            });
        });
    };

    return {
        raw: makeRequest,

${indent(endpoints, 2)}
    };
};
    `;
};
