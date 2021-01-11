import {OpenAPIV3} from 'openapi-types';
import {createModels} from './createModels';

export interface GeneratedDefinitions {
    source: string;
    exports: string[];
}

/**
 * Generates a ts-file which will contain interfaces for the given definitions
 * @param definitions
 */
export const definitions = (definitions: OpenAPIV3.SchemaObject): GeneratedDefinitions => {
    const exports: string[] = [];
    let source = '';

    // Loop through declarations and convert to ts interfaces
    for (const [name, definition] of Object.entries(definitions)) {
        const models = createModels(name, definition);

        if (models) {
            source += `${models.source}\n\n`;
            exports.push(...models.exports);
        }
    }

    return {source, exports};
};
