import { Target } from '../../target';
import { WeclappEndpoint } from '@utils/weclapp/parseEndpointPath';
import { OpenAPIV3 } from 'openapi-types';
import { GeneratedEntity } from '../03-entities';

export interface Export {
  name: string;
  source: string;
}

export interface GeneratedServiceFunction {
  entity: string;
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
  entities: Map<string, GeneratedEntity>;
  aliases: Map<string, string>;
}

export type ServiceFunctionGenerator = (v: ServiceFunctionGeneratorConfig) => GeneratedServiceFunction;
