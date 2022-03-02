/**
 * ROOT           => /article
 * COUNT          => /article/count
 * ENTITY         => /article/{id}
 * SPECIAL_ROOT   => /article/generateImage
 * SPECIAL_ENTITY => /article/id/{id}/generateImag
 */
export enum WeclappEndpointType {
    ROOT = 'ROOT',
    COUNT = 'COUNT',
    ENTITY = 'ENTITY',
    SPECIAL_ROOT = 'SPECIAL_ROOT',
    SPECIAL_ENTITY = 'SPECIAL_ENTITY'
}

export type WeclappEndpoint = WeclappNormalEndpoint | WeclappSpecialEndpoint;

export interface WeclappNormalEndpoint {
    type: WeclappEndpointType.ROOT | WeclappEndpointType.COUNT | WeclappEndpointType.ENTITY;
    path: string;
    entity: string;
}

export interface WeclappSpecialEndpoint {
    type: WeclappEndpointType.SPECIAL_ROOT | WeclappEndpointType.SPECIAL_ENTITY;
    path: string;
    entity: string;
    method: string;
}

export const parseEndpointPath = (path: string): WeclappNormalEndpoint | WeclappSpecialEndpoint | undefined => {
    const [, entity, ...rest] = path.split('/');

    if (!entity) {
        return undefined;
    }

    if (!rest.length) {
        return {path, entity, type: WeclappEndpointType.ROOT};
    } else if (rest[0] === 'count') {
        return {path, entity, type: WeclappEndpointType.COUNT};
    } else if (rest[0] === 'id') {
        return rest.length === 2 ?
            {path, entity, type: WeclappEndpointType.ENTITY} :
            {path, entity, method: rest[2], type: WeclappEndpointType.SPECIAL_ENTITY};
    } else if (rest.length === 1) {
        return {path, entity, method: rest[1], type: WeclappEndpointType.SPECIAL_ROOT};
    }

    return undefined;
};
