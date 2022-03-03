import {generateTypeScriptType} from '@utils/openapi/generateTypeScriptType';
import {isReferenceObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const resolveResponseType = (opt: OpenAPIV3.OperationObject): string | undefined => {
    const response = opt.responses?.['200'];

    if (isReferenceObject(response)) {
        return generateTypeScriptType(response);
    }

    const schema = response?.content?.['application/json']?.schema;
    return schema ? generateTypeScriptType(schema) : undefined;
};
