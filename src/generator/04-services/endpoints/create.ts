import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {pascalCase} from 'change-case';

const functionName = 'create';

export const generateCreateEndpoint: ServiceFunctionGenerator = ({endpoint}): GeneratedServiceFunction => {
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        returns: `_${functionName}(cfg, '${endpoint.path}', data)`,
        params: ['data']
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: [`data: ${entity}`],
        returns: `Promise<${entity}>`
    });

    return {
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource}
    };
};
