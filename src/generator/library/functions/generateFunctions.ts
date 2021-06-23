import {Target} from '@enums/Target';
import {EndpointPath, StatsEntityFunction} from '@generator/library';
import {countFunction} from '@generator/library/functions/countFunction';
import {entityFunction} from '@generator/library/functions/entityFunction';
import {rootFunction} from '@generator/library/functions/rootFunction';
import {SwaggerPathType} from '@generator/utils/parseSwaggerPath';
import {logger} from '@logger';

export interface Functions {
    sources: string[];
    stats: StatsEntityFunction[];
}

/**
 * Generates a single function for a single endpoint.
 */
export const generateFunctions = (endpoint: EndpointPath, endpoints: EndpointPath[], target: Target): Functions | null => {
    switch (endpoint.path.type) {
        case SwaggerPathType.Count:
            return countFunction(endpoint, endpoints, target);
        case SwaggerPathType.Entity:
            return entityFunction(endpoint, target);
        case SwaggerPathType.Root:
            return rootFunction(endpoint, target);
        default:
            logger.errorLn(`Couldn't parse path type for ${endpoint.path.path}`);
    }

    return null;
};

