import {isReferenceObject, isRequestBodyObject} from '@generator/guards';
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
    const definitions: [string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject][] = [
        ...Object.entries(doc.components?.schemas ?? {}),
        ...Object.entries(doc.components?.requestBodies ?? {})
            .filter(([, v]) => isRequestBodyObject(v) && !isReferenceObject(v.content['application/json'].schema))
            .map(([name, definition]) => {
                return [name, (definition as OpenAPIV3.RequestBodyObject).content['application/json'].schema];
            }) as [string, OpenAPIV3.SchemaObject][]
    ];

    let source = '';

    // Loop through declarations and convert to ts interfaces
    for (const [name, definition] of definitions) {
        const models = createModels(name, definition as OpenAPIV3.SchemaObject, doc.paths);

        if (models) {
            source += `${models.source}\n\n`;
            exports.push(...models.exports);
        }
    }

    return {source, stats: {exports}};
};
