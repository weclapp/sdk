import {Target} from '@enums/Target';
import {EndpointPath} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {FunctionList} from '@generator/library/utils/FunctionList';
import {injectParams, SwaggerPath} from '@generator/utils/parseSwaggerPath';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {pascalCase, camelCase} from 'change-case';

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
                docs: {
                    signature: `unique(id: string, options?: EntityQuery<${returnType}>)`
                },
                code: {
                    description: `Returns the ${entityName} by it's unique identifier.`,
                    parameters: [
                        ['id', `Unique ID for the ${entityName} to fetch.`],
                        ['options', `Optional query options to fetch a ${entityName}.`]
                    ],
                    example: `const ${camelCase(entityName)} = await sdk.${entityName}.unique('7362');`,
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
                    returnType
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
                    description: `Updates a ${entityName}.`,
                    parameters: [
                        ['id', `Unique ID for the ${entityName} to update.`],
                        ['data', `Partial data which should be used to update the ${entityName}.`]
                    ],
                    example: `await sdk.${entityName}.update('9662', {...});`,
                    signature: `update(id: string, data: Partial<${bodyType}>)`,
                    returnValue: `_update(\`${injectParams(path.path, {id: '${id}'})}\`, data)`,
                    returnType
                }
            });

            // Replace an entity
            functions.add(target, {
                code: {
                    description: `Replaces a ${entityName}.`,
                    parameters: [
                        ['data', `${entityName} object which should replace the one given by the id.`]
                    ],
                    example: `await sdk.${entityName}.replace({...});`,
                    signature: `replace(data: ${bodyType})`,
                    returnValue: `_replace<${bodyType}>(\`${injectParams(path.path, {id: '${data.id as string}'})}\`, data)`,
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
                    parameters: [['id', `Unique ID for the ${entityName} to delete.`]],
                    example: `await sdk.${entityName}.delete('1356');`,
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
