import {generateInterface, InterfaceProperty, InterfacePropertyType} from '@ts/generateInterface';
import {isReferenceObject} from '@utils/openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedEntity {
    source: string;
    properties: InterfaceProperty[];
}

const primitive = (str: string): InterfacePropertyType => ({
    type: 'primitive',
    value: str
});

const reference = (str: string): InterfacePropertyType => ({
    type: 'reference',
    value: str
});

const generateTypeScriptType = (
    property: string,
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): InterfacePropertyType => {
    if (isReferenceObject(schema)) {
        return reference(pascalCase(schema.$ref.replace(/.*\//, '')));
    } else if (schema.enum) {
        return reference(pascalCase(property));
    } else {
        switch (schema.type) {
            case 'integer':
            case 'number':
                return primitive('number');
            case 'string':
                return primitive('string');
            case 'boolean':
                return primitive('boolean');
            case 'array':
                return isReferenceObject(schema.items) ?
                    primitive('unknown') :
                    primitive(`${generateTypeScriptType(property, schema.items).value}[]`);
            default:
                return primitive('unknown');
        }
    }
};

export const generateEntities = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEntity> => {
    const entities: Map<string, GeneratedEntity> = new Map();

    for (const [schemaName, schema] of schemas) {
        const properties: InterfaceProperty[] = [];
        const name = pascalCase(schemaName);

        for (const [name, property] of Object.entries(schema.properties ?? {})) {
            properties.push({
                name,
                type: generateTypeScriptType(name, property)
            });
        }

        const source = generateInterface(name, properties);
        entities.set(name, {properties, source});
    }

    return entities;
};
