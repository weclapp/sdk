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

export const parseEndpointPath = (path: string): WeclappNormalEndpoint | WeclappSpecialEndpoint | undefined => {
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
