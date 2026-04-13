import { generateArrowFunction } from '@ts/generateArrowFunction';
import { describe, expect, it } from 'vitest';

describe('generateArrowFunction', () => {
  it('generates an arrow function with params', () => {
    const result = generateArrowFunction({
      name: 'some',
      signature: 'ArticleService_Some',
      returns: "_some(cfg, '/article', query, requestOptions)",
      params: ['query', 'requestOptions?: RequestOptions']
    });
    expect(result).toContain('const some: ArticleService_Some = (query, requestOptions?: RequestOptions) =>');
    expect(result).toContain("_some(cfg, '/article', query, requestOptions)");
  });

  it('generates an arrow function without params', () => {
    const result = generateArrowFunction({
      name: 'noop',
      signature: '() => void',
      returns: 'undefined'
    });
    expect(result).toContain('const noop: () => void = () =>');
  });
});
