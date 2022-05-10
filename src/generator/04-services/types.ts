import {Target} from '@enums/Target';
import {WeclappEndpoint} from '@utils/weclapp/parseEndpointPath';
import {OpenAPIV3} from 'openapi-types';

export interface Export {
    name: string;
    source: string;
}

export interface GeneratedServiceFunction {
    name: string;
    type: Export;
    func: Export;
    interfaces?: Export[];
}

export interface ServiceFunctionGeneratorConfig {
    target: Target;
    method: string;
    path: OpenAPIV3.OperationObject;
    endpoint: WeclappEndpoint;
    aliases: Map<string, string>;
}

export type ServiceFunctionGenerator = (v: ServiceFunctionGeneratorConfig) => GeneratedServiceFunction;
