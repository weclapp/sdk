import { indent } from '@utils/indent';
import { describe, expect, it } from 'vitest';

describe('indent', () => {
  it('indents by 4 spaces at level 1 (default)', () => {
    expect(indent('hello')).toBe('    hello');
  });

  it('indents by 8 spaces at level 2', () => {
    expect(indent('hello', 2)).toBe('        hello');
  });

  it('indents multiple lines', () => {
    const result = indent('line1\nline2');
    expect(result).toBe('    line1\n    line2');
  });

  it('handles empty string', () => {
    expect(indent('')).toBe('');
  });
});
