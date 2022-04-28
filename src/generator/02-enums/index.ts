import {generateEnum} from '@ts/generateEnum';
import {isEnumSchemaObject} from '@utils/openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedEnum {
    source: string;
    properties: string[];
}

export const generateEnums = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEnum> => {
    const enums: Map<string, GeneratedEnum> = new Map();

    for (const [propName, schema] of schemas) {
        if (isEnumSchemaObject(schema)) {
            const name = pascalCase(propName);

            if (!enums.has(name)) {
                enums.set(name, {
                    properties: schema.enum,
                    source: generateEnum(name, schema.enum)
                });
            }
        }
    }

    return enums;
};
