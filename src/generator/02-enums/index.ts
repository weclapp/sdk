import {generateEnum} from '@ts/generateEnum';
import {isReferenceObject} from '@utils/openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedEnum {
    source: string;
    properties: string[];
}

const extractEnum = (
    property: string,
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): GeneratedEnum | undefined => {
    if (isReferenceObject(schema)) {
        return;
    }

    if (schema.enum?.length) {
        return {properties: schema.enum, source: generateEnum(property, schema.enum)};
    } else if (schema.type === 'array') {
        return extractEnum(property, schema.items);
    }
};

export const generateEnums = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEnum> => {
    const enums: Map<string, GeneratedEnum> = new Map();

    for (const [, schema] of schemas) {
        for (const [propName, prop] of Object.entries(schema.properties ?? {})) {
            const name = pascalCase(propName);
            const found = extractEnum(name, prop);

            if (found && !enums.has(name)) {
                enums.set(name, found);
            }
        }
    }

    return enums;
};
