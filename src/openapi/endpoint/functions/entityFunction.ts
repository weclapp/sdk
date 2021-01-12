import {SwaggerPath} from '@openapi/utils/parseSwaggerPath';
import {resolveRequestType} from '@openapi/utils/resolveRequestType';
import {resolveResponseType} from '@openapi/utils/resolveResponseType';
import {tsFunction} from '@ts/functions';
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
                    async ${path.name}(data: ${bodyType}): Promise<${returnType}> {
                        return Promise.reject();
                    }
                `
            }));
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
                    async ${path.name}(data: ${bodyType}): Promise<${returnType}> {
                        return Promise.reject();
                    }
                `
            }));
        }
    }

    if (methods.put) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            functions.push(tsFunction({
                description: `Creates a new ${entityName}`,
                body: `
                    async update(data: Partial<${entityName}>): Promise<${entityName}> {
                        return Promise.reject();
                    }
                `
            }));
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
        }
    }

    return functions;
};
