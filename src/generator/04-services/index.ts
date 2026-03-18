import { GeneratorOptions } from '@generator/generate';
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
import { GeneratedEntity } from '../03-entities';
import { OpenApiContext } from '@utils/weclapp/extractContext';
import { ExtendedGeneratedServiceFunction, GeneratedService, ServiceFunctionGenerator } from './types';

const generators: Record<WeclappEndpointType, { [method in OpenAPIV3.HttpMethods]?: ServiceFunctionGenerator }> = {
  /* /article */
  [WeclappEndpointType.ROOT]: {
    [OpenAPIV3.HttpMethods.GET]: generateSomeEndpoint,
    [OpenAPIV3.HttpMethods.POST]: generateCreateEndpoint
  },

  /* /article/count */
  [WeclappEndpointType.COUNT]: {
    [OpenAPIV3.HttpMethods.GET]: generateCountEndpoint
  },

  /* /article/:id */
  [WeclappEndpointType.ENTITY]: {
    [OpenAPIV3.HttpMethods.GET]: generateUniqueEndpoint,
    [OpenAPIV3.HttpMethods.PUT]: generateUpdateEndpoint,
    [OpenAPIV3.HttpMethods.DELETE]: generateRemoveEndpoint
  },

  /* /article/:id/method */
  [WeclappEndpointType.GENERIC_ENTITY]: {
    [OpenAPIV3.HttpMethods.GET]: generateGenericEndpoint('ById'),
    [OpenAPIV3.HttpMethods.POST]: generateGenericEndpoint('ById')
  },

  /* /article/method */
  [WeclappEndpointType.GENERIC_ROOT]: {
    [OpenAPIV3.HttpMethods.GET]: generateGenericEndpoint(),
    [OpenAPIV3.HttpMethods.POST]: generateGenericEndpoint()
  }
};

export const generateServices = (
  entities: Map<string, GeneratedEntity>,
  context: OpenApiContext,
  options: GeneratorOptions
): Map<string, GeneratedService> => {
  const services: Map<string, GeneratedService> = new Map();
  for (const [serviceName, serviceEndpoints] of context.endpoints) {
    const serviceFnName = camelCase(`${serviceName}Service`);
    const serviceTypeName = pascalCase(`${serviceName}Service`);

    const functions: ExtendedGeneratedServiceFunction[] = [];
    for (const { path, endpoint } of serviceEndpoints) {
      for (const method of [
        OpenAPIV3.HttpMethods.GET,
        OpenAPIV3.HttpMethods.POST,
        OpenAPIV3.HttpMethods.PUT,
        OpenAPIV3.HttpMethods.DELETE
      ]) {
        if (
          (method === OpenAPIV3.HttpMethods.GET &&
            endpoint.type === WeclappEndpointType.ENTITY &&
            !options.generateUnique) ||
          (method === OpenAPIV3.HttpMethods.POST &&
            (endpoint.type === WeclappEndpointType.COUNT || endpoint.path.endsWith('query')))
        ) {
          // Skip unique endpoints if generateUnique option is not set or if POST is used for filter queries
          continue;
        }

        const operationObject = path[method] as OpenAPIV3.OperationObject;
        const generatorFn = generators[endpoint.type][method];

        if (operationObject && generatorFn) {
          if (!operationObject.deprecated || options.deprecated) {
            functions.push({
              ...generatorFn({
                method,
                endpoint,
                operationObject,
                entities,
                context,
                options
              }),
              path: operationObject
            });
          }
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

    const relatedEntityName = context.aliases.get(serviceName);
    const relatedEntity = relatedEntityName ? entities.get(relatedEntityName) : undefined;

    services.set(serviceName, {
      name: serviceName,
      serviceFnName,
      functions,
      source: generateStatements(serviceTypes, serviceFn),
      deprecated: functions.every((v) => v.path.deprecated),
      relatedEntity
    });
  }

  return services;
};
