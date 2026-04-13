import type { InterfaceProperty } from '@ts/generateInterface';
import { generateInterface, generateInterfaceType } from '@ts/generateInterface';
import { describe, expect, it } from 'vitest';

describe('generateInterface', () => {
  it('generates an interface with required and optional properties', () => {
    const entries: InterfaceProperty[] = [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string' }
    ];
    const result = generateInterface('User', entries);
    expect(result).toContain('export interface User');
    expect(result).toContain('id: string;');
    expect(result).toContain('name?: string;');
  });

  it('generates an interface extending another', () => {
    const entries: InterfaceProperty[] = [{ name: 'extra', type: 'number' }];
    const result = generateInterface('Admin', entries, 'User');
    expect(result).toContain('export interface Admin extends User');
  });

  it('generates an interface extending multiple bases', () => {
    const entries: InterfaceProperty[] = [{ name: 'x', type: 'boolean' }];
    const result = generateInterface('Combined', entries, ['A', 'B']);
    expect(result).toContain('export interface Combined extends A, B');
  });

  it('handles empty entries', () => {
    const result = generateInterface('Empty', []);
    expect(result).toContain('export interface Empty {}');
  });

  it('deduplicates properties by name', () => {
    const entries: InterfaceProperty[] = [
      { name: 'id', type: 'string' },
      { name: 'id', type: 'number' }
    ];
    const result = generateInterface('Dedup', entries);
    expect(result.match(/id/g)?.length).toBe(1);
  });

  it('adds readonly modifier', () => {
    const entries: InterfaceProperty[] = [{ name: 'id', type: 'string', readonly: true }];
    const result = generateInterface('Ro', entries);
    expect(result).toContain('readonly id');
  });

  it('adds inline comments', () => {
    const entries: InterfaceProperty[] = [{ name: 'id', type: 'string', comment: 'Primary key' }];
    const result = generateInterface('Commented', entries);
    expect(result).toContain('/** Primary key */');
  });
});

describe('generateInterfaceType', () => {
  it('generates a type alias for an interface body', () => {
    const entries: InterfaceProperty[] = [{ name: 'id', type: 'string', required: true }];
    const result = generateInterfaceType('Foo', entries);
    expect(result).toContain('export type Foo =');
    expect(result).toContain('id: string;');
  });

  it('generates a type with extends as intersection', () => {
    const entries: InterfaceProperty[] = [{ name: 'x', type: 'number', required: true }];
    const result = generateInterfaceType('Bar', entries, 'Base');
    expect(result).toContain('Base &');
    expect(result).toContain('x: number;');
  });

  it('generates a type with no body but with base', () => {
    const result = generateInterfaceType('Alias', [], 'Original');
    expect(result).toContain('export type Alias = Original;');
  });
});
