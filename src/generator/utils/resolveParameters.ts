import {isParameterObject} from '@generator/guards';
import {resolveDeclarationType} from '@generator/utils/resolveDeclarationType';
import {OpenAPIV3} from 'openapi-types';
import {tsInterfaceProperties, TSInterfaceProperty} from '@ts/interfaces';

const EXCLUDED_PROPERTIES = ['page', 'pageSize', 'sort', 'properties'];

/**
 * Tries to resolve the parameter type.
 * @param endpoint
 */
export const resolveParameters = ({parameters}: OpenAPIV3.OperationObject): TSInterfaceProperty[] | null => {
    const queryParams: TSInterfaceProperty[] = [];
    for (const parameter of parameters ?? []) {
        if (isParameterObject(parameter) &&
          parameter.in === 'query' &&
          !EXCLUDED_PROPERTIES.includes(parameter.name) &&
          parameter.schema) {
            queryParams.push({
                name: parameter.name,
                value: resolveDeclarationType(parameter.schema),
                required: !!parameter.required
            });
        }
    }

    return queryParams.length ? queryParams : null;
};

export const serializeParameters = (params: TSInterfaceProperty[] | null): string | null => {
    return params?.length ? `{${tsInterfaceProperties(params)}}` : null;
};
