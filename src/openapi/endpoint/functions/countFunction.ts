import {tsBlockComment} from '@ts/comments';
import {SwaggerPath} from '@utils/parseSwaggerPath';
import {paramCase} from 'change-case';

/**
 * Special count-entities endpoint.
 * @param path
 */
export const countFunction = (path: SwaggerPath): string[] => {
    const entityName = paramCase(path.entity);

    const comment = tsBlockComment(`Counts the amount of ${entityName}s entities which match the given filter.`);
    return [`${comment}
async count(): Promise<number> {
    return Promise.reject();
}`];
};
