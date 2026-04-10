import { match } from '@utils/regex';
import { describe, expect, it } from 'vitest';

describe('match', () => {
  it('returns the full match by default', () => {
    expect(match('hello123', /\d+/)).toBe('123');
  });

  it('returns a specific capture group', () => {
    expect(match('hello123world', /(\d+)(\w+)/, 1)).toBe('123');
    expect(match('hello123world', /(\d+)(\w+)/, 2)).toBe('world');
  });

  it('returns null when no match', () => {
    expect(match('hello', /\d+/)).toBeNull();
  });

  it('returns null for non-existent group', () => {
    expect(match('hello', /(hello)/, 5)).toBeNull();
  });
});
