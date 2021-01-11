import {isArraySchemaObject, isNonArraySchemaObject, isReferenceObject, isSchemaObject} from '@openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

/**
 * Extracts the interface based on the assumption that it's defined somewhere.
 * @param ref
 */
const extractRefInterfaceName = (ref: string): string => {
    return pascalCase(ref.replace(/.*\//, ''));
};

/**
 * Resolves the type of a openapi definition, assumes that all references are defined somewhere!
 * @param obj
 */
export function resolveDeclarationType(obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
    if (isReferenceObject(obj)) {
        return extractRefInterfaceName(obj.$ref);
    } else if (isSchemaObject(obj)) {
        const {type} = obj;

        switch (type) {
            case 'string':
            case 'boolean':
                return type as string;
            case 'integer':
                return 'number';
            case 'array': {
                if (isArraySchemaObject(obj)) {
                    return `${resolveDeclarationType(obj.items)}[]`;
                } else if (isNonArraySchemaObject(obj)) {
                    return obj.type ?? 'unknown';
                }
            }
        }
    }

    return 'unknown';
}

