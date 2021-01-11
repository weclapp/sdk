/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {OpenAPIV3} from 'openapi-types';

/**
 * This module contains a set of lightweight type-guards for openapi-v3 types.
 */

export const isParameterObject = (v: any): v is OpenAPIV3.ParameterObject => {
    return typeof v.name === 'string' && typeof v.in === 'string';
};

export const isReferenceObject = (v: any): v is OpenAPIV3.ReferenceObject => {
    return typeof v.$ref === 'string';
};

export const isArraySchemaObject = (v: any): v is OpenAPIV3.ArraySchemaObject => {
    return v.type === 'array' && typeof v.items === 'object';
};

export const isNonArraySchemaObject = (v: any): v is OpenAPIV3.NonArraySchemaObjectType => {
    return ['string', 'undefined'].includes(typeof v.type);
};

export const isSchemaObject = (v: any): v is OpenAPIV3.SchemaObject => {
    return isArraySchemaObject(v) || isNonArraySchemaObject(v);
};
