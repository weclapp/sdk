import {resolveBodyParameter} from '@openapi/utils/resolveBodyParameter';
import {resolveResponseType} from '@openapi/utils/resolveResponseType';
import {tsBlockComment} from '@ts/comments';
import {logger} from '@logger';
import {SwaggerPath} from '@utils/parseSwaggerPath';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

/**
 * Generates functions for the root level of an endpoint e.g. /customer
 * @param path
 * @param methods
 */
export const rootFunction = (path: SwaggerPath, methods: OpenAPIV3.PathItemObject): string[] | null => {
    const functions: string[] = [];
    const entityName = pascalCase(path.entity);

    if (methods.get) {
        const response = resolveResponseType(methods.get);

        if (response) {
            const comment = tsBlockComment(`Finds all ${entityName} entities which match the given filter.`);
            functions.push(`${comment}
async some(filter: Partial<${entityName}>): Promise<${response}> {
    return Promise.reject();
}`);
        } else {
            logger.errorLn(`Couldn't resolve response type for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const bodyType = resolveBodyParameter(methods.post);
        const returnType = resolveResponseType(methods.post);

        if (bodyType && returnType) {
            const comment = tsBlockComment(`Creates a new ${entityName} with the given data.\nReturns the newly created ${entityName}.`);
            functions.push(`${comment}
async create(data: Create${bodyType}): Promise<${returnType}> {
    return Promise.reject();
}`);
        } else {
            logger.errorLn(`Couldn't resolve response type for POST ${path.path}`);
        }
    }

    return functions.length ? functions : null;
};
