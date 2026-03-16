import { OpenAPIV3 } from 'openapi-types';
import { WeclappEndpoint } from '@utils/weclapp/parseEndpointPath';
import { GeneratedEntity } from '../03-entities';
import { OpenApiContext } from '@utils/weclapp/extractContext';
import { GeneratorOptions } from '../generate';

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

export interface ExtendedGeneratedServiceFunction extends GeneratedServiceFunction {
  path: OpenAPIV3.OperationObject;
}

export interface ServiceFunctionGeneratorConfig {
  method: string;
  endpoint: WeclappEndpoint;
  operationObject: OpenAPIV3.OperationObject;
  entities: Map<string, GeneratedEntity>;
  context: OpenApiContext;
  options: GeneratorOptions;
}

export type ServiceFunctionGenerator = (config: ServiceFunctionGeneratorConfig) => GeneratedServiceFunction;

export interface GeneratedService {
  name: string;
  serviceFnName: string;
  source: string;
  deprecated: boolean;
  functions: ExtendedGeneratedServiceFunction[];
  relatedEntity?: GeneratedEntity;
}
