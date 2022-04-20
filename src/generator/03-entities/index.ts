import {generateInterface, InterfaceProperty} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {generateString} from '@ts/generateString';
import {convertToTypeScriptType} from '@utils/openapi/convertToTypeScriptType';
import {isEnumSchemaObject, isObjectSchemaObject, isReferenceObject, isRelatedEntitySchema} from '@utils/openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedEntity {
    source: string;
}

export const generateEntities = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEntity> => {
    const entities: Map<string, GeneratedEntity> = new Map();

    for (const [schemaName, schema] of schemas) {

        if (isEnumSchemaObject(schema)) {
            continue;
        }

        const entity = pascalCase(schemaName);
        const entityInterface: InterfaceProperty[] = [];
        const referenceInterface: InterfaceProperty[] = [];
        const referenceMappingsInterface: InterfaceProperty[] = [];
        const requiredProps = schema.required ?? [];
        let extend = undefined;

        const processProperties = (props: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}) => {
            for (const [name, property] of Object.entries(props)) {
                if (isRelatedEntitySchema(property)) {
                    const relatedEntity = property['x-relatedEntityName'];
                    const type = `${pascalCase(relatedEntity)}[]`;
                    referenceInterface.push({name, type, required: true});
                    referenceMappingsInterface.push({name, type: generateString(relatedEntity), required: true});
                }

                const type = convertToTypeScriptType(property, name).toString();
                const required = requiredProps.includes(name);
                entityInterface.push({name, type, required});
            }
        };

        if (schema.allOf?.length) {
            for (const item of schema.allOf) {
                if (isReferenceObject(item)) {
                    extend = convertToTypeScriptType(item).value as string;
                } else if (isObjectSchemaObject(item)) {
                    processProperties(item.properties);
                }
            }
        }

        processProperties(schema.properties);
        const source = generateStatements(
            generateInterface(entity, entityInterface, extend),
            generateInterface(`${entity}_References`, referenceInterface),
            generateInterface(`${entity}_Mappings`, referenceMappingsInterface)
        );

        entities.set(entity, {source});
    }

    return entities;
};
