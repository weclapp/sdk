import {generateBodyType} from '@generator/04-services/utils/generateBodyType';
import {AnyType, createRawType} from '@utils/openapi/convertToTypeScriptType';
import {OpenAPIV3} from 'openapi-types';

export const generateResponseBodyType = (operation: OpenAPIV3.OperationObject): AnyType => {
    return generateBodyType(
        Object.entries(operation.responses)
            .filter(v => v[0].startsWith('2'))[0]?.[1]
    ) ?? createRawType('void');
};
