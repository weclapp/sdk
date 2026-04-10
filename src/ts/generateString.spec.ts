import { generateString, generateStrings } from '@ts/generateString';
import { describe, expect, it } from 'vitest';

describe('generateString', () => {
  it('wraps a string in single quotes', () => {
    expect(generateString('hello')).toBe("'hello'");
  });

  it('handles empty string', () => {
    expect(generateString('')).toBe("''");
  });

  it('handles strings with special characters', () => {
    expect(generateString('foo/bar')).toBe("'foo/bar'");
  });
});

describe('generateStrings', () => {
  it('wraps each string in single quotes', () => {
    expect(generateStrings(['a', 'b', 'c'])).toEqual(["'a'", "'b'", "'c'"]);
  });

  it('returns empty array for empty input', () => {
    expect(generateStrings([])).toEqual([]);
  });
});
