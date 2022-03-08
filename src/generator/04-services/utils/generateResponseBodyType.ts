import {CONSTANTS} from '@/src/constants';
import {convertToTypeScriptType} from '@utils/openapi/convertToTypeScriptType';
import {isReferenceObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const generateResponseBodyType = ({responses}: OpenAPIV3.OperationObject): string => {
    const body = responses['200'];

    if (isReferenceObject(body)) {
        return convertToTypeScriptType(body).toString();
    }

    const schema = Object.values(body?.content ?? {})?.[0]?.schema;
    return schema ? convertToTypeScriptType(schema).toString() : CONSTANTS.PLACEHOLDER_MISSING_TYPE;
};
