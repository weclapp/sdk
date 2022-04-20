/* eslint-disable no-use-before-define */
import {concat} from '@ts/concat';
import {indent} from '@utils/indent';
import {isReferenceObject} from '@utils/openapi/guards';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

interface Type {
    type: string;
    toString(): string;
}

export interface ReferenceType extends Type {
    type: 'reference';
}

export interface SimpleType extends Type {
    type: 'simple';
}

export interface ArrayType extends Type {
    type: 'array';
}

export interface TupleType extends Type {
    type: 'tuple';
}

export interface ObjectType extends Type {
    type: 'object';

    isFullyOptional(): boolean;

    toString(propagateOptionalProperties?: boolean): string;
}

export const createReferenceType = (value: string): ReferenceType => ({
    type: 'reference',
    toString: () => pascalCase(value)
});

export const createSimpleType = (value: string): SimpleType => ({
    type: 'simple',
    toString: () => value
});

export const createArrayType = (value: Type): ArrayType => ({
    type: 'array',
    toString: () => `${value.toString()}[]`
});

export const createTupleType = (value: Type[]): TupleType => ({
    type: 'tuple',
    toString: () => concat([...new Set(value.map(v => v.toString()))], ' | ')
});

export const createObjectType = (value: Record<string, Type | undefined>, required: string[] = []): ObjectType => ({
    type: 'object',
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

        return properties.length ? `{\n${indent(properties.join('\n'))}\n}` : '{}';
    }
});

export type AnyType = ArrayType | ObjectType | SimpleType | ReferenceType | TupleType;

export const convertToTypeScriptType = (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    property?: string
): AnyType => {
    if (isReferenceObject(schema)) {
        return createReferenceType(schema.$ref.replace(/.*\//, ''));
    } else if (schema.enum) {
        return property ? createReferenceType(property) : createSimpleType('unknown');
    } else {
        switch (schema.type) {
            case 'integer':
            case 'number':
                return createSimpleType('number');
            case 'string':
                // TODO: Browser use buffer?!
                return schema.format === 'binary' ? createSimpleType('Buffer') : createSimpleType('string');
            case 'boolean':
                return createSimpleType('boolean');
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
                return createSimpleType('unknown');
        }
    }
};
