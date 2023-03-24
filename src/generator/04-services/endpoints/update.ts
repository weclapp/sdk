import {resolveResponseType} from '@enums/Target';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateRequestBodyType} from '@generator/04-services/utils/generateRequestBodyType';
import {generateResponseBodyType} from '@generator/04-services/utils/generateResponseBodyType';
import {insertPathPlaceholder} from '@generator/04-services/utils/insertPathPlaceholder';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {pascalCase} from 'change-case';

const functionName = 'update';

export const generateUpdateEndpoint: ServiceFunctionGenerator = ({target, path, endpoint}): GeneratedServiceFunction => {
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        params: ['id: string', `data: DeepPartial<${generateRequestBodyType(path).toString()}>`, 'options?: UpdateQuery'],
        returns: `${resolveResponseType(target)}<${generateResponseBodyType(path).toString()}>`
    });

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        returns: `_${functionName}(cfg, \`${insertPathPlaceholder(endpoint.path, {id: '${id}'})}\`, data, options)`,
        params: ['id', 'data', 'options']
    });

    return {
        entity,
        name: functionName,
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource}
    };
};
