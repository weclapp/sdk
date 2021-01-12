import {SwaggerPath} from '@generator/utils/parseSwaggerPath';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {tsFunction} from '@ts/functions';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

const TOP_ID_REGEXP = /{\w+}$/;

/**
 * Takes a parsed swagger path and returns a well-readable function name for this special endpoint.
 * @param path
 */
const buildSpecialFunction = (path: SwaggerPath): string => {
    return path.name ? path.params.length ? `${path.name}ById` : path.name : `__unknown${path.entity}`;
};

/**
 * Generates endpoints for the entity endpoint e.g. /customer/id/:id
 * @param path
 * @param methods
 */
export const entityFunction = (path: SwaggerPath, methods: OpenAPIV3.PathItemObject): string[] => {
    const functions: string[] = [];
    const entityName = pascalCase(path.entity);

    if (methods.get) {
        const returnType = resolveResponseType(methods.get);

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            functions.push(tsFunction({
                description: `Returns the ${entityName} by it's unique identifier.`,
                body: `
async unique(id: number): Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.get) || 'unknown';

            functions.push(tsFunction({
                description: 'Unknown special endpoint.',
                body: `
async ${buildSpecialFunction(path)}(data: ${bodyType}): Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const returnType = resolveResponseType(methods.post);

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            functions.push(tsFunction({
                description: 'Unknown special endpoint.',
                body: `
async create(data: Create${entityName}): Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.post) || 'unknown';

            functions.push(tsFunction({
                description: 'Unknown special endpoint.',
                body: `
async ${buildSpecialFunction(path)}(data: ${bodyType}): Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for POST ${path.path}`);
        }
    }

    if (methods.put) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const returnType = resolveResponseType(methods.put);
            const bodyType = resolveRequestType(methods.put);

            functions.push(tsFunction({
                description: `Creates a new ${entityName}`,
                body: `
async update(data: Partial<${bodyType}>): Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for PUT ${path.path}`);
        }
    }

    if (methods.delete) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            functions.push(tsFunction({
                description: `Deletes a ${entityName} by the given unique identifier.`,
                body: `
async delete(id: number): Promise<void> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for DELETE ${path.path}`);
        }
    }

    return functions;
};
