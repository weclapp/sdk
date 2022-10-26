import {generateInterface, generateInterfaceType, InterfaceProperty} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {generateString} from '@ts/generateString';
import {convertToTypeScriptType, getRefName} from '@utils/openapi/convertToTypeScriptType';
import {
    isArraySchemaObject,
    isEnumSchemaObject,
    isNonArraySchemaObject,
    isObjectSchemaObject,
    isReferenceObject,
    isRelatedEntitySchema
} from '@utils/openapi/guards';
import {camelCase, pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface PropertyMetaData {
    type?: string;
    format?: string;
    service?: string;
    entity?: string;
}

export interface GeneratedEntity {
    properties: Map<string, PropertyMetaData>;
    extends?: string;
    source: string;
}

export const generateEntities = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEntity> => {
    const entities: Map<string, GeneratedEntity> = new Map();

    for (const [schemaName, schema] of schemas) {

        // Enums are generated separately
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

        const properties = new Map<string, PropertyMetaData>();

        // The parent entity
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
                const comment = isNonArraySchemaObject(property) && property.format ? `format: ${property.format}` : undefined;

                entityInterface.push({
                    name, type, comment,
                    required: meta.required,
                    readonly: !isReferenceObject(property) && property.readOnly
                });

                properties.set(name, {
                    service: meta.service,
                    ...(isReferenceObject(property) ? {
                        entity: getRefName(property)
                    } : {
                        format: property.format,
                        type: property.type,
                        entity: isArraySchemaObject(property) && isReferenceObject(property.items) ?
                            getRefName(property.items) : meta.entity
                    })
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
            generateInterface(`${entity}_References`, referenceInterface, extend ? [`${extend}_References`] : undefined),
            generateInterface(`${entity}_Mappings`, referenceMappingsInterface, extend ? [`${extend}_Mappings`] : undefined),
            generateInterfaceType(`${entity}_Filter`, filterInterface, extend ? [entity, `${extend}_Filter`] : undefined)
        );

        entities.set(schemaName, {
            extends: extend ? camelCase(extend) : extend,
            properties,
            source
        });
    }

    return entities;
};
