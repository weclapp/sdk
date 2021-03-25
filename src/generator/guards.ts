/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {OpenAPIV3} from 'openapi-types';

/**
 * This module contains a set of lightweight type-guards for openapi-v3 types.
 */

export const isObject = (v: any): v is Record<any, any> => {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
};

export const isParameterObject = (v: any): v is OpenAPIV3.ParameterObject => {
    return isObject(v) && typeof v.name === 'string' && typeof v.in === 'string';
};

export const isReferenceObject = (v: any): v is OpenAPIV3.ReferenceObject => {
    return isObject(v) && typeof v.$ref === 'string';
};

export const isArraySchemaObject = (v: any): v is OpenAPIV3.ArraySchemaObject => {
    return isObject(v) && v.type === 'array' && typeof v.items === 'object';
};

export const isResponseObject = (v: any): v is OpenAPIV3.ResponseObject => {
    return isObject(v) && typeof v.description === 'string';
};

export const isRequestBodyObject = (v: any): v is OpenAPIV3.RequestBodyObject => {
    return isObject(v) && typeof v.content === 'object' &&
        ['string', 'undefined'].includes(typeof v.description) &&
        ['boolean', 'undefined'].includes(typeof v.required);
};

export const isNonArraySchemaObject = (v: any): v is OpenAPIV3.NonArraySchemaObjectType => {
    return ['string', 'undefined'].includes(typeof v.type);
};
