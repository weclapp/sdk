import {resolveResponseType} from '@enums/Target';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {pascalCase} from 'change-case';

const functionName = 'count';

export const generateCountEndpoint: ServiceFunctionGenerator = ({target, endpoint}): GeneratedServiceFunction => {
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        returns: `_${functionName}(cfg, '${endpoint.path}', query)`,
        params: ['query']
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: [`query?: QueryFilter<${entity}>`],
        returns: `${resolveResponseType(target)}<number>`
    });

    return {
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource}
    };
};
