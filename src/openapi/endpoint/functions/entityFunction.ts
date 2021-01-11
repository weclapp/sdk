import {resolveResponseType} from '@openapi/utils/resolveResponseType';
import {tsBlockComment} from '@ts/comments';
import {SwaggerPath} from '@utils/parseSwaggerPath';
import {paramCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

const TOP_ID_REGEXP = /{\w+}$/;

/**
 * Generates endpoints for the entity endpoint e.g. /customer/id/:id
 * @param path
 * @param methods
 */
export const entityFunction = (path: SwaggerPath, methods: OpenAPIV3.PathItemObject): string[] | null => {
    const functions: string[] = [];
    const entityName = paramCase(path.entity);

    if (methods.get) {
        const returnType = resolveResponseType(methods.get);

        if (returnType) {

            // Check if it's a top-level, by-id endpoint
            if (TOP_ID_REGEXP.test(path.path)) {
                const comment = tsBlockComment(`Returns the ${entityName} by it's unique identifier.`);
                functions.push(`${comment}
async unique(id: number): Promise<${returnType}> {
    return Promise.reject();
}`);
            }
        }
    }

    return functions.length ? functions : null;
};
