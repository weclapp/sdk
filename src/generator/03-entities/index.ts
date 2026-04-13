import { extractPropertyMetaData, PropertyMetaData } from '@generator/03-entities/utils/extractPropertyMetaData';
import { generateInterface, InterfaceProperty } from '@ts/generateInterface';
import { generateStatements } from '@ts/generateStatements';
import { loosePascalCase } from '@utils/case';
import { convertToTypeScriptType, createReferenceType, getRefName } from '@utils/openapi/convertToTypeScriptType';
import { ExtendedSchema, isEnumSchemaObject, isReferenceObject } from '@utils/openapi/guards';
import { OpenAPIV3 } from 'openapi-types';
import { logger } from '@logger';
import { OpenApiContext } from '@utils/weclapp/extractContext';
import { GeneratedEnum } from '@generator/02-enums';
import { pascalCase } from 'change-case';

export interface GeneratedEntity {
  name: string;
  interfaceName: string;
  properties: Map<string, PropertyMetaData>;
  createProperties: InterfaceProperty[];
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
      createProperties: entityInterfaceProperties.filter((prop) => !prop.readonly),
      source: generateStatements(
        generateInterface(entityInterfaceName, entityInterfaceProperties, parentEntityInterfaceName)
      ),

      filterInterfaceName: entityFilterInterfaceName,
      filterSource: generateStatements(
        generateInterface(
          entityFilterInterfaceName,
          entityFilterInterfaceProperties.map((prop) => ({
            ...prop,
            required: !!(prop.required ?? prop.type?.endsWith('[]')) || prop.type !== 'string'
          })),
          parentEntityFilterInterfaceName
        )
      ),

      parentName: parentEntityName,
      parentInterfaceName: parentEntityInterfaceName
    });
  }

  return entities;
};

export const generateCreateEntityStatements = (
  entities: Map<string, GeneratedEntity>,
  enums: Map<string, GeneratedEnum>
): string[] => {
  const isPrimitiveOrEnumOrObject = (propType?: string) => {
    return (
      !propType ||
      enums.has(propType) ||
      propType.includes('|') ||
      propType === 'string' ||
      propType === 'number' ||
      propType === 'boolean' ||
      propType === '{}'
    );
  };

  const transformCreateEntityInterfaceProps = (props: InterfaceProperty[]) => {
    return props.map((prop) => {
      if (isPrimitiveOrEnumOrObject(prop.type)) {
        return prop;
      }

      if (prop.type?.endsWith('[]')) {
        const typeWithoutBrackets = prop.type.replace(/^\((.*?)\)\[\]$/, '$1');
        return isPrimitiveOrEnumOrObject(typeWithoutBrackets)
          ? prop
          : { ...prop, type: `(${typeWithoutBrackets}_Create)[]` };
      }

      return { ...prop, type: `${prop.type}_Create` };
    });
  };

  const createEntityStatements: string[] = [];

  const generateCreateEntityStatement = (entity: GeneratedEntity, entityName: string): string => {
    const name = `${pascalCase(entityName)}_Create`;
    const parentName = entity.parentName ? `${pascalCase(entity.parentName)}_Create` : undefined;
    const interfaceProperties = Array.from(transformCreateEntityInterfaceProps(entity.createProperties));

    return generateStatements(generateInterface(name, interfaceProperties, parentName));
  };

  entities.forEach((entity, name) => {
    if (entity.properties.entries().filter(([, meta]) => !meta.enum)) {
      createEntityStatements.push(generateCreateEntityStatement(entity, name));
    }
  });

  return createEntityStatements;
};
