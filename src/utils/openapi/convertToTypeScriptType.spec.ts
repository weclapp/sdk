import {
  convertToTypeScriptType,
  createArrayType,
  createObjectType,
  createRawType,
  createReferenceType,
  createTupleType,
  getRefName
} from '@utils/openapi/convertToTypeScriptType';
import { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';

describe('getRefName', () => {
  it('extracts the last segment of a $ref path', () => {
    expect(getRefName({ $ref: '#/components/schemas/Article' })).toBe('Article');
  });
});

describe('createReferenceType', () => {
  it('capitalizes the first letter', () => {
    expect(createReferenceType('article').toString()).toBe('Article');
  });

  it('preserves already capitalized names', () => {
    expect(createReferenceType('Article').toString()).toBe('Article');
  });
});

describe('createRawType', () => {
  it('returns the raw value as-is', () => {
    expect(createRawType('number').toString()).toBe('number');
    expect(createRawType('boolean').toString()).toBe('boolean');
  });
});

describe('createArrayType', () => {
  it('wraps the inner type in parentheses and brackets', () => {
    const inner = createRawType('string');
    expect(createArrayType(inner).toString()).toBe('(string)[]');
  });
});

describe('createTupleType', () => {
  it('creates a union of quoted string values', () => {
    const result = createTupleType(['a', 'b']);
    expect(result.toString()).toContain("'a'");
    expect(result.toString()).toContain("'b'");
  });

  it('deduplicates values', () => {
    const result = createTupleType(['a', 'a']);
    const occurrences = result.toString().split("'a'").length - 1;
    expect(occurrences).toBe(1);
  });

  it('handles Type objects', () => {
    const result = createTupleType([createRawType('string'), createRawType('number')]);
    expect(result.toString()).toContain('string');
    expect(result.toString()).toContain('number');
  });
});

describe('createObjectType', () => {
  it('generates an object type with required and optional fields', () => {
    const obj = createObjectType({ id: createRawType('string'), name: createRawType('string') }, ['id']);
    const str = obj.toString();
    expect(str).toContain('id: string;');
    expect(str).toContain('name?: string;');
  });

  it('returns {} for empty object', () => {
    expect(createObjectType({}).toString()).toBe('{}');
  });

  it('isFullyOptional returns true when no required fields', () => {
    const obj = createObjectType({ x: createRawType('number') });
    expect(obj.isFullyOptional()).toBe(true);
  });

  it('isFullyOptional returns false when required fields exist', () => {
    const obj = createObjectType({ x: createRawType('number') }, ['x']);
    expect(obj.isFullyOptional()).toBe(false);
  });

  it('forces all properties to required with propagation option', () => {
    const obj = createObjectType({ x: createRawType('number'), y: createRawType('string') });
    const str = obj.toString('force');
    expect(str).toContain('x: number;');
    expect(str).toContain('y: string;');
    expect(str).not.toContain('?');
  });

  it('skips undefined values', () => {
    const obj = createObjectType({ x: createRawType('number'), y: undefined });
    const str = obj.toString();
    expect(str).toContain('x');
    expect(str).not.toContain('y');
  });
});

describe('convertToTypeScriptType', () => {
  it('converts integer schema to number', () => {
    expect(convertToTypeScriptType({ type: 'integer' }).toString()).toBe('number');
  });

  it('converts number schema to number', () => {
    expect(convertToTypeScriptType({ type: 'number' }).toString()).toBe('number');
  });

  it('converts string schema to string', () => {
    expect(convertToTypeScriptType({ type: 'string' }).toString()).toBe('string');
  });

  it('converts boolean schema to boolean', () => {
    expect(convertToTypeScriptType({ type: 'boolean' }).toString()).toBe('boolean');
  });

  it('converts string enum to union type', () => {
    const result = convertToTypeScriptType({ type: 'string', enum: ['A', 'B'] });
    expect(result.toString()).toContain("'A'");
    expect(result.toString()).toContain("'B'");
  });

  it('converts binary format to binary type', () => {
    expect(convertToTypeScriptType({ type: 'string', format: 'binary' }).toString()).toBe('binary');
  });

  it('converts $ref to reference type', () => {
    const result = convertToTypeScriptType({ $ref: '#/components/schemas/Article' });
    expect(result.toString()).toBe('Article');
  });

  it('converts array schema to array type', () => {
    const result = convertToTypeScriptType({ type: 'array', items: { type: 'string' } });
    expect(result.toString()).toBe('(string)[]');
  });

  it('converts object schema with properties', () => {
    const result = convertToTypeScriptType({
      type: 'object',
      properties: {
        id: { type: 'string' },
        count: { type: 'integer' }
      },
      required: ['id']
    });
    const str = result.toString();
    expect(str).toContain('id: string;');
    expect(str).toContain('count?: number;');
  });

  it('returns unknown for unrecognized types', () => {
    expect(convertToTypeScriptType({} as OpenAPIV3.SchemaObject).toString()).toBe('unknown');
  });

  it('converts parameter array to object schema', () => {
    const result = convertToTypeScriptType([
      { name: 'page', in: 'query', schema: { type: 'integer' }, required: true }
    ]);
    expect(result.toString()).toContain('page: number;');
  });
});
