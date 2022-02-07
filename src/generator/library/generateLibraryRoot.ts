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

    const serverUrl = new URL(server);
    const nodeEnv = isNodeTarget(target);

    return `
${resolveImports(target)}
import {Filterable, EntityQuery, ListQuery, FirstQuery, SomeReturn, UniqueReturn} from './types.base';
import {unwrap, params, flattenSelectable, flattenSortable, flattenFilterable} from './utils';
import {Options, Method, RawRequest, WeclappResponse} from './types.api';
export * from './types.models';
export * from './types.api';

// Current version.
export const version = '${pkg.version}';

/**
 * Creates a new weclapp instance using the given credentials.
 * @param domain Domain of your weclapp instance.
 * @param apiKey Your API-Key.
 * @param secure If https should be used (default is true).
 */
export const weclapp = ({
    apiKey,
    domain${!nodeEnv ? ' = location.origin' : ''},
    secure = true
}: Options = {}) => {
    ${nodeEnv ? `
    if (!apiKey || !domain) {
        throw new Error('You need to provide an apiKey and a domain!');
    }
    ` : ''}

    const base = \`http\${secure ? 's' : ''}://\${domain.replace(/^https?:\\/\\//, '')}${serverUrl.pathname}\`;

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
            ...(!apiKey && {credentials: 'same-origin'}),
            method,
            headers: {
                'Content-Type': \`application/\${contentType}\`,
                'Accept': 'application/json',
                ...(apiKey && {'AuthenticationToken': apiKey}),
                ...headers
            }
        }).then(async res => {
            const data = res.headers?.get('content-type')?.includes('application/json') ? await res.json() : res;

            // Check if response was successful
            if (!res.ok) {
                throw data;
            }

            return data;
        });
    };

    // Internal .count implementation
    const _count = <Entity, RelatedEntities>(endpoint: string, filter?: Filterable<Entity, RelatedEntities>): Promise<number> => {
        return makeRequest<WeclappResponse<number>>(endpoint, {query: filter}).then(unwrap);
    };

    // Internal .unique implementation
    const _unique = <Entity, RelatedEntities, Query extends EntityQuery<Entity, RelatedEntities>>(
        endpoint: string,
        id: string,
        options?: Query
    ): Promise<UniqueReturn<Entity, RelatedEntities, Query>> => {

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
                data: res.result?.[0] ?? undefined,
                references: res?.referencedEntities ?? undefined
            } : (res.result?.[0] ?? undefined);
        });
    };

    // Internal .some implementation
    const _some = <Entity, RelatedEntities, Query extends ListQuery<Entity, Record<string, unknown>, RelatedEntities>>(
        endpoint: string,
        options?: Query
    ): Promise<SomeReturn<Entity, RelatedEntities, Query>> => makeRequest(endpoint, {
        query: {
            ...(options?.filter && Object.fromEntries(flattenFilterable(options?.filter))), // We don't want the user to be able to re-write given properties below
            ...options?.params,
            'page': options?.page ?? 1,
            'pageSize': options?.pageSize ?? 10,
            'serializeNulls': options?.serialize,
            'properties': options?.select ? flattenSelectable(options.select).join(',') : undefined,
            'sort': options?.sort ? flattenSortable(options.sort).join(',') : undefined,
            'includeReferencedEntities': options?.include?.join(',')
        }
    }).then(res => {
        return options?.include ? {
            data: res.result,
            references: res?.referencedEntities ?? undefined
        } : (res.result ?? undefined);
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
            method: Method.PUT,
            body: data,
            query: {ignoreMissingProperties: true}
        });
    };

    // Internal .first implementation
    const _first = <Entity, RelatedEntities, Query extends FirstQuery<Entity, Record<string, unknown>, RelatedEntities>>(
        endpoint: string,
        options?: Query
    ): Promise<UniqueReturn<Entity, RelatedEntities, Query>> => makeRequest(endpoint, {
        query: {
            ...(options?.filter && Object.fromEntries(flattenFilterable(options.filter))), // We don't want the user to be able to re-write given properties below
            ...options?.params,
            'page': 1,
            'pageSize': 1,
            'serializeNulls': options?.serialize,
            'properties': options?.select ? flattenSelectable(options.select).join(',') : undefined,
            'sort': options?.sort ? flattenSortable(options.sort).join(',') : undefined,
            'includeReferencedEntities': options?.include?.join(',')
        }
    }).then(res => {
        return options?.include ? {
            data: res.result[0],
            references: res?.referencedEntities ?? undefined
        } : (res.result[0] ?? undefined);
    });
    
    const _specialEndpointGet = <Entity>(endpoint: string, options?: Record<string, unknown>): Promise<Entity> => {
        return makeRequest(endpoint, { query: options});
    };
    
    const _specialEndpointPost = <Entity>(endpoint: string, data: any, options?: Record<string, unknown>): Promise<Entity> => {
        return makeRequest(endpoint, {
            method: Method.POST,
            body: data,
            query: options
        });
    };

    return {
        raw: makeRequest,

${indent(endpoints, 2)}
    };
};

export type WeclappSDK = ReturnType<typeof weclapp>;
    `.trim();
};
