import {WeclappEndpoint, WeclappEndpointType} from '@utils/weclapp/parseEndpointPath';
import {camelCase} from 'change-case';

export const generateFunctionName = (endpoint: WeclappEndpoint) => {
    switch (endpoint.type) {
        case WeclappEndpointType.COUNT:
            return 'count';
        case WeclappEndpointType.ENTITY:
            return 'unique';
        case WeclappEndpointType.ROOT:
            return 'some';
        case WeclappEndpointType.SPECIAL_ROOT:
        case WeclappEndpointType.SPECIAL_ENTITY:
            return camelCase(
                endpoint.path
                    .replace(/.*\//g, '')
                    .replace(/[^\w]+/g, '-')
                + (endpoint.type === WeclappEndpointType.SPECIAL_ENTITY ? 'ById' : '')
            );
    }
};
