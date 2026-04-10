import { generateEnum } from '@ts/generateEnum';
import { describe, expect, it } from 'vitest';

describe('generateEnum', () => {
  it('generates an enum with UPPER_SNAKE_CASE keys', () => {
    const result = generateEnum('Color', ['red', 'green', 'blue']);
    expect(result).toContain('export enum Color');
    expect(result).toContain("RED = 'red'");
    expect(result).toContain("GREEN = 'green'");
    expect(result).toContain("BLUE = 'blue'");
  });

  it('handles camelCase values', () => {
    const result = generateEnum('Status', ['activeUser', 'inactiveUser']);
    expect(result).toContain("ACTIVE_USER = 'activeUser'");
    expect(result).toContain("INACTIVE_USER = 'inactiveUser'");
  });

  it('handles single value', () => {
    const result = generateEnum('Single', ['only']);
    expect(result).toContain("ONLY = 'only'");
    expect(result).not.toContain(',');
  });
});
