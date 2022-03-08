import {resolveResponseType} from '@enums/Target';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {pascalCase} from 'change-case';

const functionName = 'update';

export const generateUpdateEndpoint: ServiceFunctionGenerator = ({target, endpoint}): GeneratedServiceFunction => {

    // Required interface names
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: [`id: string, data: Partial<${entity}>`],
        returns: `${resolveResponseType(target)}<${entity}>`
    });

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        returns: `_${functionName}(cfg, \`${endpoint.path.replace('{id}', '${id}')}\`, data)`,
        params: ['id', 'data']
    });

    return {
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource}
    };
};
