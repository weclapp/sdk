import {resolveResponseType} from '@enums/Target';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {insertPathPlaceholder} from '@generator/04-services/utils/insertPathPlaceholder';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {pascalCase} from 'change-case';

const functionName = 'remove';

export const generateRemoveEndpoint: ServiceFunctionGenerator = ({target, endpoint}): GeneratedServiceFunction => {
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        returns: `_${functionName}(cfg, \`${insertPathPlaceholder(endpoint.path, {id: '${id}'})}\`)`,
        params: ['id']
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: ['id: string'],
        returns: `${resolveResponseType(target)}<void>`
    });

    return {
        name: functionName,
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource}
    };
};