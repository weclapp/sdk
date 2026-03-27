import { concat } from '@utils/concat';
import { describe, expect, it } from 'vitest';

describe('concat', () => {
  it('joins short strings inline', () => {
    expect(concat(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('uses custom separator', () => {
    expect(concat(['a', 'b', 'c'], ' | ')).toBe('a | b | c');
  });

  it('wraps with indentation when exceeding maxLength', () => {
    const long = Array.from({ length: 20 }, (_, i) => `item${i}`);
    const result = concat(long, ', ', 10);
    expect(result).toContain('\n');
  });

  it('handles single element', () => {
    expect(concat(['only'])).toBe('only');
  });

  it('handles empty array', () => {
    expect(concat([])).toBe('');
  });
});
