import {EndpointPath} from '@generator/library';
import {countFunction} from '@generator/library/functions/countFunction';
import {entityFunction} from '@generator/library/functions/entityFunction';
import {rootFunction} from '@generator/library/functions/rootFunction';
import {SwaggerPathType} from '@generator/utils/parseSwaggerPath';
import {logger} from '@logger';

/**
 * Generates a single function for a single endpoint.
 * @param path
 * @param methods
 */
export const generateFunctions = ({path, methods}: EndpointPath): string[] => {
    switch (path.type) {
        case SwaggerPathType.Count:
            return countFunction(path);
        case SwaggerPathType.Entity:
            return entityFunction(path, methods);
        case SwaggerPathType.Root:
            return rootFunction(path, methods);
        default:
            logger.errorLn(`Couldn't parse path type for ${path.path}`);
    }

    return [];
};

