import {generateInterface, generateInterfaceType, InterfaceProperty} from '@ts/generateInterface';
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

        // Entity and filter
        const entityInterface: InterfaceProperty[] = [];
        const filterInterface: InterfaceProperty[] = [];

        // Referenced entities and property-to-referenced-entity mapping
        const referenceInterface: InterfaceProperty[] = [];
        const referenceMappingsInterface: InterfaceProperty[] = [];
        let extend = undefined;

        const processProperties = (props: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}) => {
            for (const [name, property] of Object.entries(props)) {
                const meta = isRelatedEntitySchema(property) ? property['x-weclapp'] : {};

                if (meta.entity) {
                    const type = `${pascalCase(meta.entity)}[]`;
                    referenceInterface.push({name, type, required: true});
                    filterInterface.push({name: meta.entity, type, required: true});
                }

                if (meta.service) {
                    referenceMappingsInterface.push({name, type: generateString(meta.service), required: true});
                }

                const type = convertToTypeScriptType(property, name).toString();
                entityInterface.push({
                    name, type,
                    required: meta.required,
                    readonly: !isReferenceObject(property) && property.readOnly
                });
            }
        };

        if (schema.allOf?.length) {
            for (const item of schema.allOf) {
                if (isReferenceObject(item)) {
                    extend = convertToTypeScriptType(item).toString();
                } else if (isObjectSchemaObject(item)) {
                    processProperties(item.properties);
                }
            }
        }

        processProperties(schema.properties);
        const source = generateStatements(
            generateInterface(
                entity, entityInterface.map(property => {
                    let deprecated = false;

                    if (property.name.endsWith('Name')) {
                        const rawName = property.name.slice(0, -4);
                        deprecated =
                            filterInterface.some(v => v.name === rawName) &&
                            entityInterface.some(v => v.name.endsWith('Id') && v.name.slice(0, -2) === rawName);
                    }


                    return deprecated ? {...property, comment: `@deprecated`} : property;
                }), extend
            ),
            generateInterface(`${entity}_References`, referenceInterface),
            generateInterface(`${entity}_Mappings`, referenceMappingsInterface),
            generateInterfaceType(`${entity}_Filter`, filterInterface, extend ? [entity, `${extend}_Filter`] : undefined)
        );

        entities.set(schemaName, {source});
    }

    return entities;
};
