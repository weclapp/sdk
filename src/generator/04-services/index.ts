import { GeneratorOptions } from "@generator/generate";
import { logger } from "@logger";
import { concat } from "@utils/concat";
import { generateBlockComment } from "@ts/generateComment";
import { generateInterface } from "@ts/generateInterface";
import {
  generateBlockStatements,
  generateStatements,
} from "@ts/generateStatements";
import { WeclappEndpointType } from "@utils/weclapp/parseEndpointPath";
import { camelCase, pascalCase } from "change-case";
import { OpenAPIV3 } from "openapi-types";
import { generateCountEndpoint } from "./endpoints/count";
import { generateCreateEndpoint } from "./endpoints/create";
import { generateGenericEndpoint } from "./endpoints/generic";
import { generateRemoveEndpoint } from "./endpoints/remove";
import { generateSomeEndpoint } from "./endpoints/some";
import { generateUniqueEndpoint } from "./endpoints/unique";
import { generateUpdateEndpoint } from "./endpoints/update";
import { GeneratedServiceFunction, ServiceFunctionGenerator } from "./types";
import { groupEndpointsByEntity } from "./utils/groupEndpointsByEntity";

export interface ExtendedGeneratedServiceFunction
  extends GeneratedServiceFunction {
  path: OpenAPIV3.OperationObject;
}

export interface GeneratedService {
  entity: string;
  serviceName: string;
  serviceTypeName: string;
  source: string;
  deprecated: boolean;
  functions: ExtendedGeneratedServiceFunction[];
}

const generators: Record<
  WeclappEndpointType,
  Record<string, ServiceFunctionGenerator>
> = {
  /* /article */
  [WeclappEndpointType.ROOT]: {
    get: generateSomeEndpoint,
    post: generateCreateEndpoint,
  },

  /* /article/count */
  [WeclappEndpointType.COUNT]: {
    get: generateCountEndpoint,
  },

  /* /article/:id */
  [WeclappEndpointType.ENTITY]: {
    get: generateUniqueEndpoint,
    delete: generateRemoveEndpoint,
    put: generateUpdateEndpoint,
  },

  /* /article/:id/method */
  [WeclappEndpointType.GENERIC_ENTITY]: {
    get: generateGenericEndpoint("ById"),
    post: generateGenericEndpoint("ById"),
  },

  /* /article/method */
  [WeclappEndpointType.GENERIC_ROOT]: {
    get: generateGenericEndpoint(),
    post: generateGenericEndpoint(),
  },
};

export const generateServices = (
  doc: OpenAPIV3.Document,
  aliases: Map<string, string>,
  options: GeneratorOptions,
): Map<string, GeneratedService> => {
  const services: Map<string, GeneratedService> = new Map();
  const grouped = groupEndpointsByEntity(doc.paths);

  for (const [endpoint, paths] of grouped) {
    const serviceName = camelCase(`${endpoint}Service`);
    const serviceTypeName = pascalCase(`${endpoint}Service`);

    // Service functions
    const functions: ExtendedGeneratedServiceFunction[] = [];
    for (const { path, endpoint } of paths) {
      const resolver = generators[endpoint.type];

      for (const [method, config] of Object.entries(path)) {
        if (
          method === "get" &&
          endpoint.type === WeclappEndpointType.ENTITY &&
          !options.generateUnique
        ) {
          continue;
        }

        if (resolver[method]) {
          const path = config as OpenAPIV3.OperationObject;
          const target = options.target;

          if (!path.deprecated || options.deprecated) {
            functions.push({
              ...resolver[method]({ endpoint, method, target, path, aliases }),
              path,
            });
          }
        } else {
          logger.errorLn(
            `Failed to generate a function for ${method.toUpperCase()}:${endpoint.type} ${endpoint.path}`,
          );
        }
      }
    }

    if (!functions.length) {
      continue;
    }

    // Construct service type
    const types = generateStatements(
      ...functions.flatMap((v) => v.interfaces?.map((v) => v.source) ?? []),
      ...functions.map((v) => v.type.source),
      generateInterface(serviceTypeName, [
        ...functions.map((v) => ({
          required: true,
          comment: v.path.deprecated ? "@deprecated" : undefined,
          name: v.func.name,
          type: v.type.name,
        })),
      ]),
    );

    // Construct service value
    const funcBody = generateBlockStatements(
      ...functions.map((v) => v.func.source),
      `return {${concat(functions.map((v) => v.func.name))}};`,
    );

    const func = `export const ${serviceName} = (cfg?: ServiceConfig): ${serviceTypeName} => ${funcBody};`;
    const source = generateBlockComment(
      `${pascalCase(endpoint)} service`,
      generateStatements(types, func),
    );
    const deprecated = functions.every((v) => v.path.deprecated);
    services.set(endpoint, {
      entity: endpoint,
      deprecated,
      serviceName,
      serviceTypeName,
      source,
      functions,
    });
  }

  return services;
};
