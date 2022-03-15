/* eslint-disable no-use-before-define */
import {CONSTANTS} from '@/src/constants';
import {indent} from '@utils/indent';
import {isReferenceObject} from '@utils/openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

interface Type<V> {
    type: string;
    value: V;

    toString(): string;
}

export interface ReferenceType extends Type<string> {
    type: 'reference';
}

export interface PrimitiveType extends Type<'unknown' | 'number' | 'string' | 'boolean'> {
    type: 'primitive';
}

export interface ArrayType extends Type<AnyType> {
    type: 'array';
}

export interface ObjectType extends Type<Record<string, AnyType | undefined>> {
    type: 'object';
    required: string[];

    isFullyOptional(): boolean;

    toString(propagateOptionalProperties?: boolean): string;
}

export const createReferenceType = (value: string): ReferenceType => ({
    type: 'reference',
    value: pascalCase(value),
    toString: () => pascalCase(value)
});

export const createPrimitiveType = (value: PrimitiveType['value']): PrimitiveType => ({
    type: 'primitive', value,
    toString: () => value
});

export const createArrayType = (value: ArrayType['value']): ArrayType => ({
    type: 'array', value,
    toString: () => `${value.toString()}[]`
});

export const createObjectType = (value: ObjectType['value'], required: string[] = []): ObjectType => ({
    type: 'object',
    value, required,
    isFullyOptional: () => {
        return !required.length && Object.values(value)
            .filter(v => v?.type === 'object')
            .every(v => (v as ObjectType).isFullyOptional());
    },
    toString: (propagateOptionalProperties = false) => {
        const properties = Object.entries(value)
            .filter(v => v[1])
            .map(v => {
                const name = v[0];
                const value = v[1] as AnyType;
                const isRequired = required.includes(name) || (value.type === 'object' && !value.isFullyOptional() && propagateOptionalProperties);
                return `${name + (isRequired ? '' : '?')}: ${value.toString()};`;
            });

        return properties.length ? `{\n${indent(properties.join('\n'))}\n}` : CONSTANTS.EMPTY_OBJECT_TYPE;
    }
});

export type AnyType = ArrayType | ObjectType | PrimitiveType | ReferenceType;

export const convertToTypeScriptType = (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    property?: string
): AnyType => {
    if (isReferenceObject(schema)) {
        return createReferenceType(schema.$ref.replace(/.*\//, ''));
    } else if (schema.enum) {
        return property ? createReferenceType(property) : createPrimitiveType('unknown');
    } else {
        switch (schema.type) {
            case 'integer':
            case 'number':
                return createPrimitiveType('number');
            case 'string':
                return createPrimitiveType('string');
            case 'boolean':
                return createPrimitiveType('boolean');
            case 'object': {
                const {properties = {}, required = []} = schema;
                return createObjectType(
                    Object.fromEntries(
                        Object.entries(properties)
                            .map(v => [v[0], convertToTypeScriptType(v[1])])
                    ), required
                );
            }
            case 'array':
                return createArrayType(convertToTypeScriptType(schema.items, property));
            default:
                return createPrimitiveType('unknown');
        }
    }
};
