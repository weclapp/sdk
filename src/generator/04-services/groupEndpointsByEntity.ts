import {logger} from '@logger';
import {parseEndpointPath, WeclappEndpoint} from '@utils/weclapp/parseEndpointPath';
import {OpenAPIV3} from 'openapi-types';

export interface ParsedEndpoint {
    endpoint: WeclappEndpoint;
    path: OpenAPIV3.PathsObject;
}

export type GroupedEndpoints = Map<string, ParsedEndpoint[]>;

export const groupEndpointsByEntity = (paths: OpenAPIV3.PathsObject): GroupedEndpoints => {
    const endpoints: GroupedEndpoints = new Map();

    for (const [rawPath, path] of Object.entries(paths)) {
        const endpoint = parseEndpointPath(rawPath);

        if (!endpoint) {
            logger.errorLn(`Failed to parse ${rawPath}`);
            continue;
        }

        if (endpoints.has(endpoint.entity)) {
            endpoints.get(endpoint.entity)?.push({
                endpoint,
                path: path as OpenAPIV3.PathsObject
            });
        } else {
            endpoints.set(endpoint.entity, [{
                endpoint,
                path: path as OpenAPIV3.PathsObject
            }]);
        }
    }

    return endpoints;
};
