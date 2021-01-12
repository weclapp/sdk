import {logger} from '@logger';
import {SwaggerPath} from '@openapi/utils/parseSwaggerPath';
import {resolveRequestType} from '@openapi/utils/resolveRequestType';
import {guessResponseEntity, resolveResponseType} from '@openapi/utils/resolveResponseType';
import {tsFunction} from '@ts/functions';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

/**
 * Generates functions for the root level of an endpoint e.g. /customer
 * @param path
 * @param methods
 */
export const rootFunction = (path: SwaggerPath, methods: OpenAPIV3.PathItemObject): string[] => {
    const functions: string[] = [];
    const entityName = pascalCase(path.entity);

    if (methods.get) {
        const response = resolveResponseType(methods.get);

        if (response) {
            functions.push(tsFunction({
                description: `Finds all ${entityName} entities which match the given filter.`,
                body: `
async some(filter: Partial<${guessResponseEntity(response)}>): Promise<${response}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.errorLn(`Couldn't resolve response type for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const bodyType = resolveRequestType(methods.post);

        if (bodyType) {
            const returnType = resolveResponseType(methods.post);

            functions.push(tsFunction({
                description: `Creates a new ${entityName} with the given data.\nReturns the newly created ${entityName}.`,
                body: `
async create(data: Create${bodyType}): Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.errorLn(`Couldn't resolve body type for POST ${path.path}`);
        }
    }

    return functions;
};
