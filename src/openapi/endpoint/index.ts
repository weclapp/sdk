import {logger} from '@logger';
import {generateLibraryRoot} from '@openapi/endpoint/generateLibraryRoot';
import {SwaggerPath} from '@openapi/utils/parseSwaggerPath';
import {indent} from '@utils/indent';
import {OpenAPIV3} from 'openapi-types';
import {generateEndpointFunctions} from './generateEndpointFunctions';
import {groupEndpoints} from './groupEndpoints';

export interface EndpointPath {
    path: SwaggerPath;
    methods: OpenAPIV3.PathItemObject;
}

export type EndpointMap = Map<string, EndpointPath[]>;

/**
 * Generates functions for the given endpoints record.
 * @param doc
 */
export const endpoints = (doc: OpenAPIV3.Document): string => {
    const groups: string[] = [];

    for (const [entity, endpoints] of groupEndpoints(doc.paths).entries()) {
        const head = `${entity}: {\n`;
        const functions: string[] = [];

        for (const endpoint of endpoints) {
            const funcs = generateEndpointFunctions(endpoint);

            if (funcs.length) {
                functions.push(...funcs);
            } else {
                logger.errorLn(`Couldn't generate a function for ${endpoint.path.path}`);
            }
        }

        const content = indent(functions.join(',\n\n'));
        groups.push(`${head}\n${content}\n}`);
    }

    return generateLibraryRoot(groups.join(',\n\n'), doc);
};
