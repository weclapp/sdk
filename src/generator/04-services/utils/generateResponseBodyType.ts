import {generateTypeScriptType} from '@utils/openapi/generateTypeScriptType';
import {isReferenceObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const generateResponseBodyType = ({responses}: OpenAPIV3.OperationObject): string | undefined => {
    const body = responses['200'];

    if (isReferenceObject(body)) {
        return generateTypeScriptType(body);
    }

    const schema = Object.values(body?.content ?? {})?.[0]?.schema;
    return schema ? generateTypeScriptType(schema) : undefined;
};
