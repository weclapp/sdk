import { arrayify } from '@utils/arrayify';
import { describe, expect, it } from 'vitest';

describe('arrayify', () => {
  it('wraps a single value in an array', () => {
    expect(arrayify('hello')).toEqual(['hello']);
  });

  it('returns the array as-is if already an array', () => {
    expect(arrayify([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('wraps a number', () => {
    expect(arrayify(42)).toEqual([42]);
  });

  it('handles empty array', () => {
    expect(arrayify([])).toEqual([]);
  });
});
