import {WeclappEndpoint} from '@utils/weclapp/parseEndpointPath';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedServiceFunction {
    types: string;
    func: string;
}

export interface ServiceFunctionGeneratorConfig {
    service: string;
    path: OpenAPIV3.PathItemObject;
    endpoint: WeclappEndpoint;
}

export type ServiceFunctionGenerator = (v: ServiceFunctionGeneratorConfig) => GeneratedServiceFunction
