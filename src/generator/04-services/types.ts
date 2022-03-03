import {WeclappEndpoint} from '@utils/weclapp/parseEndpointPath';
import {OpenAPIV3} from 'openapi-types';

export interface Export {
    name: string;
    source: string;
}

export interface GeneratedServiceFunction {
    type: Export;
    func: Export;
    interfaces?: Export[];
}

export interface ServiceFunctionGeneratorConfig {
    method: string;
    path: OpenAPIV3.OperationObject;
    endpoint: WeclappEndpoint;
}

export type ServiceFunctionGenerator = (v: ServiceFunctionGeneratorConfig) => GeneratedServiceFunction;
