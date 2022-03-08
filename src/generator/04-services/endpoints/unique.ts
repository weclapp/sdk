import {resolveResponseType} from '@enums/Target';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {pascalCase} from 'change-case';

const functionName = 'unique';

export const generateUniqueEndpoint: ServiceFunctionGenerator = ({target, endpoint}): GeneratedServiceFunction => {
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        params: ['id'],
        returns: `_${functionName}(cfg, \`${endpoint.path.replace('{id}', '${id}')}\`)`
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: ['id: string'],
        returns: `${resolveResponseType(target)}<${entity}>`
    });

    return {
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource}
    };
};
