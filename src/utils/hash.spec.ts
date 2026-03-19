import { hash } from '@utils/hash';
import { describe, expect, it } from 'vitest';

describe('hash', () => {
  it('produces a consistent sha256 hash for a string', () => {
    const h1 = hash('hello');
    const h2 = hash('hello');
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64); // sha256 hex length
  });

  it('produces different hashes for different inputs', () => {
    expect(hash('a')).not.toBe(hash('b'));
  });

  it('handles array of inputs', () => {
    const h = hash(['hello', ' world']);
    expect(h).toHaveLength(64);
  });

  it('supports custom algorithm', () => {
    const h = hash('hello', 'md5');
    expect(h).toHaveLength(32); // md5 hex length
  });
});
