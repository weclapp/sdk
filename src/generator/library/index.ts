import {Target} from '@enums/Target';
import {generateLibraryRoot} from '@generator/library/generateLibraryRoot';
import {Result} from '@generator/types';
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

export interface StatsEntityFunction {
    signature: string;
    description: string;
}

export interface StatsEntity {
    functions: StatsEntityFunction[];
}

export interface LibraryStats {
    entities: Record<string, StatsEntity>
}

/**
 * Generates functions for the given endpoints record.
 * @param doc
 * @param target
 */
export const generateSdk = (doc: OpenAPIV3.Document, target: Target): Result<LibraryStats> => {
    const groups: string[] = [];
    const stats: LibraryStats = {entities: {}};

    for (const [entity, endpoints] of groupPaths(doc.paths).entries()) {
        const head = `${entity}: {\n`;

        const functions: StatsEntityFunction[] = [];
        const functionSource: string[] = [];

        for (const endpoint of endpoints) {
            const result = generateFunctions(endpoint, endpoints);

            if (result) {
                functionSource.push(...result.sources);
                functions.push(...result.stats);
            } else {
                logger.errorLn(`Couldn't generate a function for ${endpoint.path.path}`);
            }
        }

        // Concatenate functions, build object and append
        const content = indent(functionSource.join(',\n\n'));
        groups.push(`${head}\n${content}\n}`);

        // Push stats
        stats.entities[entity] = {functions};
    }

    const source = generateLibraryRoot(groups.join(',\n\n'), doc, target);
    return {source, stats};
};
