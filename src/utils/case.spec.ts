import { loosePascalCase } from '@utils/case';
import { describe, expect, it } from 'vitest';

describe('loosePascalCase', () => {
  it('capitalizes the first character', () => {
    expect(loosePascalCase('hello')).toBe('Hello');
  });

  it('preserves already uppercase first character', () => {
    expect(loosePascalCase('Hello')).toBe('Hello');
  });

  it('preserves the rest of the string exactly', () => {
    expect(loosePascalCase('cDBReminderType')).toBe('CDBReminderType');
  });

  it('handles single character', () => {
    expect(loosePascalCase('a')).toBe('A');
  });
});
