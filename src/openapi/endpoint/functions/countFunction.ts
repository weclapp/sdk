import {SwaggerPath} from '@openapi/utils/parseSwaggerPath';
import {tsFunction} from '@ts/functions';
import {paramCase} from 'change-case';

/**
 * Special count-entities endpoint.
 * @param path
 */
export const countFunction = (path: SwaggerPath): string[] => {
    const entityName = paramCase(path.entity);

    return [
        tsFunction({
            description: `Counts the amount of ${entityName}s entities which match the given filter.`,
            body: `
async count(): Promise<number> {
    return makeRequest('${path.path}').then(unwrap);
}
            `
        })
    ];
};
