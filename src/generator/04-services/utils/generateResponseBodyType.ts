import {CONSTANTS} from '@/src/constants';
import {AnyType, convertToTypeScriptType, createSimpleType, createTupleType} from '@utils/openapi/convertToTypeScriptType';
import {isReferenceObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const generateResponseBodyType = (operation: OpenAPIV3.OperationObject): AnyType => {
    const body = operation.responses['200'];

    if (isReferenceObject(body)) {
        return convertToTypeScriptType(body);
    }

    const types: AnyType[] = [];
    for (const {schema} of Object.values(body.content ?? {})) {
        if (schema) {
            types.push(convertToTypeScriptType(schema));
        }
    }

    return types.length ? createTupleType(types) : createSimpleType(CONSTANTS.PLACEHOLDER_MISSING_TYPE);
};
