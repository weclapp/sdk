import { OpenAPIV3 } from 'openapi-types';
import { logger } from '@logger';
import { ParsedEndpoint } from './extractContext';

/**
 * ROOT => /article
 * COUNT => /article/count
 * ENTITY => /article/{id}
 * SPECIAL_ROOT => /article/generateImage
 * SPECIAL_ENTITY => /article/id/{id}/generateImag
 */
export enum WeclappEndpointType {
  ROOT = 'ROOT',
  COUNT = 'COUNT',
  ENTITY = 'ENTITY',
  GENERIC_ROOT = 'GENERIC_ROOT',
  GENERIC_ENTITY = 'GENERIC_ENTITY'
}

export interface WeclappNormalEndpoint {
  type: WeclappEndpointType.ROOT | WeclappEndpointType.COUNT | WeclappEndpointType.ENTITY;
  path: string;
  service: string;
}

export interface WeclappSpecialEndpoint {
  type: WeclappEndpointType.GENERIC_ROOT | WeclappEndpointType.GENERIC_ENTITY;
  path: string;
  service: string;
  method: string;
}

export type WeclappEndpoint = WeclappNormalEndpoint | WeclappSpecialEndpoint;

const parseEndpointPath = (path: string): WeclappNormalEndpoint | WeclappSpecialEndpoint | undefined => {
  const [, service, ...rest] = path.split('/');

  if (!service) {
    return undefined;
  }

  if (!rest.length) {
    return { path, service, type: WeclappEndpointType.ROOT };
  } else if (rest[0] === 'count') {
    return { path, service, type: WeclappEndpointType.COUNT };
  } else if (rest[0] === 'id') {
    return rest.length === 2
      ? { path, service, type: WeclappEndpointType.ENTITY }
      : {
          path,
          service,
          method: rest[2],
          type: WeclappEndpointType.GENERIC_ENTITY
        };
  } else if (rest.length === 1) {
    return {
      path,
      service,
      method: rest[1],
      type: WeclappEndpointType.GENERIC_ROOT
    };
  }

  return undefined;
};

const isMultiPartUploadPath = (path: string) => {
  const [, entity, ...rest] = path.split('/');
  return entity && rest.length === 2 && rest[1] === 'multipartUpload';
};

export const parseEndpointsPaths = (paths: OpenAPIV3.PathsObject): Map<string, ParsedEndpoint[]> => {
  const endpoints: Map<string, ParsedEndpoint[]> = new Map();

  for (const [rawPath, path] of Object.entries(paths)) {
    const endpoint = parseEndpointPath(rawPath);

    if (!endpoint || !path) {
      // Todo: Should be removed if sdk supports multi part upload.
      if (isMultiPartUploadPath(rawPath)) {
        continue;
      }
      logger.errorLn(`Failed to parse ${rawPath}`);
      continue;
    }

    if (endpoints.has(endpoint.service)) {
      endpoints.get(endpoint.service)?.push({ endpoint, path });
    } else {
      endpoints.set(endpoint.service, [{ endpoint, path }]);
    }
  }

  return endpoints;
};
