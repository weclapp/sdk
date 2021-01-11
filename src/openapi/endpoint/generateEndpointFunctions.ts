import {EndpointPath} from '@openapi/endpoint/index';
import {tsBlockComment} from '@ts/comments';
import {errorLn} from '@utils/log';
import {SwaggerPath, SwaggerPathType} from '@utils/parseSwaggerPath';
import {paramCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';
import {resolveBodyParameter} from '../utils/resolveBodyParameter';
import {resolveResponseType} from '../utils/resolveResponseType';

const createCountFunction = (path: SwaggerPath): string[] => {
    const entityName = paramCase(path.entity);

    const comment = tsBlockComment(`Counts the amount of ${entityName}s entities which match the given filter.`);
    return [`${comment}
async count(): Promise<number> {
    return Promise.resolve(4);
}`];
};

const createEntityFunction = (path: SwaggerPath, methods: OpenAPIV3.PathItemObject): string[] | null => {
    return null;
};

const createRootFunction = (path: SwaggerPath, methods: OpenAPIV3.PathItemObject): string[] | null => {
    const functions: string[] = [];

    if (methods.get) {
        const entityName = resolveResponseType(methods.get);

        if (entityName) {
            const comment = tsBlockComment(`Finds all ${entityName} entities which match the given filter.`);
            functions.push(`${comment}
async some(filter: Partial<${entityName}>): Promise<Customer[]> {
    return Promise.resolve([]);
}`);
        } else {
            errorLn(`Couldn't resolve response type for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const bodyType = resolveBodyParameter(methods.post);
        const returnType = resolveResponseType(methods.post);

        if (bodyType && returnType) {
            const comment = tsBlockComment(`Creates a new ${returnType} with the given data.\nReturns the newly created ${returnType}.`);
            functions.push(`${comment}
async create(data: Create${bodyType}): Promise<${returnType}> {
    return Promise.reject('Not implemented');
}`);
        } else {
            // TODO: Is response required?
            errorLn(`Couldn't resolve response type for POST ${path.path}`);
        }
    }

    return functions;
};

/**
 * Generates a single function for a single endpoint.
 * @param path
 * @param methods
 */
export const generateEndpointFunctions = ({path, methods}: EndpointPath): string[] | null => {
    switch (path.type) {
        case SwaggerPathType.Count:
            return createCountFunction(path);
        case SwaggerPathType.Entity:
            return createEntityFunction(path, methods);
        case SwaggerPathType.Root:
            return createRootFunction(path, methods);
    }

    return null;
};

