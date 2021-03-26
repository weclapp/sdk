import pkg from '@/package.json';
import {isNodeTarget, isRXTarget, Target} from '@enums/Target';
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
    if (isNodeTarget(target)) {
        imports.push(tsImport('node-fetch', ['Response'], 'fetch'));
        imports.push(tsImport('url', ['URLSearchParams']));
    }

    if (isRXTarget(target)) {
        imports.push(tsImport('rxjs', ['defer', 'Observable']));
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

    return `
${resolveImports(target)}
import {Filterable, EntityQuery, ListQuery, FirstQuery, SomeReturn, UniqueReturn} from './types.base';
import {unwrap, params, flattenSelectable, flattenFilterable} from './utils';
import {Options, Method, RawRequest, WeclappResponse} from './types.api';
export * from './types.models';
export * from './types.api';

// TODO: Remove after swagger.json is fixed
type Body2 = any;

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
    const json = (res: Response): Promise<Response> => {
        if (res.headers?.get('content-type')?.includes('application/json')) {
            return res.json();
        }

        return Promise.resolve(res);
    };

    /**
     * Makes a raw request to the given endpoint.
     * @param endpoint Endpoint url.
     * @param method Request method (GET is default)
     * @param query Optional query parameters.
     * @param body Optional body data.
     * @param headers Optional, additional headers. May override existing ones.
     */
    const makeRequest: RawRequest = async (endpoint, {
        method = Method.GET,
        query,
        body,
        headers
    } = {}): Promise<any> => {
        const url = \`\${base + endpoint}\`;
        const isBinaryData = body instanceof ${isNodeTarget(target) ? 'Buffer' : 'Blob'};
        const contentType = isBinaryData ? 'octet-stream' : 'json';
        
        return fetch(query ? params(url, query) : url, {
            ...(body && {body: isBinaryData ? body : JSON.stringify(body)}),
            method,
            headers: {
                'Content-Type': \`application/\${contentType}\`,
                'Accept': 'application/json',
                'AuthenticationToken': apiKey,
                ...headers
            }
        }).then(async res => {
            const data = await json(res);

            // Check if response was successful
            if (!res.ok) {
                throw data;
            }

            return data;
        });
    };

    // Internal .count implementation
    const _count = <Entity>(endpoint: string, filter?: Filterable<Entity>): Promise<number> => {
        return makeRequest<WeclappResponse<number>>(endpoint, {query: filter}).then(unwrap);
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
            query: {
                'id-eq': id,
                'page': 1,
                'pageSize': 1,
                'serializeNulls': options?.serialize,
                'properties': options?.select ? flattenSelectable(options.select).join(',') : undefined,
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
        options?: Query
    ): Promise<SomeReturn<Entity, Query>> => makeRequest(endpoint, {
        query: {
            ...(options?.filter && Object.fromEntries(flattenFilterable(options.filter))), // We don't want the user to be able to re-write given properties below
            'page': options?.page ?? 1,
            'pageSize': options?.pageSize ?? 10,
            'serializeNulls': options?.serialize,
            'properties': options?.select ? flattenSelectable(options.select).join(',') : undefined,
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
        return makeRequest<void>(endpoint, {method: Method.DELETE});
    };

    // Internal .create implementation
    const _create = <Entity>(endpoint: string, data: Entity): Promise<Entity> => {
        return makeRequest(endpoint, {
            method: Method.POST,
            body: data
        });
    };

    // Internal .replace implementation
    const _replace = <Entity>(endpoint: string, data: Entity): Promise<Entity> => {
        return makeRequest(endpoint, {
            method: Method.PUT,
            body: data
        });
    };

    // Internal .update implementation
    const _update = <Entity>(endpoint: string, data: Partial<Entity>): Promise<Entity> => {
        return makeRequest(endpoint, {
            query: {'serializeNulls': true}
        }).then(res => {
            return {...res, ...data};
        }).then(updated => makeRequest(endpoint, {
            method: Method.PUT,
            body: updated
        }));
    };

    // Internal .first implementation
    const _first = <Entity, Query extends FirstQuery<Entity>>(
        endpoint: string,
        options?: Query
    ): Promise<UniqueReturn<Entity, Query>> => makeRequest(endpoint, {
        query: {
            ...(options?.filter && Object.fromEntries(flattenFilterable(options.filter))), // We don't want the user to be able to re-write given properties below
            'page': 1,
            'pageSize': 10,
            'serializeNulls': options?.serialize,
            'properties': options?.select ? flattenSelectable(options.select).join(',') : undefined,
            'includeReferencedEntities': options?.include?.join(','),
        }
    }).then(res => {
        return options?.include ? {
            data: res.result[0],
            references: res?.referencedEntities ?? null
        } : (res.result[0] ?? null);
    });

    return {
        raw: makeRequest,

${indent(endpoints, 2)}
    };
};

export type WeclappSDK = ReturnType<typeof weclapp>;
    `.trim();
};
