import {isReferenceObject} from '@utils/openapi/guards';
import {typeFallback} from '@utils/openapi/typeFallback';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export const generateTypeScriptType = (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    property?: string
): string | undefined => {
    if (isReferenceObject(schema)) {
        return pascalCase(schema.$ref.replace(/.*\//, ''));
    } else if (schema.enum) {
        return property ? pascalCase(property) : 'unknown';
    } else {
        switch (schema.type) {
            case 'integer':
            case 'number':
                return 'number';
            case 'string':
                return 'string';
            case 'object':
                return `{${
                    Object.entries(schema.properties ?? {})
                        .map(v => `${v[0]}: ${typeFallback(generateTypeScriptType(v[1]))};`)
                        .join(' ')
                }}`;
            case 'boolean':
                return 'boolean';
            case 'array':
                return `${typeFallback(generateTypeScriptType(schema.items, property))}[]`;
            default:
                return undefined;
        }
    }
};
