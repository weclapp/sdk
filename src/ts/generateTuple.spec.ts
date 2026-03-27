import { generateTuple } from '@ts/generateTuple';
import { describe, expect, it } from 'vitest';

describe('generateTuple', () => {
  it('generates a union type from values', () => {
    const result = generateTuple('Status', ['active', 'inactive']);
    expect(result).toContain('export type Status =');
    expect(result).toContain("'active'");
    expect(result).toContain("'inactive'");
  });

  it('handles single value', () => {
    const result = generateTuple('Single', ['only']);
    expect(result).toContain("'only'");
  });
});
