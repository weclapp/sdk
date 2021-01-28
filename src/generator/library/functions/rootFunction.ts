import {Target} from '@enums/Target';
import {EndpointPath} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {FunctionList} from '@generator/library/utils/FunctionList';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {guessResponseEntity, resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {pascalCase} from 'change-case';

/**
 * Generates functions for the root level of an endpoint e.g. /customer
 */
export const rootFunction = ({path, methods}: EndpointPath, target: Target): Functions => {
    const entityName = pascalCase(path.entity);
    const functions = new FunctionList();

    if (methods.get) {
        const response = resolveResponseType(methods.get);

        if (response) {
            const returnType = guessResponseEntity(response);

            // Fetch list
            functions.add(target, {
                docs: {
                    description: `some(options?: ListQuery<${returnType}>)`
                },
                code: {
                    description: `Finds all ${entityName} entities which match the given filter.`,
                    signature: `some<Query extends ListQuery<${returnType}>>(options?: Query)`,
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
                    signature: `first<Query extends FirstQuery<${returnType}>>(options?: Query)`,
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
                    signature: `create(data: Create<${bodyType}>)`
                },
                code: {
                    description: `Creates a new ${entityName} with the given data.\nReturns the newly created ${entityName}.`,
                    signature: `create(data: Create${bodyType})`,
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
