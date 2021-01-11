import {isArraySchemaObject, isNonArraySchemaObject, isReferenceObject} from '@openapi/guards';
import {tsInterfaceProperties} from '@ts/interfaces';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

/**
 * Extracts the interface based on the assumption that it's defined somewhere.
 * @param ref
 */
const extractRefInterfaceName = (ref: string): string => {
    return pascalCase(ref.replace(/.*\//, ''));
};

const resolveObjectSchema = (obj: OpenAPIV3.BaseSchemaObject): string => {
    const props = tsInterfaceProperties(
        Object.entries(obj.properties ?? {})
            .map(([name, value]) => {
                return [name, resolveDeclarationType(value)];
            })
    );

    return `{${props}}`;
};

/**
 * Resolves the type of a openapi definition, assumes that all references are defined somewhere!
 * @param obj
 */
export function resolveDeclarationType(obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
    if (isReferenceObject(obj)) {
        return extractRefInterfaceName(obj.$ref);
    } else if (isArraySchemaObject(obj)) {
        return `${resolveDeclarationType(obj.items)}[]`;
    } else if (isNonArraySchemaObject(obj)) {
        const {type} = obj;

        switch (type) {
            case 'string':
            case 'boolean':
                return type as string;
            case 'integer':
            case 'number':
                return 'number';
            case 'object':
                return resolveObjectSchema(obj);
        }
    }

    return 'unknown';
}

