import {generateFunctionName} from '@generator/04-services/generateFunctionName';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {pascalCase} from 'change-case';

export const generateEntityEndpoint: ServiceFunctionGenerator = ({path, endpoint}): GeneratedServiceFunction => {
    const name = generateFunctionName(endpoint);
    const signature = `(id: string) => ${pascalCase(endpoint.entity)}`;
    const type = pascalCase(`${name}_${endpoint.entity}`);

    return {
        types: `type ${type} = ${signature};`,
        func: `const ${name}: ${type} = (id) => 0  as any;`
    };
};
