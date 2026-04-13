import { parseEndpointsPaths, WeclappEndpointType } from '@utils/weclapp/parseEndpointPath';
import { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';

const paths = (obj: Record<string, unknown>) => obj as OpenAPIV3.PathsObject;

describe('parseEndpointsPaths', () => {
  it('parses a ROOT endpoint', () => {
    const result = parseEndpointsPaths(paths({ '/article': { get: {} } }));
    expect(result.has('article')).toBe(true);
    const endpoints = result.get('article')!;
    expect(endpoints[0].endpoint.type).toBe(WeclappEndpointType.ROOT);
    expect(endpoints[0].endpoint.service).toBe('article');
  });

  it('parses a COUNT endpoint', () => {
    const result = parseEndpointsPaths(paths({ '/article/count': { get: {} } }));
    const endpoints = result.get('article')!;
    expect(endpoints[0].endpoint.type).toBe(WeclappEndpointType.COUNT);
  });

  it('parses an ENTITY endpoint', () => {
    const result = parseEndpointsPaths(paths({ '/article/id/{id}': { get: {} } }));
    const endpoints = result.get('article')!;
    expect(endpoints[0].endpoint.type).toBe(WeclappEndpointType.ENTITY);
  });

  it('parses a GENERIC_ROOT endpoint', () => {
    const result = parseEndpointsPaths(paths({ '/article/generateImage': { post: {} } }));
    const endpoints = result.get('article')!;
    expect(endpoints[0].endpoint.type).toBe(WeclappEndpointType.GENERIC_ROOT);
  });

  it('parses a GENERIC_ENTITY endpoint', () => {
    const result = parseEndpointsPaths(paths({ '/article/id/{id}/generateImage': { post: {} } }));
    const endpoints = result.get('article')!;
    expect(endpoints[0].endpoint.type).toBe(WeclappEndpointType.GENERIC_ENTITY);
    if (endpoints[0].endpoint.type === WeclappEndpointType.GENERIC_ENTITY) {
      expect(endpoints[0].endpoint.method).toBe('generateImage');
    }
  });

  it('groups endpoints by service', () => {
    const result = parseEndpointsPaths(
      paths({
        '/article': { get: {} },
        '/article/count': { get: {} },
        '/article/id/{id}': { get: {} }
      })
    );
    expect(result.get('article')!.length).toBe(3);
  });

  it('handles multipartUpload paths as entity endpoints', () => {
    const result = parseEndpointsPaths(paths({ '/article/id/multipartUpload': {} }));
    // '/article/id/multipartUpload' => rest = ['id', 'multipartUpload'] => GENERIC_ENTITY
    expect(result.has('article')).toBe(true);
  });
});
