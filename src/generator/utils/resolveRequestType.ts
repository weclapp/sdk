import {isReferenceObject, isRequestBodyObject} from '@generator/guards';
import {resolveDeclarationType} from '@generator/utils/resolveDeclarationType';
import {OpenAPIV3} from 'openapi-types';

/**
 * Tries to resolve the body-data type.
 * @param endpoint
 */
export const resolveRequestType = ({requestBody}: OpenAPIV3.OperationObject): string => {

    if (isReferenceObject(requestBody)) {
        return resolveDeclarationType(requestBody);
    } else if (isRequestBodyObject(requestBody)) {
        const schema = requestBody.content['application/json']?.schema;

        if (schema) {
            return resolveDeclarationType(schema);
        }
    }

    return 'unknown';
};
