import { GeneratedEnum } from '@generator/02-enums';
import { extractPropertyMetaData, PropertyMetaData } from '@generator/03-entities/utils/extractPropertyMetaData';
import { generateInterface, InterfaceProperty } from '@ts/generateInterface';
import { generateStatements } from '@ts/generateStatements';
import { convertToTypeScriptType } from '@utils/openapi/convertToTypeScriptType';
import {
  isEnumSchemaObject,
  isNonArraySchemaObject,
  isObjectSchemaObject,
  isReferenceObject,
  isRelatedEntitySchema
} from '@utils/openapi/guards';
import { camelCase } from 'change-case';
import { OpenAPIV3 } from 'openapi-types';
import { loosePascalCase } from '@utils/case';

export interface GeneratedEntity {
  name: string;
  properties: Map<string, PropertyMetaData>;
  parentName?: string;
  source: string;
}

export const generateEntities = (
  schemas: Map<string, OpenAPIV3.SchemaObject>,
  enums: Map<string, GeneratedEnum>
): Map<string, GeneratedEntity> => {
  const entities: Map<string, GeneratedEntity> = new Map();

  for (const [schemaName, schema] of schemas) {
    // Enums are generated separately
    if (isEnumSchemaObject(schema)) {
      continue;
    }

    const entityInterfaceName = loosePascalCase(schemaName);
    let parentEntityInterfaceName: string | undefined = undefined;

    const entityInterfaceProperties: InterfaceProperty[] = [];
    const properties = new Map<string, PropertyMetaData>();

    const processProperties = (props: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}) => {
      for (const [name, property] of Object.entries(props)) {
        const meta = isRelatedEntitySchema(property) ? property['x-weclapp'] : {};
        const type = convertToTypeScriptType(property, name).toString();
        const comment = isNonArraySchemaObject(property)
          ? property.deprecated
            ? '@deprecated will be removed.'
            : property.format
              ? `format: ${property.format}`
              : undefined
          : undefined;

        entityInterfaceProperties.push({
          name,
          type,
          comment,
          required: meta.required,
          readonly: !isReferenceObject(property) && property.readOnly
        });

        properties.set(name, extractPropertyMetaData(enums, meta, property));
      }
    };

    if (schema.allOf?.length) {
      for (const item of schema.allOf) {
        if (isReferenceObject(item)) {
          parentEntityInterfaceName = convertToTypeScriptType(item).toString();
        } else if (isObjectSchemaObject(item)) {
          processProperties(item.properties);
        }
      }
    }

    processProperties(schema.properties);

    entities.set(schemaName, {
      name: schemaName,
      properties,
      parentName: parentEntityInterfaceName ? camelCase(parentEntityInterfaceName) : undefined,
      source: generateStatements(
        generateInterface(entityInterfaceName, entityInterfaceProperties, parentEntityInterfaceName)
      )
    });
  }

  return entities;
};
