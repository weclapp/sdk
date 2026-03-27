import { generateBlockComment, generateInlineComment } from '@ts/generateComment';
import { describe, expect, it } from 'vitest';

describe('generateInlineComment', () => {
  it('generates an inline JSDoc comment', () => {
    expect(generateInlineComment('Hello')).toBe('/** Hello */');
  });
});

describe('generateBlockComment', () => {
  it('generates a block comment without body', () => {
    const result = generateBlockComment('This is a comment');
    expect(result).toBe('/**\n * This is a comment\n */');
  });

  it('generates a block comment with body', () => {
    const result = generateBlockComment('Comment', 'const x = 1;');
    expect(result).toBe('/**\n * Comment\n */\nconst x = 1;');
  });

  it('trims leading spaces from comment lines', () => {
    const result = generateBlockComment('   line1\n   line2');
    expect(result).toBe('/**\n * line1\n * line2\n */');
  });
});
