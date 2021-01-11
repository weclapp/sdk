import {errorLn} from '@utils/log';
import {parseSwaggerPath} from '@utils/parseSwaggerPath';
import {OpenAPIV3} from 'openapi-types';
import {EndpointMap, EndpointPath} from './index';

/**
 * Groups endpoints by their entity.
 * @param paths
 */
export const groupEndpoints = (paths: OpenAPIV3.PathsObject): EndpointMap => {
    const endpoints: EndpointMap = new Map<string, EndpointPath[]>();

    for (const [rawPath, methods] of Object.entries(paths)) {
        if (methods) {
            const path = parseSwaggerPath(rawPath);

            if (!path) {
                errorLn(`Couldn't parse path: "${rawPath}"`);
                continue;
            }

            const entry = {methods, path};
            const existingGroup = endpoints.get(path.entity);
            if (existingGroup) {
                existingGroup.push(entry);
            } else {
                endpoints.set(path.entity, [entry]);
            }
        }
    }

    return endpoints;
};

