import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateGenericFunctionName} from '@generator/04-services/utils/generateGenericFunctionName';
import {generateParametersType} from '@generator/04-services/utils/generateParametersType';
import {generateRequestBodyType} from '@generator/04-services/utils/generateRequestBodyType';
import {generateResponseBodyType} from '@generator/04-services/utils/generateResponseBodyType';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {generateInterface} from '@ts/generateInterface';
import {typeFallback} from '@utils/openapi/typeFallback';
import {pascalCase} from 'change-case';

export const generateGenericEndpoint = (suffix?: string): ServiceFunctionGenerator => ({method, path, endpoint}): GeneratedServiceFunction => {
    const functionName = generateGenericFunctionName(endpoint.path, suffix);
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;
    const entityQuery = `${interfaceName}_Query`;

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        params: ['id', 'query'],
        returns: `_generic(cfg, '${method}', \`${endpoint.path.replace('{id}', '${id}')}\`, query)`
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: ['id: string', `query: ${entityQuery}`],
        returns: `Promise<${typeFallback(generateResponseBodyType(path))}>`
    });

    return {
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource},
        interfaces: [
            {
                name: entityQuery,
                source: generateInterface(entityQuery, [
                    {required: true, name: 'params', type: generateParametersType(path)},
                    {required: true, name: 'body', type: generateRequestBodyType(path)}
                ])
            }
        ]
    };
};
