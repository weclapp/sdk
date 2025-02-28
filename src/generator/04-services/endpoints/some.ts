import { resolveResponseType } from "@enums/Target";
import {
  GeneratedServiceFunction,
  ServiceFunctionGenerator,
} from "@generator/04-services/types";
import { resolveBodyType } from "@generator/04-services/utils/generateResponseBodyType";
import { generateArrowFunction } from "@ts/generateArrowFunction";
import { generateArrowFunctionType } from "@ts/generateArrowFunctionType";
import { generateInterfaceFromObject } from "@ts/generateInterface";
import { generateString, generateStrings } from "@ts/generateString";
import { concat } from "@utils/concat";
import { convertParametersToSchema } from "@utils/openapi/convertParametersToSchema";
import {
  convertToTypeScriptType,
  createObjectType,
} from "@utils/openapi/convertToTypeScriptType";
import { isObjectSchemaObject, isResponseObject } from "@utils/openapi/guards";
import { pascalCase } from "change-case";
import { OpenAPIV3 } from "openapi-types";

const functionName = "some";
const excludedParameters = [
  "page",
  "pageSize",
  "sort",
  "serializeNulls",
  "properties",
  "includeReferencedEntities",
];

const resolveAdditionalProperties = (path: OpenAPIV3.OperationObject) => {
  const body = resolveBodyType(path);

  if (isResponseObject(body)) {
    const schema = body?.content?.["application/json"]?.schema;

    if (isObjectSchemaObject(schema)) {
      const obj = schema?.properties?.additionalProperties;

      if (isObjectSchemaObject(obj)) {
        return obj;
      }
    }
  }

  return undefined;
};

export const generateSomeEndpoint: ServiceFunctionGenerator = ({
  aliases,
  target,
  path,
  endpoint,
}): GeneratedServiceFunction => {
  // Required interface names
  const service = pascalCase(endpoint.entity);
  const entity = aliases.get(endpoint.entity) ?? service;
  const interfaceName = `${service}Service_${pascalCase(functionName)}`;
  const entityFilter = `${entity}_Filter`;
  const entityMappings = `${entity}_Mappings`;
  const entityReferences = `${entity}_References`;
  const entityParameters = `${service}_Parameters`;
  const parameterSchema = convertParametersToSchema(path.parameters);
  const additionalProperties = resolveAdditionalProperties(path);

  const additionalPropertyNames = generateStrings(
    Object.keys(additionalProperties?.properties ?? {}),
  );
  const additionalPropertyNamesType = additionalPropertyNames.length
    ? `(${concat(additionalPropertyNames, " | ")})[]`
    : "[]";

  // We already cover some properties
  parameterSchema.properties = Object.fromEntries(
    Object.entries(parameterSchema.properties ?? {}).filter(
      (v) => !excludedParameters.includes(v[0]),
    ),
  );

  const parameters = createObjectType({
    params: convertToTypeScriptType(parameterSchema),
  });

  const properties = additionalProperties
    ? convertToTypeScriptType(additionalProperties).toString()
    : "{}";

  const interfaceSource = generateArrowFunctionType({
    type: interfaceName,
    generics: [
      `S extends (QuerySelect<${entity}> | undefined) = undefined`,
      `I extends (QuerySelect<${entityMappings}> | undefined) = undefined`,
    ],
    params: [
      `query${parameters.isFullyOptional() ? "?" : ""}: SomeQuery<${entity}, ${entityFilter}, I, S, ${additionalPropertyNamesType}> & ${entityParameters}`,
    ],
    returns: `${resolveResponseType(target)}<SomeQueryReturn<${entity}, ${entityReferences}, ${entityMappings}, I, S, ${properties}>>`,
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: interfaceName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, query)`,
    params: ["query"],
  });

  return {
    entity,
    name: functionName,
    type: { name: interfaceName, source: interfaceSource },
    func: { name: functionName, source: functionSource },
    interfaces: [
      {
        name: entityParameters,
        source: generateInterfaceFromObject(entityParameters, parameters, true),
      },
    ],
  };
};
