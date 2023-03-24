import {isNodeTarget, resolveResponseType, Target} from '@enums/Target';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateGenericFunctionName} from '@generator/04-services/utils/generateGenericFunctionName';
import {generateRequestBodyType} from '@generator/04-services/utils/generateRequestBodyType';
import {generateResponseBodyType} from '@generator/04-services/utils/generateResponseBodyType';
import {insertPathPlaceholder} from '@generator/04-services/utils/insertPathPlaceholder';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {generateInterfaceFromObject} from '@ts/generateInterface';
import {generateString} from '@ts/generateString';
import {convertParametersToSchema} from '@utils/openapi/convertParametersToSchema';
import {AnyType, convertToTypeScriptType, createObjectType, createRawType} from '@utils/openapi/convertToTypeScriptType';
import {pascalCase} from 'change-case';

const wrapBody = (type: AnyType, target: Target): AnyType => {
    return type.toString() === 'binary' ?
        createRawType(isNodeTarget(target) ? 'BodyInit' : 'Blob') :
        type; // node-fetch returns a Blob as well
};

export const generateGenericEndpoint = (suffix?: string): ServiceFunctionGenerator => ({target, method, path, endpoint}): GeneratedServiceFunction => {
    const functionName = generateGenericFunctionName(endpoint.path, suffix, method);
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;
    const entityQuery = `${interfaceName}_Query`;
    const hasId = endpoint.path.includes('{id}');

    const params = createObjectType({
        params: convertToTypeScriptType(convertParametersToSchema(path.parameters)),
        body: method === 'get' ? undefined : wrapBody(generateRequestBodyType(path), target)
    });

    const responseBody = generateResponseBodyType(path);
    const forceBlobResponse = String(responseBody.toString() === 'binary');

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        params: hasId ? ['id', 'query'] : ['query'],
        returns: `_generic(cfg, ${generateString(method.toUpperCase())}, \`${insertPathPlaceholder(endpoint.path, {id: '${id}'})}\`, query, ${forceBlobResponse})`
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: [...(hasId ? ['id: string'] : []), `query${params.isFullyOptional() ? '?' : ''}: ${entityQuery}`],
        returns: `${resolveResponseType(target)}<${wrapBody(responseBody, target).toString()}>`
    });

    return {
        entity,
        name: functionName,
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource},
        interfaces: [
            {
                name: entityQuery,
                source: generateInterfaceFromObject(entityQuery, params, true)
            }
        ]
    };
};
