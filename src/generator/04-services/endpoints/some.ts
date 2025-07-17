import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { resolveBodyType } from '@generator/04-services/utils/generateResponseBodyType';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateInterfaceFromObject, generateInterfaceType, InterfaceProperty } from '@ts/generateInterface';
import { generateString } from '@ts/generateString';
import { convertParametersToSchema } from '@utils/openapi/convertParametersToSchema';
import { convertToTypeScriptType, createObjectType } from '@utils/openapi/convertToTypeScriptType';
import { isObjectSchemaObject, isParameterObject, isResponseObject } from '@utils/openapi/guards';
import { pascalCase } from 'change-case';
import { OpenAPIV3 } from 'openapi-types';
import { generateType } from '@ts/generateType';
import { GeneratedEntity } from '../../03-entities';

const excludedParameters = [
  'page',
  'pageSize',
  'sort',
  'serializeNulls',
  'properties',
  'includeReferencedEntities',
  'additionalProperties'
];

const resolveAdditionalPropertiesSchema = (path: OpenAPIV3.OperationObject) => {
  const body = resolveBodyType(path);

  if (isResponseObject(body)) {
    const schema = body?.content?.['application/json']?.schema;

    if (isObjectSchemaObject(schema)) {
      const obj = schema?.properties?.additionalProperties;

      if (isObjectSchemaObject(obj)) {
        return obj;
      }
    }
  }

  return undefined;
};

const resolveReferences = (entity: string, entities: Map<string, GeneratedEntity>) => {
  const references: InterfaceProperty[] = [];
  const generatedEntity = entities.get(entity);
  if (generatedEntity) {
    for (const [property, propertyMetaData] of generatedEntity.properties) {
      if (propertyMetaData.service) {
        references.push({
          name: property,
          type: generateString(propertyMetaData.service),
          required: true
        });
      }
    }
    if (generatedEntity.parentName) {
      references.push(...resolveReferences(generatedEntity.parentName, entities));
    }
  }
  return references;
};

const resolveReferencedEntities = (entity: string, entities: Map<string, GeneratedEntity>) => {
  const referencedEntities: InterfaceProperty[] = [];
  const generatedEntity = entities.get(entity);
  if (generatedEntity) {
    for (const [, propertyMetaData] of generatedEntity.properties) {
      if (propertyMetaData.entity && propertyMetaData.service) {
        referencedEntities.push({
          name: propertyMetaData.service,
          type: `${pascalCase(propertyMetaData.entity)}[]`,
          required: true
        });
      }
    }
    if (generatedEntity.parentName) {
      referencedEntities.push(...resolveReferencedEntities(generatedEntity.parentName, entities));
    }
  }
  return referencedEntities;
};

export const generateSomeEndpoint: ServiceFunctionGenerator = ({
  endpoint,
  target,
  path,
  entities,
  aliases
}): GeneratedServiceFunction => {
  const functionName = 'some';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;
  const entity = aliases.get(endpoint.service) ?? pascalCase(endpoint.service);

  const parametersTypeName = `${functionTypeName}_Parameters`;
  const parameters =
    path.parameters?.filter((v) => (isParameterObject(v) ? !excludedParameters.includes(v.name) : false)) ?? [];
  const parametersType = createObjectType({
    params: convertToTypeScriptType(convertParametersToSchema(parameters))
  });
  const parametersTypeSource = generateInterfaceFromObject(parametersTypeName, parametersType, true);

  const filterTypeName = `${functionTypeName}_Filter`;
  const filterTypeSource = generateInterfaceType(filterTypeName, [], [entity]);

  const referencesTypeName = `${functionTypeName}_References`;
  const referencesTypeSource = generateInterfaceType(referencesTypeName, resolveReferences(endpoint.service, entities));

  const additionalPropertyTypeName = `${functionTypeName}_AdditionalProperty`;
  const additionalPropertyTypeSource = generateType(additionalPropertyTypeName, 'string');

  const queryTypeName = `${functionTypeName}_Query`;
  const queryTypeSource = generateType(
    queryTypeName,
    `SomeQuery<${entity}, ${filterTypeName}, ${referencesTypeName}, ${additionalPropertyTypeName}> & ${parametersTypeName}`
  );

  const referencedEntitiesTypeName = `${functionTypeName}_ReferencedEntities`;
  const referencedEntitiesTypeSource = generateInterfaceType(
    referencedEntitiesTypeName,
    resolveReferencedEntities(endpoint.service, entities)
  );

  const additionalPropertiesTypeName = `${functionTypeName}_AdditionalProperties`;
  const additionalPropertiesSchema = resolveAdditionalPropertiesSchema(path);
  const additionalPropertiesTypeSource = generateType(
    additionalPropertiesTypeName,
    additionalPropertiesSchema ? convertToTypeScriptType(additionalPropertiesSchema).toString() : '{}'
  );

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: [`query${parametersType.isFullyOptional() ? '?' : ''}: ${queryTypeName}, requestOptions?: RequestOptions`],
    returns: `${resolveResponseType(target)}<SomeQueryReturn<${entity}, ${referencedEntitiesTypeName}, ${additionalPropertiesTypeName}>>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, query, requestOptions)`,
    params: ['query', 'requestOptions?: RequestOptions']
  });

  return {
    entity,
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource },
    interfaces: [
      { name: parametersTypeName, source: parametersTypeSource },
      { name: filterTypeName, source: filterTypeSource },
      { name: referencesTypeName, source: referencesTypeSource },
      { name: additionalPropertyTypeName, source: additionalPropertyTypeSource },
      { name: queryTypeName, source: queryTypeSource },
      { name: referencedEntitiesTypeName, source: referencedEntitiesTypeSource },
      { name: additionalPropertiesTypeName, source: additionalPropertiesTypeSource }
    ]
  };
};
