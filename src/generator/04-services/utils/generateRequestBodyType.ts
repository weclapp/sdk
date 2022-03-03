import {generateTypeScriptType} from '@utils/openapi/generateTypeScriptType';
import {isReferenceObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const generateRequestBodyType = ({requestBody}: OpenAPIV3.OperationObject): string | undefined => {
    if (isReferenceObject(requestBody)) {
        return generateTypeScriptType(requestBody);
    }

    const schema = Object.values(requestBody?.content ?? {})?.[0]?.schema;
    return schema ? generateTypeScriptType(schema) : undefined;
};
