import { generateBlockStatements, generateStatements } from '@ts/generateStatements';
import { describe, expect, it } from 'vitest';

describe('generateStatements', () => {
  it('joins statements with double newlines', () => {
    const result = generateStatements('const a = 1;', 'const b = 2;');
    expect(result).toBe('const a = 1;\n\nconst b = 2;');
  });

  it('filters out empty statements', () => {
    const result = generateStatements('const a = 1;', '', '  ', 'const b = 2;');
    expect(result).toBe('const a = 1;\n\nconst b = 2;');
  });

  it('trims whitespace from statements', () => {
    const result = generateStatements('  const a = 1;  ');
    expect(result).toBe('const a = 1;');
  });

  it('returns empty string for no statements', () => {
    expect(generateStatements()).toBe('');
  });
});

describe('generateBlockStatements', () => {
  it('wraps statements in a block with indentation', () => {
    const result = generateBlockStatements('return true;');
    expect(result).toContain('{');
    expect(result).toContain('}');
    expect(result).toContain('    return true;');
  });
});
