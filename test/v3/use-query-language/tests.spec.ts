import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { articleService, setGlobalConfig } from '@sdk/dist';

describe('where', () => {
  let capturedRequest: Request;

  beforeAll(() => {
    setGlobalConfig({
      host: 'test.example.com',
      secure: true,
      key: 'test-key',
      interceptors: {
        request: (request) => {
          capturedRequest = request;
          return new Response(
            JSON.stringify({
              result: [],
              referencedEntities: {},
              additionalProperties: {}
            }),
            {
              status: 200,
              headers: { 'content-type': 'application/json' }
            }
          );
        }
      }
    });
  });

  describe('where filter', () => {
    it('should assemble a typed where object into a filter query param', async () => {
      const service = articleService();

      await service.some({
        where: {
          articleNumber: { EQ: 'ART-001' }
        }
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('filter')).toBe('articleNumber = "ART-001"');
    });

    it('should pass a raw string where directly as the filter query param', async () => {
      const service = articleService();

      await service.some({
        where: 'articleNumber = "ART-001"'
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('filter')).toBe('articleNumber = "ART-001"');
    });

    it('should pass sort as a comma-separated query param', async () => {
      const service = articleService();

      await service.some({
        sort: [{ articleNumber: 'asc' }, { name: 'desc' }]
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('sort')).toBe('articleNumber,-name');
    });

    it('should pass pagination as page and pageSize query params', async () => {
      const service = articleService();

      await service.some({
        pagination: { page: 3, pageSize: 25 }
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('page')).toBe('3');
      expect(url.searchParams.get('pageSize')).toBe('25');
    });

    it('should assemble a typed where object into the request body when usePost is true', async () => {
      const service = articleService({ usePost: true });

      await service.some({
        where: {
          articleNumber: { EQ: 'ART-001' }
        }
      });

      const body = await capturedRequest.json();
      expect(body.filter).toBe('articleNumber = "ART-001"');
    });

    it('should pass a raw string where directly into the request body when usePost is true', async () => {
      const service = articleService({ usePost: true });

      await service.some({
        where: 'articleNumber = "ART-001"'
      });

      const body = await capturedRequest.json();
      expect(body.filter).toBe('articleNumber = "ART-001"');
    });

    it('should combine where, sort and pagination into a single request', async () => {
      const service = articleService();

      await service.some({
        where: 'articleNumber = "ART-001"',
        sort: [{ articleNumber: 'asc' }],
        pagination: { page: 1, pageSize: 10 }
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('filter')).toBe('articleNumber = "ART-001"');
      expect(url.searchParams.get('sort')).toBe('articleNumber');
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.get('pageSize')).toBe('10');
    });
  });

  describe('orderBy', () => {
    it('should assemble a typed orderBy object into an orderBy query param', async () => {
      const service = articleService();

      await service.some({
        orderBy: [{ FIELD: { articleNumber: true }, SORT: 'desc' }]
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('orderBy')).toBe('articleNumber desc');
    });

    it('should pass a raw string orderBy directly as the orderBy query param', async () => {
      const service = articleService();

      await service.some({
        orderBy: 'articleNumber desc'
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('orderBy')).toBe('["articleNumber desc"]');
    });

    it('should assemble a typed orderBy object into the request body when usePost is true', async () => {
      const service = articleService({ usePost: true });

      await service.some({
        orderBy: [{ FIELD: { articleNumber: true }, SORT: 'desc' }]
      });

      const body = await capturedRequest.json();
      expect(body.orderBy).toEqual(['articleNumber desc']);
    });

    it('should pass a raw string orderBy directly into the request body when usePost is true', async () => {
      const service = articleService({ usePost: true });

      await service.some({
        orderBy: 'articleNumber desc'
      });

      const body = await capturedRequest.json();
      expect(body.orderBy).toEqual(['articleNumber desc']);
    });

    it('should pass pagination as page and pageSize query params', async () => {
      const service = articleService();

      await service.some({
        pagination: { page: 3, pageSize: 25 }
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('page')).toBe('3');
      expect(url.searchParams.get('pageSize')).toBe('25');
    });

    it('should combine where, orderBy and pagination into a single request', async () => {
      const service = articleService();

      await service.some({
        where: 'articleNumber = "ART-001"',
        orderBy: 'articleNumber desc',
        pagination: { page: 1, pageSize: 10 }
      });

      const url = new URL(capturedRequest.url);
      expect(url.searchParams.get('filter')).toBe('articleNumber = "ART-001"');
      expect(url.searchParams.get('orderBy')).toBe('["articleNumber desc"]');
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.get('pageSize')).toBe('10');
    });
  });

  afterAll(() => {
    setGlobalConfig(undefined);
  });
});
