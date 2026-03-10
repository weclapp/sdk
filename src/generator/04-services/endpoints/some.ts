import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateInterfaceFromObject, generateInterfaceType, InterfaceProperty } from '@ts/generateInterface';
import { generateObject, ObjectProperty } from '@ts/generateObject';
import { generateString } from '@ts/generateString';
import { generateType } from '@ts/generateType';
import { convertToTypeScriptType, createObjectType } from '@utils/openapi/convertToTypeScriptType';
import { isObjectSchemaObject, isParameterObject, isResponseObject } from '@utils/openapi/guards';
import { pascalCase } from 'change-case';
import { OpenAPIV3 } from 'openapi-types';
import { resolveResponseType } from '../../../target';
import { GeneratedEntity } from '../../03-entities';
import { resolveParameters } from '../utils/resolveParameters';
import { resolveResponsesObject } from '../utils/resolveResponsesObject';

const excludedParameters = [
  'page',
  'pageSize',
  'sort',
  'serializeNulls',
  'properties',
  'includeReferencedEntities',
  'additionalProperties'
];

const resolveAdditionalPropertiesSchema = ({ responses }: OpenAPIV3.OperationObject) => {
  const body = resolveResponsesObject(responses);

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

const resolveArrayReferenceProperties = (
  entity: string,
  entities: Map<string, GeneratedEntity>,
  visitedEntities = new Set<string>()
): ObjectProperty[] => {
  if (!entity || visitedEntities.has(entity)) {
    return [];
  }

  const generatedEntity = entities.get(entity);
  if (!generatedEntity) {
    return [];
  }

  const nextVisitedEntities = new Set(visitedEntities);
  nextVisitedEntities.add(entity);

  const properties: ObjectProperty[] = [...generatedEntity.properties.entries()].flatMap(
    ([property, propertyMetaData]): ObjectProperty[] => {
      if (propertyMetaData.type === 'array') {
        if (propertyMetaData.entity === 'onlyId') {
          return [{ key: property, value: [{ key: 'id', value: 'string' }] }];
        }

        if (!propertyMetaData.entity) {
          return [];
        }

        const nestedProperties = resolveArrayReferenceProperties(
          propertyMetaData.entity,
          entities,
          nextVisitedEntities
        );

        if (!nestedProperties.length) {
          return [];
        }

        return [{ key: property, value: nestedProperties }];
      }

      if (property.endsWith('Id')) {
        return [{ key: property, value: 'string' }];
      }

      return [];
    }
  );

  if (generatedEntity.parentName) {
    properties.push(...resolveArrayReferenceProperties(generatedEntity.parentName, entities, nextVisitedEntities));
  }

  return properties;
};

// TODO: remove boolean from arrays in QuerySelect
const resolveReferences = (entity: string, entities: Map<string, GeneratedEntity>) => {
  const references: InterfaceProperty[] = [];
  const generatedEntity = entities.get(entity);
  if (generatedEntity) {
    if (entity === 'warehouseStock') {
      console.log('generatedEntity', generatedEntity);
    }
    for (const [property, propertyMetaData] of generatedEntity.properties) {
      // TODO: filter things like tags in opportunity
      if (propertyMetaData.type === 'array') {
        if (propertyMetaData.entity === 'onlyId') {
          references.push({
            name: property,
            type: generateObject([{ key: 'id', value: 'string' }]),
            required: true
          });
        } else {
          const nestedProperties = resolveArrayReferenceProperties(propertyMetaData.entity || '', entities);
          if (nestedProperties.length) {
            references.push({
              name: property,
              type: generateObject(nestedProperties),
              required: true
            });
          }
        }
      } else {
        if (propertyMetaData.service) {
          references.push({
            name: property,
            // TODO: maybe just string
            type: generateString(propertyMetaData.service),
            required: true
          });
        }
      }
    }
    if (generatedEntity.parentName) {
      references.push(...resolveReferences(generatedEntity.parentName, entities));
    }
  }

  if (entity === 'warehouseStock') {
    console.log('references', references);
  }
  return references;
};

const resolveReferencedEntities = (entity: string, entities: Map<string, GeneratedEntity>) => {
  const referencedEntities: InterfaceProperty[] = [];
  const generatedEntity = entities.get(entity);
  if (generatedEntity) {
    for (const [, propertyMetaData] of generatedEntity.properties) {
      if (propertyMetaData.service && propertyMetaData.entity) {
        const referencedEntity = entities.get(propertyMetaData.entity);
        if (referencedEntity)
          referencedEntities.push({
            name: propertyMetaData.service,
            type: `${referencedEntity.interfaceName}[]`,
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
  operationObject,
  entities,
  context,
  options
}): GeneratedServiceFunction => {
  const functionName = 'some';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

  const relatedEntityName = context.aliases.get(endpoint.service);
  const relatedEntity = !!relatedEntityName && entities.get(relatedEntityName);

  if (!relatedEntity) {
    throw Error(`Related entity schema for service ${endpoint.service} not found`);
  }

  const parametersTypeName = `${functionTypeName}_Parameters`;
  const parameters = operationObject.parameters?.filter((v) =>
    isParameterObject(v) ? !excludedParameters.includes(v.name) : false
  );
  const parametersType = createObjectType({
    params: parameters && convertToTypeScriptType(resolveParameters(parameters, context.parameters))
  });
  const parametersTypeSource = generateInterfaceFromObject(parametersTypeName, parametersType, 'propagate');

  const filterTypeName = `${functionTypeName}_Filter`;
  const filterTypeSource = generateInterfaceType(filterTypeName, [], [`${relatedEntity.filterInterfaceName}`]);

  const referencesTypeName = `${functionTypeName}_References`;
  const referencesTypeSource = generateInterfaceType(referencesTypeName, resolveReferences(endpoint.service, entities));

  // if (endpoint.service === 'warehouseStock') {
  //   console.log('referencesTypeSource', referencesTypeSource);
  // }

  const additionalPropertyTypeName = `${functionTypeName}_AdditionalProperty`;
  const additionalPropertyTypeSource = generateType(additionalPropertyTypeName, 'string');

  const queryTypeName = `${functionTypeName}_Query`;
  const queryTypeSource = generateType(
    queryTypeName,
    `SomeQuery<${relatedEntity.interfaceName}, ${filterTypeName}, ${referencesTypeName}, ${additionalPropertyTypeName}> & ${parametersTypeName}`
  );

  const referencedEntitiesTypeName = `${functionTypeName}_ReferencedEntities`;
  const referencedEntitiesTypeSource = generateInterfaceType(
    referencedEntitiesTypeName,
    resolveReferencedEntities(endpoint.service, entities)
  );

  const additionalPropertiesTypeName = `${functionTypeName}_AdditionalProperties`;
  const additionalPropertiesSchema = resolveAdditionalPropertiesSchema(operationObject);
  const additionalPropertiesTypeSource = generateType(
    additionalPropertiesTypeName,
    additionalPropertiesSchema ? convertToTypeScriptType(additionalPropertiesSchema).toString() : '{}'
  );

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: [`query${parametersType.isFullyOptional() ? '?' : ''}: ${queryTypeName}, requestOptions?: RequestOptions`],
    returns: `${resolveResponseType(options.target)}<SomeQueryReturn<${relatedEntity.interfaceName}, ${referencedEntitiesTypeName}, ${additionalPropertiesTypeName}>>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, query, requestOptions)`,
    params: ['query', 'requestOptions?: RequestOptions']
  });

  return {
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
