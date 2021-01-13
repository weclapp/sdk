import {Target} from '@enums/Target';
import {generateLibraryRoot} from '@generator/library/generateLibraryRoot';
import {SwaggerPath} from '@generator/utils/parseSwaggerPath';
import {logger} from '@logger';
import {indent} from '@utils/indent';
import {OpenAPIV3} from 'openapi-types';
import {groupPaths} from '../utils/groupPaths';
import {generateFunctions} from './functions/generateFunctions';

export interface EndpointPath {
    path: SwaggerPath;
    methods: OpenAPIV3.PathItemObject;
}

export type EndpointMap = Map<string, EndpointPath[]>;

/**
 * Generates functions for the given endpoints record.
 * @param doc
 * @param target
 */
export const generateSdk = (doc: OpenAPIV3.Document, target: Target): string => {
    const groups: string[] = [];

    for (const [entity, endpoints] of groupPaths(doc.paths).entries()) {
        const head = `${entity}: {\n`;
        const functions: string[] = [];

        for (const endpoint of endpoints) {
            const funcs = generateFunctions(endpoint, endpoints);

            if (funcs.length) {
                functions.push(...funcs);
            } else {
                logger.errorLn(`Couldn't generate a function for ${endpoint.path.path}`);
            }
        }

        const content = indent(functions.join(',\n\n'));
        groups.push(`${head}\n${content}\n}`);
    }

    return generateLibraryRoot(groups.join(',\n\n'), doc, target);
};
