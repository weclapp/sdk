import {Target} from '@enums/Target';
import {EndpointPath} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {FunctionList} from '@generator/library/utils/FunctionList';
import {injectParams, SwaggerPath} from '@generator/utils/parseSwaggerPath';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {camelCase, pascalCase} from 'change-case';

const BASE_SPECIAL_REGEXP = /\w+$/;
const TOP_ID_REGEXP = /{\w+}$/;
const ID_SPECIAL_REGEXP = /(?<={\w+}\/)\w+$/;

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
                    example: `const ${camelCase(entityName)} = await sdk.${camelCase(entityName)}.unique('7362');`,
                    signature: `unique<Query extends EntityQuery<${returnType}>>(id: string, options?: Query)`,
                    returnType: `UniqueReturn<${returnType}, Query>`,
                    returnValue: `_unique<${returnType}, Query>('/${path.entity}', id, options)`
                }
            });
        } else if (ID_SPECIAL_REGEXP.test(path.path)) {
            functions.add(target, {
                code: {
                    description: methods.get.description,
                    parameters: [
                        ['id', `Unique ID for the ${entityName} to fetch.`],
                        ['options', `Optional query options regarding the ${entityName} special function.`]
                    ],
                    example: `await sdk.${camelCase(entityName)}.${buildSpecialFunction(path)}('9662', {...});`,
                    signature: `${buildSpecialFunction(path)}<Query extends Record<string, unknown>>(id: string, options?: Query)`,
                    returnValue: `_specialEndpointGet<${returnType}>(\`${injectParams(path.path, {id: '${id}'})}\`, options)`,
                    returnType
                }
            });
        } else if (BASE_SPECIAL_REGEXP.test(path.path)) {
            functions.add(target, {
                code: {
                    description: methods.get.description,
                    parameters: [
                        ['options', `Optional query options regarding the ${entityName} special function.`]
                    ],
                    example: `await sdk.${camelCase(entityName)}.${buildSpecialFunction(path)}({...});`,
                    signature: `${buildSpecialFunction(path)}<Query extends Record<string, unknown>>(options?: Query)`,
                    returnValue: `_specialEndpointGet<${returnType}>('${path.path}', options)`,
                    returnType
                }
            });
        } else {
            logger.warnLn(`Didn't generate code for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const returnType = resolveResponseType(methods.post);
        const bodyType = resolveRequestType(methods.post);

        if (ID_SPECIAL_REGEXP.test(path.path)) {
            functions.add(target, {
                code: {
                    description: methods.post.description,
                    parameters: [
                        ['id', `Unique ID for the ${entityName} to fetch.`],
                        ['data', `Request body of the ${entityName} special function.`],
                        ['options', `Optional query options regarding the ${entityName} special function.`]
                    ],
                    example: `await sdk.${camelCase(entityName)}.${buildSpecialFunction(path)}('9662', {...});`,
                    signature: `${buildSpecialFunction(path)}<Query extends Record<string, unknown>>(id: string, data: ${bodyType}, options?: Query)`,
                    returnValue: `_specialEndpointPost<${returnType}>(\`${injectParams(path.path, {id: '${id}'})}\`, data, options)`,
                    returnType
                }
            });
        } else if (BASE_SPECIAL_REGEXP.test(path.path)) {
            functions.add(target, {
                code: {
                    description: methods.post.description,
                    parameters: [
                        ['data', `Request body of the ${entityName} special function.`],
                        ['options', `Optional query options regarding the ${entityName} special function.`]
                    ],
                    example: `await sdk.${camelCase(entityName)}.${buildSpecialFunction(path)}({...});`,
                    signature: `${buildSpecialFunction(path)}<Query extends Record<string, unknown>>(data: ${bodyType}, options?: Query)`,
                    returnValue: `_specialEndpointPost<${returnType}>('${path.path}', data, options)`,
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
                    example: `await sdk.${camelCase(entityName)}.update('9662', {...});`,
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
                    example: `await sdk.${camelCase(entityName)}.replace({...});`,
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
                    example: `await sdk.${camelCase(entityName)}.delete('1356');`,
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
