import { generateArray } from '@ts/generateArray';
import { describe, expect, it } from 'vitest';

describe('generateArray', () => {
  it('generates an array of quoted values', () => {
    expect(generateArray(['a', 'b', 'c'])).toBe("['a', 'b', 'c']");
  });

  it('generates an empty array', () => {
    expect(generateArray([])).toBe('[]');
  });

  it('converts non-string values to strings', () => {
    expect(generateArray([1, 2])).toBe("['1', '2']");
  });
});
