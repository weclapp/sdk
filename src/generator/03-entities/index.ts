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
import { camelCase, pascalCase } from 'change-case';
import { OpenAPIV3 } from 'openapi-types';
import { loosePascalCase } from '@utils/case';

export interface GeneratedEntity {
  name: string;
  properties: Map<string, PropertyMetaData>;
  parentName?: string;
  source: string;
  createProperties: InterfaceProperty[];
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
      createProperties: entityInterfaceProperties.filter((prop) => !prop.readonly),
      parentName: parentEntityInterfaceName ? camelCase(parentEntityInterfaceName) : undefined,
      source: generateStatements(
        generateInterface(
          entityInterfaceName,
          entityInterfaceProperties.map((prop) => ({
            ...prop,
            required: !!(prop.required ?? prop.type?.endsWith('[]')) || prop.type !== 'string'
          })),
          parentEntityInterfaceName
        )
      )
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
        return isPrimitiveOrEnumOrObject(typeWithoutBrackets) ? prop : { ...prop, type: `(${typeWithoutBrackets}_Create)[]` };
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
    createEntityStatements.push(generateCreateEntityStatement(entity, name));
  });

  return createEntityStatements;
};
