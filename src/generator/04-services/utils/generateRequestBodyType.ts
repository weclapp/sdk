import {generateBodyType} from '@generator/04-services/utils/generateBodyType';
import {AnyType} from '@utils/openapi/convertToTypeScriptType';
import {OpenAPIV3} from 'openapi-types';

export const generateRequestBodyType = ({requestBody}: OpenAPIV3.OperationObject): AnyType | undefined => {
    return generateBodyType(requestBody);
};
