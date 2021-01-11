import {countFunction} from '@openapi/endpoint/functions/countFunction';
import {entityFunction} from '@openapi/endpoint/functions/entityFunction';
import {rootFunction} from '@openapi/endpoint/functions/rootFunction';
import {EndpointPath} from '@openapi/endpoint/index';
import {SwaggerPathType} from '@utils/parseSwaggerPath';

/**
 * Generates a single function for a single endpoint.
 * @param path
 * @param methods
 */
export const generateEndpointFunctions = ({path, methods}: EndpointPath): string[] | null => {
    switch (path.type) {
        case SwaggerPathType.Count:
            return countFunction(path);
        case SwaggerPathType.Entity:
            return entityFunction(path, methods);
        case SwaggerPathType.Root:
            return rootFunction(path, methods);
    }

    return null;
};

