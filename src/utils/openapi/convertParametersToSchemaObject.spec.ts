import { convertParametersToSchemaObject } from '@utils/openapi/convertParametersToSchemaObject';
import { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';

describe('convertParametersToSchemaObject', () => {
  it('converts query parameters to schema object', () => {
    const params: OpenAPIV3.ParameterObject[] = [
      { name: 'page', in: 'query', schema: { type: 'integer' }, required: true },
      { name: 'search', in: 'query', schema: { type: 'string' } }
    ];

    const result = convertParametersToSchemaObject(params);

    expect(result.type).toBe('object');
    expect(result.properties).toHaveProperty('page');
    expect(result.properties).toHaveProperty('search');
    expect(result.required).toEqual(['page']);
  });

  it('ignores non-query parameters', () => {
    const params: OpenAPIV3.ParameterObject[] = [
      { name: 'id', in: 'path', schema: { type: 'string' } },
      { name: 'search', in: 'query', schema: { type: 'string' } }
    ];

    const result = convertParametersToSchemaObject(params);
    expect(Object.keys(result.properties ?? {})).toEqual(['search']);
  });

  it('ignores parameters without schema', () => {
    const params: OpenAPIV3.ParameterObject[] = [{ name: 'x', in: 'query' } as OpenAPIV3.ParameterObject];

    const result = convertParametersToSchemaObject(params);
    expect(Object.keys(result.properties ?? {})).toEqual([]);
  });

  it('returns empty schema for empty params', () => {
    const result = convertParametersToSchemaObject([]);
    expect(result.type).toBe('object');
    expect(Object.keys(result.properties ?? {})).toEqual([]);
    expect(result.required).toEqual([]);
  });
});
