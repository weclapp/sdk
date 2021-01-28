import {Target} from '@enums/Target';
import {EndpointPath} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {FunctionList} from '@generator/library/utils/FunctionList';
import {injectParams, SwaggerPath} from '@generator/utils/parseSwaggerPath';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {pascalCase} from 'change-case';

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
 */
export const entityFunction = ({path, methods}: EndpointPath, target: Target): Functions => {
    const entityName = pascalCase(path.entity);
    const functions = new FunctionList();

    if (methods.get) {
        const returnType = resolveResponseType(methods.get);

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            functions.add(target, {
                code: {
                    description: `Returns the ${entityName} by it's unique identifier.`,
                    signature: `unique<Query extends EntityQuery<${returnType}>>(id: string, options?: Query)`,
                    returnType: `UniqueReturn<${returnType}, Query>`,
                    returnValue: `_unique<${returnType}, Query>('/${path.entity}', id, options)`
                }
            });
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.get) || 'unknown';

            functions.add(target, {
                code: {
                    description: 'Unknown special endpoint.',
                    signature: `${buildSpecialFunction(path)}(data: ${bodyType})`,
                    returnValue: 'Promise.resolve(null)',
                    returnType
                }
            });
        } else {
            logger.warnLn(`Didn't generate code for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const returnType = resolveResponseType(methods.post);

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            functions.add(target, {
                code: {
                    description: 'Unknown special endpoint.',
                    signature: `create(data: Create${entityName})`,
                    returnValue: 'Promise.resolve(null)',
                    returnType
                }
            });
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.post) || 'unknown';

            functions.add(target, {
                code: {
                    description: 'Unknown special endpoint.',
                    signature: `${buildSpecialFunction(path)}(data: ${bodyType})`,
                    returnValue: 'Promise.resolve(null)',
                    returnType,
                }
            });
        } else {
            logger.warnLn(`Didn't generate code for POST ${path.path}`);
        }
    }

    if (methods.put) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const returnType = resolveResponseType(methods.put);
            const bodyType = resolveRequestType(methods.put);

            // Update an entity
            functions.add(target, {
                code: {
                    description: `Updates a ${entityName}`,
                    signature: `update(id: string, data: Partial<${bodyType}>)`,
                    returnValue: `_update(\`${injectParams(path.path, {id: '${id}'})}\`, data)`,
                    returnType
                }
            });

            // Replace an entity
            functions.add(target, {
                code: {
                    description: `Replaces a ${entityName}`,
                    signature: `replace(id: string, data: ${bodyType})`,
                    returnValue: `_replace<${bodyType}>(\`${injectParams(path.path, {id: '${id}'})}\`, data)`,
                    returnType
                }
            });
        } else {
            logger.warnLn(`Didn't generate code for PUT ${path.path}`);
        }
    }

    if (methods.delete) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            functions.add(target, {
                code: {
                    description: `Deletes a ${entityName} by the given unique identifier.`,
                    signature: 'delete(id: string)',
                    returnValue: `_delete(\`${injectParams(path.path, {id: '${id}'})}\`)`,
                    returnType: 'void'
                }
            });
        } else {
            logger.warnLn(`Didn't generate code for DELETE ${path.path}`);
        }
    }

    return functions.getAll();
};
