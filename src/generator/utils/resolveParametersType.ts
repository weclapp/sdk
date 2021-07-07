import {isParameterObject} from '@generator/guards';
import {resolveDeclarationType} from '@generator/utils/resolveDeclarationType';
import {OpenAPIV3} from 'openapi-types';
import ParameterObject = OpenAPIV3.ParameterObject;
import {tsInterfaceProperties, TSInterfaceProperty} from '@ts/interfaces';

/**
 * Tries to resolve the parameter type.
 * @param endpoint
 */
export const resolveRequiredParameters = ({parameters}: OpenAPIV3.OperationObject): string | null => {
    const requiredQueryParams: TSInterfaceProperty[] = [];
    for (const parameter of parameters ?? []) {
        if (isParameterObject(parameter) && isRequiredQueryParam(parameter) && parameter.schema) {
            requiredQueryParams.push({
                name: parameter.name,
                value: resolveDeclarationType(parameter.schema),
                required: !!parameter.required
            });
        }
    }

    return requiredQueryParams.length ? `{${tsInterfaceProperties(requiredQueryParams)}}` : null;
};

const isRequiredQueryParam = (param: ParameterObject): boolean => {
    return param.in === 'query' && !!param.required;
};
