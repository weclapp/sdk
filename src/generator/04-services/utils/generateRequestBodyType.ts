import {AnyType, convertToTypeScriptType} from '@utils/openapi/convertToTypeScriptType';
import {isReferenceObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const generateRequestBodyType = ({requestBody}: OpenAPIV3.OperationObject): AnyType | undefined => {
    if (isReferenceObject(requestBody)) {
        return convertToTypeScriptType(requestBody);
    }

    const schema = Object.values(requestBody?.content ?? {})?.[0]?.schema;
    return schema ? convertToTypeScriptType(schema) : undefined;
};
