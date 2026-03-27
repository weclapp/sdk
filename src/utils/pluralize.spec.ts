import { pluralize } from '@utils/pluralize';
import { describe, expect, it } from 'vitest';

describe('pluralize', () => {
  it('adds "s" to a regular word', () => {
    expect(pluralize('error')).toBe('errors');
  });

  it('converts words ending in "y" to "ies"', () => {
    expect(pluralize('entry')).toBe('entries');
  });

  it('does not change words already ending in "s"', () => {
    expect(pluralize('errors')).toBe('errors');
  });

  it('handles single character "y"', () => {
    expect(pluralize('y')).toBe('ies');
  });

  it('handles "warning"', () => {
    expect(pluralize('warning')).toBe('warnings');
  });
});
