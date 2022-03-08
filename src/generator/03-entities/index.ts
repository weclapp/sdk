import {generateInterface, InterfaceProperty} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {convertToTypeScriptType} from '@utils/openapi/convertToTypeScriptType';
import {isRelatedEntitySchema} from '@utils/openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedEntity {
    source: string;
}

export const generateEntities = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEntity> => {
    const entities: Map<string, GeneratedEntity> = new Map();

    for (const [schemaName, schema] of schemas) {
        const entity = pascalCase(schemaName);
        const entityInterface: InterfaceProperty[] = [];
        const referenceInterface: InterfaceProperty[] = [];
        const requiredProps = schema.required ?? [];

        for (const [name, property] of Object.entries(schema.properties ?? {})) {
            if (isRelatedEntitySchema(property)) {
                const relatedEntity = property['x-relatedEntityName'];

                referenceInterface.push({
                    name: name.replace(/Id$/, ''),
                    type: `${pascalCase(relatedEntity)}[]`
                });
            }

            const type = convertToTypeScriptType(property, name).toString();
            const required = requiredProps.includes(name);
            entityInterface.push({name, type, required});
        }

        const source = generateStatements(
            generateInterface(entity, entityInterface),
            generateInterface(`${entity}_References`, referenceInterface)
        );

        entities.set(entity, {source});
    }

    return entities;
};
