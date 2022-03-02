import {generateFunctionName} from '@generator/04-services/generateFunctionName';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';

export const generateSpecialRootEndpoint: ServiceFunctionGenerator = ({path, endpoint}): GeneratedServiceFunction => {
    return {
        types: ``,
        func: `const ${generateFunctionName(endpoint)} = () => 0;`
    };
};

