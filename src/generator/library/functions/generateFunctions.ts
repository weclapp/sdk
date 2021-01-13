import {EndpointPath} from '@generator/library';
import {countFunction} from '@generator/library/functions/countFunction';
import {entityFunction} from '@generator/library/functions/entityFunction';
import {rootFunction} from '@generator/library/functions/rootFunction';
import {SwaggerPathType} from '@generator/utils/parseSwaggerPath';
import {logger} from '@logger';

/**
 * Generates a single function for a single endpoint.
 */
export const generateFunctions = (endpoint: EndpointPath, endpoints: EndpointPath[]): string[] => {
    switch (endpoint.path.type) {
        case SwaggerPathType.Count:
            return countFunction(endpoint, endpoints);
        case SwaggerPathType.Entity:
            return entityFunction(endpoint);
        case SwaggerPathType.Root:
            return rootFunction(endpoint);
        default:
            logger.errorLn(`Couldn't parse path type for ${endpoint.path.path}`);
    }

    return [];
};
