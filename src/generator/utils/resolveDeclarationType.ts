import {isArraySchemaObject, isNonArraySchemaObject, isReferenceObject} from '@generator/guards';
import {tsInterfaceProperties} from '@ts/interfaces';
import {indent} from '@utils/indent';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';
import {tsEnumName} from '@ts/enums';

/**
 * Extracts the interface based on the assumption that it's defined somewhere.
 * @param ref
 */
const extractRefInterfaceName = (ref: string): string => {
    return pascalCase(ref.replace(/.*\//, ''));
};

const resolveStringEnum = (propertyEnum?: string[], propertyName?: string, entityName?: string): string => {
    return propertyEnum?.length && entityName && propertyName ? tsEnumName({entityName, propertyName}) : 'string';
};

/**
 * Resolves the type of a openapi definition, assumes that all references are defined somewhere!
 * @param obj
 * @param propertyName
 * @param entityName
 */
export function resolveDeclarationType(obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, propertyName?: string, entityName?: string): string {
    if (isReferenceObject(obj)) {
        return extractRefInterfaceName(obj.$ref);
    } else if (isArraySchemaObject(obj)) {
        return `${resolveDeclarationType(obj.items)}[]`;
    } else if (isNonArraySchemaObject(obj)) {
        const {type, enum: propertyEnum} = obj;

        switch (type) {
            case 'string':
                return resolveStringEnum(propertyEnum, propertyName, entityName);
            case 'boolean':
                return type as string;
            case 'integer':
            case 'number':
                return 'number';
            case 'object':
                /* eslint-disable no-use-before-define */
                return resolveObjectSchema(obj);
        }
    }

    return 'unknown';
}

const resolveObjectSchema = (obj: OpenAPIV3.BaseSchemaObject): string => {
    const props = tsInterfaceProperties(
        Object.entries(obj.properties ?? {})
            .map(([name, value]) => ({name, value: resolveDeclarationType(value), required: !!obj.required?.includes(name)}))
    );

    return `{\n${indent(props)}\n}`;
};
