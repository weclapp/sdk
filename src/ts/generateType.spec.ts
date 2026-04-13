import { generateType } from '@ts/generateType';
import { describe, expect, it } from 'vitest';

describe('generateType', () => {
  it('generates a simple type alias', () => {
    expect(generateType('Foo', 'string')).toBe('export type Foo = string;');
  });

  it('generates a union type', () => {
    expect(generateType('Status', "'active' | 'inactive'")).toBe("export type Status = 'active' | 'inactive';");
  });

  it('trims the value', () => {
    expect(generateType('Foo', '  string  ')).toBe('export type Foo = string;');
  });
});
