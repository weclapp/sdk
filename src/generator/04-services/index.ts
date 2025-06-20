import { GeneratorOptions } from '@generator/generate';
import { logger } from '@logger';
import { concat } from '@utils/concat';
import { generateBlockComment } from '@ts/generateComment';
import { generateInterface } from '@ts/generateInterface';
import { generateBlockStatements, generateStatements } from '@ts/generateStatements';
import { WeclappEndpointType } from '@utils/weclapp/parseEndpointPath';
import { camelCase, pascalCase } from 'change-case';
import { OpenAPIV3 } from 'openapi-types';
import { generateCountEndpoint } from './endpoints/count';
import { generateCreateEndpoint } from './endpoints/create';
import { generateGenericEndpoint } from './endpoints/generic';
import { generateRemoveEndpoint } from './endpoints/remove';
import { generateSomeEndpoint } from './endpoints/some';
import { generateUniqueEndpoint } from './endpoints/unique';
import { generateUpdateEndpoint } from './endpoints/update';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from './types';
import { parseEndpointsAndGroupByEntity } from './utils/parseEndpointsAndGroupByEntity';
import { GeneratedEntity } from '../03-entities';

export interface ExtendedGeneratedServiceFunction extends GeneratedServiceFunction {
  path: OpenAPIV3.OperationObject;
}

export interface GeneratedService {
  name: string;
  serviceFnName: string;
  serviceTypeName: string;
  source: string;
  deprecated: boolean;
  functions: ExtendedGeneratedServiceFunction[];
}

const generators: Record<WeclappEndpointType, Record<string, ServiceFunctionGenerator>> = {
  /* /article */
  [WeclappEndpointType.ROOT]: {
    get: generateSomeEndpoint,
    post: generateCreateEndpoint
  },

  /* /article/count */
  [WeclappEndpointType.COUNT]: {
    get: generateCountEndpoint
  },

  /* /article/:id */
  [WeclappEndpointType.ENTITY]: {
    get: generateUniqueEndpoint,
    delete: generateRemoveEndpoint,
    put: generateUpdateEndpoint
  },

  /* /article/:id/method */
  [WeclappEndpointType.GENERIC_ENTITY]: {
    get: generateGenericEndpoint('ById'),
    post: generateGenericEndpoint('ById')
  },

  /* /article/method */
  [WeclappEndpointType.GENERIC_ROOT]: {
    get: generateGenericEndpoint(),
    post: generateGenericEndpoint()
  }
};

export const generateServices = (
  paths: OpenAPIV3.PathsObject,
  entities: Map<string, GeneratedEntity>,
  aliases: Map<string, string>,
  options: GeneratorOptions
): Map<string, GeneratedService> => {
  const services: Map<string, GeneratedService> = new Map();
  const endpoints = parseEndpointsAndGroupByEntity(paths);
  for (const [serviceName, paths] of endpoints) {
    const serviceFnName = camelCase(`${serviceName}Service`);
    const serviceTypeName = pascalCase(`${serviceName}Service`);

    const functions: ExtendedGeneratedServiceFunction[] = [];
    for (const { path, endpoint } of paths) {
      const generator = generators[endpoint.type];
      for (const [method, config] of Object.entries(path)) {
        if (method === 'get' && endpoint.type === WeclappEndpointType.ENTITY && !options.generateUnique) {
          // Skip unique endpoints if generateUnique option is not set
          continue;
        }

        const generatorFn = generator[method];
        if (generatorFn) {
          const path = config as OpenAPIV3.OperationObject;
          const target = options.target;

          if (!path.deprecated || options.deprecated) {
            functions.push({
              ...generatorFn({
                endpoint,
                method,
                target,
                path,
                entities,
                aliases
              }),
              path
            });
          }
        } else {
          logger.errorLn(`Failed to generate a function for ${method.toUpperCase()}:${endpoint.type} ${endpoint.path}`);
        }
      }
    }

    if (!functions.length) {
      continue;
    }

    const serviceTypes = generateStatements(
      ...functions.flatMap((v) =>
        generateBlockComment(
          `${serviceTypeName} - ${pascalCase(v.name)}`,
          generateStatements(...[...(v.interfaces?.map((v) => v.source) ?? []), v.type.source])
        )
      ),
      generateBlockComment(
        `${serviceTypeName}`,
        generateInterface(serviceTypeName, [
          ...functions.map((v) => ({
            required: true,
            comment: v.path.deprecated ? '@deprecated' : undefined,
            name: v.func.name,
            type: v.type.name
          }))
        ])
      )
    );

    const serviceFn = `export const ${serviceFnName} = (cfg?: ServiceConfig): ${serviceTypeName} => ${generateBlockStatements(
      ...functions.map((v) => v.func.source),
      `return {${concat(functions.map((v) => v.func.name))}};`
    )};`;

    services.set(serviceName, {
      name: serviceName,
      serviceFnName,
      serviceTypeName,
      functions,
      source: generateStatements(serviceTypes, serviceFn),
      deprecated: functions.every((v) => v.path.deprecated)
    });
  }

  return services;
};
