import { extractPropertyMetaData, PropertyMetaData } from '@generator/03-entities/utils/extractPropertyMetaData';
import { logger } from '@logger';
import { generateInterface, generateInterfaceType, InterfaceProperty } from '@ts/generateInterface';
import { generateStatements } from '@ts/generateStatements';
import { loosePascalCase } from '@utils/case';
import { convertToTypeScriptType, createReferenceType, getRefName } from '@utils/openapi/convertToTypeScriptType';
import { ExtendedSchema, isEnumSchemaObject, isReferenceObject } from '@utils/openapi/guards';
import { OpenApiContext } from '@utils/weclapp/extractContext';
import { OpenAPIV3 } from 'openapi-types';

export interface GeneratedEntity {
  name: string;
  interfaceName: string;
  properties: Map<string, PropertyMetaData>;
  source: string;

  filterInterfaceName: string;
  filterSource: string;

  parentName?: string;
  parentInterfaceName?: string;
}

export const FILTER_PROPS_SUFFIX = 'Filter_Props';

export const generateEntities = (context: OpenApiContext): Map<string, GeneratedEntity> => {
  const entities: Map<string, GeneratedEntity> = new Map();

  for (const [schemaName, schema] of context.schemas) {
    // Enums are generated separately
    if (isEnumSchemaObject(schema)) {
      continue;
    }

    const entityName = schemaName;
    const entityInterfaceName = loosePascalCase(entityName);
    const entityInterfaceProperties: InterfaceProperty[] = [];
    const properties = new Map<string, PropertyMetaData>();

    let parentEntityName: string | undefined = undefined;
    let parentEntityInterfaceName: string | undefined = undefined;

    const entityFilterInterfaceName = `${entityInterfaceName}_${FILTER_PROPS_SUFFIX}`;
    const entityFilterInterfaceProperties: InterfaceProperty[] = [];
    let parentEntityFilterInterfaceName: string | undefined = undefined;

    const processProperties = (props: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}) => {
      for (const [propertyName, propertySchema] of Object.entries(props)) {
        const weclappExtension = (propertySchema as ExtendedSchema)['x-weclapp'];
        properties.set(propertyName, extractPropertyMetaData(propertySchema, context));

        const type = convertToTypeScriptType(propertySchema).toString();

        // cast to SchemaObject to access deprecated and readOnly properties (ReferenceObject can also include these props in OpenAPI 3.1)
        const castedSchema = propertySchema as OpenAPIV3.SchemaObject;
        const comment = castedSchema.deprecated
          ? '@deprecated will be removed.'
          : castedSchema.format
            ? `format: ${castedSchema.format}`
            : undefined;

        if (weclappExtension?.filterable !== false) {
          entityFilterInterfaceProperties.push({ name: propertyName, type, comment });
        }

        entityInterfaceProperties.push({
          name: propertyName,
          type,
          required: weclappExtension?.required,
          readonly: castedSchema.readOnly,
          comment
        });
      }
    };

    const processExtraFilterProperties = (
      props: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}
    ) => {
      for (const [propertyName, propertySchema] of Object.entries(props)) {
        if (isReferenceObject(propertySchema)) continue;

        const type = convertToTypeScriptType(propertySchema).toString();
        const comment = propertySchema.deprecated
          ? '@deprecated will be removed.'
          : propertySchema.format
            ? `format: ${propertySchema.format}`
            : undefined;

        entityFilterInterfaceProperties.push({ name: propertyName, type, comment });
      }
    };

    const processFilterPaths = (filterPaths: Record<string, string> = {}) => {
      for (const [filterProp, entityName] of Object.entries(filterPaths)) {
        if (!filterProp.includes('.') && context.schemas.get(entityName)) {
          entityFilterInterfaceProperties.push({
            name: filterProp,
            type: `${loosePascalCase(entityName)}_${FILTER_PROPS_SUFFIX}`
          });
        }
      }
    };

    if (schema.allOf?.length) {
      if (schema.allOf.length > 2) {
        logger.errorLn(`Failed to process schema for ${schemaName}: invalid allOf length`);
        continue;
      }

      for (const item of schema.allOf) {
        if (isReferenceObject(item)) {
          parentEntityName = getRefName(item);
          parentEntityInterfaceName = createReferenceType(parentEntityName).toString();
          parentEntityFilterInterfaceName = `${parentEntityInterfaceName}_${FILTER_PROPS_SUFFIX}`;
        } else if (item.type === 'object') {
          processProperties(item.properties);
          processExtraFilterProperties((item as ExtendedSchema)['x-weclapp-filterProperties']);
          processFilterPaths((item as ExtendedSchema)['x-weclapp-filterPaths']);
        } else {
          logger.errorLn(`Failed to process schema for ${schemaName}: invalid schema type in allOf`);
        }
      }
    } else {
      processProperties(schema.properties);
    }

    entities.set(entityName, {
      name: entityName,
      interfaceName: entityInterfaceName,
      properties,
      source: generateStatements(
        generateInterface(entityInterfaceName, entityInterfaceProperties, parentEntityInterfaceName)
      ),

      filterInterfaceName: entityFilterInterfaceName,
      filterSource: generateStatements(
        generateInterface(entityFilterInterfaceName, entityFilterInterfaceProperties, parentEntityFilterInterfaceName)
      ),

      parentName: parentEntityName,
      parentInterfaceName: parentEntityInterfaceName
    });
  }

  return entities;
};

export const generateReferencedEntities = (entities: Map<string, GeneratedEntity>, aliases: Map<string, string>) => {
  const aliasKeys = new Set(aliases.keys());

  return generateInterfaceType(
    'ReferencedEntities',
    [
      ...[...entities.values()]
        .filter((entity) => aliasKeys.has(entity.name))
        .map((entity) => ({
          name: entity.name,
          type: `${entity.interfaceName}[]`
        })),
      ...[...aliases.entries()]
        .filter(([, alias]) => loosePascalCase(alias) === 'CustomValue')
        .map(([entityName]) => ({
          name: entityName,
          type: 'CustomValue[]'
        }))
    ].sort((a, b) => a.name.localeCompare(b.name))
  );
};
