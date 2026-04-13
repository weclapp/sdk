import {
  isArraySchemaObject,
  isEnumSchemaObject,
  isNonArraySchemaObject,
  isObject,
  isObjectSchemaObject,
  isParameterObject,
  isReferenceObject,
  isResponseObject
} from '@utils/openapi/guards';
import { describe, expect, it } from 'vitest';

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject('string')).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});

describe('isReferenceObject', () => {
  it('returns true for objects with $ref string', () => {
    expect(isReferenceObject({ $ref: '#/components/schemas/Foo' })).toBe(true);
  });

  it('returns false for non-reference objects', () => {
    expect(isReferenceObject({ type: 'string' })).toBe(false);
    expect(isReferenceObject({})).toBe(false);
  });
});

describe('isParameterObject', () => {
  it('returns true for valid parameter objects', () => {
    expect(isParameterObject({ name: 'id', in: 'query' })).toBe(true);
  });

  it('returns false for missing fields', () => {
    expect(isParameterObject({ name: 'id' })).toBe(false);
    expect(isParameterObject({ in: 'query' })).toBe(false);
  });
});

describe('isObjectSchemaObject', () => {
  it('returns true for object schemas with properties', () => {
    expect(isObjectSchemaObject({ type: 'object', properties: { id: { type: 'string' } } })).toBe(true);
  });

  it('returns false for non-object schemas', () => {
    expect(isObjectSchemaObject({ type: 'string' })).toBe(false);
    expect(isObjectSchemaObject({ type: 'object' })).toBe(false);
  });
});

describe('isEnumSchemaObject', () => {
  it('returns true for string enums', () => {
    expect(isEnumSchemaObject({ type: 'string', enum: ['a', 'b'] })).toBe(true);
  });

  it('returns false for non-enum schemas', () => {
    expect(isEnumSchemaObject({ type: 'string' })).toBe(false);
    expect(isEnumSchemaObject({ type: 'integer', enum: [1, 2] })).toBe(false);
  });
});

describe('isArraySchemaObject', () => {
  it('returns true for array schemas with items', () => {
    expect(isArraySchemaObject({ type: 'array', items: { type: 'string' } })).toBe(true);
  });

  it('returns false for non-array schemas', () => {
    expect(isArraySchemaObject({ type: 'string' })).toBe(false);
  });
});

describe('isResponseObject', () => {
  it('returns true for response objects', () => {
    expect(isResponseObject({ description: 'OK' })).toBe(true);
  });

  it('returns false for non-response objects', () => {
    expect(isResponseObject({})).toBe(false);
    expect(isResponseObject({ description: 123 })).toBe(false);
  });
});

describe('isNonArraySchemaObject', () => {
  it('returns true for string type schemas', () => {
    expect(isNonArraySchemaObject({ type: 'string' })).toBe(true);
  });

  it('returns true for objects without type', () => {
    expect(isNonArraySchemaObject({})).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(isNonArraySchemaObject('string')).toBe(false);
  });
});
