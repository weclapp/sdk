import {indent} from '@utils/indent';
import {logger} from '@logger';
import {SwaggerPath} from '@utils/parseSwaggerPath';
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
 * @param paths
 */
export const endpoints = (paths: OpenAPIV3.PathsObject): string => {
    let file = '';

    for (const [entity, endpoints] of groupEndpoints(paths).entries()) {
        const head = `export const ${entity} = {`;
        const functions: string[] = [];

        for (const endpoint of endpoints) {
            const funcs = generateEndpointFunctions(endpoint);

            if (funcs) {
                functions.push(...funcs);
            } else {
                logger.warnLn(`Couldn't generate a function for ${endpoint.path.path}`);
            }
        }

        const content = indent(functions.join(',\n\n'));
        const ctx = `\n${head}\n${content}\n}\n`;
        file += ctx;
    }

    return file.trim() + '\n';
};
