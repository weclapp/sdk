import {SwaggerPath} from '@openapi/utils/parseSwaggerPath';
import {resolveRequestType} from '@openapi/utils/resolveRequestType';
import {resolveResponseType} from '@openapi/utils/resolveResponseType';
import {tsBlockComment} from '@ts/comments';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

const TOP_ID_REGEXP = /{\w+}$/;

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
            const comment = tsBlockComment(`Returns the ${entityName} by it's unique identifier.`);
            functions.push(`${comment}
async unique(id: number): Promise<${returnType}> {
    return Promise.reject();
}`);
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.get) || 'unknown';

            const comment = tsBlockComment('Unknown special endpoint.');
            functions.push(`${comment}
async ${path.name}(data: ${bodyType}): Promise<${returnType}> {
    return Promise.reject();
}`);
        }
    }

    if (methods.post) {
        const returnType = resolveResponseType(methods.post);

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const comment = tsBlockComment('Unknown special endpoint.');
            functions.push(`${comment}
async create(data: Create${entityName}): Promise<${returnType}> {
    return Promise.reject();
}`);
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.post) || 'unknown';

            const comment = tsBlockComment('Unknown special endpoint.');
            functions.push(`${comment}
async ${path.name}(data: ${bodyType}): Promise<${returnType}> {
    return Promise.reject();
}`);
        }
    }

    if (methods.put) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const comment = tsBlockComment(`Creates a new ${entityName}`);
            functions.push(`${comment}
async update(data: Partial<${entityName}>): Promise<${entityName}> {
    return Promise.reject();
}`);

        }
    }

    if (methods.delete) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const comment = tsBlockComment(`Deletes a ${entityName} by the given unique identifier.`);
            functions.push(`${comment}
async delete(id: number): Promise<void> {
    return Promise.reject();
}`);
        }
    }

    return functions;
};
