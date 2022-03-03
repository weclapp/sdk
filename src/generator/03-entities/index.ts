import {createInterface} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {generateTypeScriptType} from '@utils/openapi/generateTypeScriptType';
import {isRelatedEntitySchema} from '@utils/openapi/guards';
import {typeFallback} from '@utils/openapi/typeFallback';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedEntity {
    source: string;
}

export const generateEntities = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEntity> => {
    const entities: Map<string, GeneratedEntity> = new Map();

    for (const [schemaName, schema] of schemas) {
        const entity = pascalCase(schemaName);
        const referenceInterface = createInterface(`${entity}_References`);
        const entityInterface = createInterface(entity);
        const requiredProps = schema.required ?? [];

        for (const [name, property] of Object.entries(schema.properties ?? {})) {
            if (isRelatedEntitySchema(property)) {
                const relatedEntity = property['x-relatedEntityName'];

                referenceInterface.add({
                    name: name.replace(/Id$/, ''),
                    type: `${pascalCase(relatedEntity)}[]`
                });
            }

            const type = typeFallback(generateTypeScriptType(property, name));
            const required = requiredProps.includes(name);
            entityInterface.add({name, type, required});
        }

        const source = generateStatements(
            entityInterface.toString(),
            referenceInterface.toString()
        );

        entities.set(entity, {source});
    }

    return entities;
};
