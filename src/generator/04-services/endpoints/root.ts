import {generateFunctionName} from '@generator/04-services/generateFunctionName';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {pascalCase} from 'change-case';

export const generateRootEndpoint: ServiceFunctionGenerator = ({path, endpoint}): GeneratedServiceFunction => {
    const name = generateFunctionName(endpoint);
    const signature = `(v: QueryFilter<${pascalCase(endpoint.entity)}>) => ${pascalCase(endpoint.entity)}`;
    const type = pascalCase(`${name}_${endpoint.entity}`);

    return {
        types: `type ${type} = ${signature};`,
        func: `const ${name}: ${type} = (query) => 0 as any;`
    };
};
