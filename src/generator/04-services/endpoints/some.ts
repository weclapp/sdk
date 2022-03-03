import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateParametersInterface} from '@generator/04-services/utils/generateParametersInterface';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {pascalCase} from 'change-case';

const functionName = 'some';

export const generateSomeEndpoint: ServiceFunctionGenerator = ({path, endpoint}): GeneratedServiceFunction => {

    // Required interface names
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;
    const entityParameters = `${interfaceName}_Parameters`;
    const entityReferences = `${entity}_References`;

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        generics: [`S extends QuerySelect<${entity}>`, `R extends QuerySelect<${entityReferences}>`],
        params: [`query?: SomeQuery<${entity}, ${entityParameters}, R, S>`],
        returns: `Promise<SomeQueryReturn<${entity}, ${entityReferences}, R, S>>`
    });

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        returns: `_${functionName}(cfg, '${endpoint.path}', query)`,
        params: ['query']
    });

    return {
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource},
        interfaces: [
            {
                name: entityParameters,
                source: generateParametersInterface(entityParameters, path.parameters)
            }
        ]
    };
};
