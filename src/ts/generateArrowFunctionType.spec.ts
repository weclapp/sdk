import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { describe, expect, it } from 'vitest';

describe('generateArrowFunctionType', () => {
  it('generates a function type with no params and default void return', () => {
    const result = generateArrowFunctionType({ type: 'Callback' });
    expect(result).toContain('export type Callback =');
    expect(result).toContain('() =>');
    expect(result).toContain('void');
  });

  it('generates a function type with params and return type', () => {
    const result = generateArrowFunctionType({
      type: 'Handler',
      params: ['event: Event'],
      returns: 'boolean'
    });
    expect(result).toContain('export type Handler =');
    expect(result).toContain('(event: Event)');
    expect(result).toContain('boolean');
  });

  it('generates a function type with generics', () => {
    const result = generateArrowFunctionType({
      type: 'Mapper',
      generics: ['TInput', 'TOutput'],
      params: ['input: TInput'],
      returns: 'Promise<TOutput>'
    });
    expect(result).toContain('export type Mapper =');
    expect(result).toContain('TInput');
    expect(result).toContain('TOutput');
    expect(result).toContain('(input: TInput)');
    expect(result).toContain('=>');
    expect(result).toContain('Promise<TOutput>');
  });
});
