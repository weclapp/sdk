import {Target} from '@enums/Target';
import {EndpointPath} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {FunctionList} from '@generator/library/utils/FunctionList';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {guessResponseEntity, resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {pluralize} from '@utils/pluralize';
import {camelCase, pascalCase} from 'change-case';
import {resolveParameters, serializeParameters} from '@generator/utils/resolveParameters';

/**
 * Generates functions for the root level of an endpoint e.g. /customer
 */
export const rootFunction = ({path, methods}: EndpointPath, target: Target): Functions => {
    const entityName = pascalCase(path.entity);
    const functions = new FunctionList();

    if (methods.get) {
        const response = resolveResponseType(methods.get);
        const parameters = resolveParameters(methods.get);
        const serializedParameters = serializeParameters(parameters);

        if (response) {
            const returnType = guessResponseEntity(response);
            const someSignature = parameters?.some(v => v.required) ?
              `some<Query extends ListQueryRequired<${returnType}, ${serializedParameters ?? 'Record<string, unknown>'}>>(options: Query)` :
              `some<Query extends Partial<ListQueryRequired<${returnType}${serializedParameters ? ', ' + serializedParameters : ''}>>>(options?: Query)`;
            const firstSignature = parameters?.some(v => v.required) ?
              `first<Query extends FirstQueryRequired<${returnType}, ${serializedParameters ?? 'Record<string, unknown>'}>>(options: Query)` :
              `first<Query extends Partial<FirstQueryRequired<${returnType}${serializedParameters ? ', ' + serializedParameters : ''}>>>(options?: Query)`;


            // Fetch list
            functions.add(target, {
                docs: {
                    description: `some(options?: ListQuery<${returnType}>)`
                },
                code: {
                    description: `Finds all ${entityName} entities which match the given filter.`,
                    parameters: [['options', `Options for how the ${entityName} should be queried.`]],
                    example: `const ${pluralize(camelCase(entityName))} = await sdk.${camelCase(entityName)}.some();`,
                    signature: someSignature,
                    returnType: `SomeReturn<${returnType}, Query>`,
                    returnValue: `_some<${returnType}, Query>('${path.path}', options)`
                }
            });

            // Fetch just the first one in the list
            functions.add(target, {
                docs: {
                    signature: `first(options?: FirstQuery<${returnType}>)`
                },
                code: {
                    description: `Fetches the first ${entityName} it can find. Ignores all the other results`,
                    parameters: [['options', 'Optional filters.']],
                    example: `const first${entityName} = await sdk.${camelCase(entityName)}.first();`,
                    signature: firstSignature,
                    returnType: `UniqueReturn<${returnType}, Query>`,
                    returnValue: `_first<${returnType}, Query>('${path.path}', options)`
                }
            });
        } else {
            logger.errorLn(`Couldn't resolve response type for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const bodyType = resolveRequestType(methods.post);

        if (bodyType) {
            const returnType = resolveResponseType(methods.post);

            functions.add(target, {
                docs: {
                    signature: `create(data: Required<${bodyType}>)`
                },
                code: {
                    description: `Creates a new ${entityName} with the given data.\nReturns the newly created ${entityName}.`,
                    parameters: [['data', `Data to create a ${bodyType}`]],
                    example: `const new${entityName} = await sdk.${camelCase(entityName)}.create({...});`,
                    signature: `create(data: ${bodyType})`,
                    returnValue: `_create('${path.path}', data)`,
                    returnType
                }
            });
        } else {
            logger.warnLn(`Couldn't resolve body type for POST ${path.path}`);
        }
    }

    methods.delete && logger.warnLn(`Didn't generate code for POST ${path.path}`);
    methods.put && logger.warnLn(`Didn't generate code for POST ${path.path}`);

    return functions.getAll();
};
