import type { ObjectProperty } from '@ts/generateObject';
import { generateObject } from '@ts/generateObject';
import { describe, expect, it } from 'vitest';

describe('generateObject', () => {
  it('generates an object with string values', () => {
    const props: ObjectProperty[] = [
      { key: 'name', value: "'John'" },
      { key: 'age', value: 30 }
    ];
    const result = generateObject(props);
    expect(result).toContain("name: 'John'");
    expect(result).toContain('age: 30');
  });

  it('skips undefined values', () => {
    const props: ObjectProperty[] = [
      { key: 'a', value: 1 },
      { key: 'b', value: undefined },
      { key: 'c', value: 3 }
    ];
    const result = generateObject(props);
    expect(result).toContain('a: 1');
    expect(result).not.toContain('b');
    expect(result).toContain('c: 3');
  });

  it('handles nested objects', () => {
    const props: ObjectProperty[] = [
      {
        key: 'nested',
        value: [{ key: 'inner', value: true }]
      }
    ];
    const result = generateObject(props);
    expect(result).toContain('nested:');
    expect(result).toContain('inner: true');
  });

  it('skips empty nested objects', () => {
    const props: ObjectProperty[] = [{ key: 'empty', value: [] }];
    const result = generateObject(props);
    expect(result).toBe('{}');
  });

  it('returns empty object for no properties', () => {
    expect(generateObject([])).toBe('{}');
  });

  it('handles boolean values', () => {
    const result = generateObject([{ key: 'flag', value: false }]);
    expect(result).toContain('flag: false');
  });

  it('handles null values', () => {
    const result = generateObject([{ key: 'x', value: null }]);
    expect(result).toContain('x: null');
  });

  it('includes comments when provided', () => {
    const result = generateObject([{ key: 'x', value: 1, comment: 'A number' }]);
    expect(result).toContain('/** A number */');
    expect(result).toContain('x: 1');
  });
});
