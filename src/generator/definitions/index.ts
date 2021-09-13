import {Result} from '@generator/types';
import {OpenAPIV3} from 'openapi-types';
import {createModels} from './createModels';

export interface DefinitionStats {
    exports: string[];
}

/**
 * Generates a ts-file which will contain interfaces for the given definitions
 * @param doc
 */
export const definitions = (doc: OpenAPIV3.Document): Result<DefinitionStats> => {
    const exports: string[] = [];
    const definitions: OpenAPIV3.SchemaObject = doc.components?.schemas ?? {};
    let source = '';

    // Loop through declarations and convert to ts interfaces
    for (const [name, definition] of Object.entries(definitions)) {
        const models = createModels(name, definition, doc.paths);

        if (models) {
            source += `${models.source}\n\n`;
            exports.push(...models.exports);
        }
    }

    return {source, stats: {exports}};
};
