import { GeneratedEnum } from '@generator/02-enums';
import { extractPropertyMetaData, PropertyMetaData } from '@generator/03-entities/utils/extractPropertyMetaData';
import { generateInterface, InterfaceProperty } from '@ts/generateInterface';
import { generateStatements } from '@ts/generateStatements';
import { convertToTypeScriptType } from '@utils/openapi/convertToTypeScriptType';
import {
  isEnumSchemaObject, isFilterPathsSchemaObject, isFilterPropertySchemaObject,
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
  filterableInterfaceProperties: InterfaceProperty[];
  parentName?: string;
  source: string;
}

export interface GeneratedEntityFilterProp {
  name: string;
  parentName?: string;
  source: string;
}

export const FILTER_PROPS_SUFFIX = 'Filter_Props';

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
    const filterableInterfaceProperties: InterfaceProperty[] = [];
    const properties = new Map<string, PropertyMetaData>();

    const processProperties = (props: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}, isXweclappFilterProp?: boolean) => {
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

        if(meta.filterable !== false) {
          filterableInterfaceProperties.push({ name, type });
        }

        if(!isXweclappFilterProp) {
          entityInterfaceProperties.push({
            name,
            type,
            comment,
            required: meta.required,
            filterable: meta.filterable ?? true,
            readonly: !isReferenceObject(property) && property.readOnly
          });

          properties.set(name, extractPropertyMetaData(enums, meta, property));
        }
      }
    };

    if (schema.allOf?.length) {
      for (const item of schema.allOf) {
        if (isReferenceObject(item)) {
          parentEntityInterfaceName = convertToTypeScriptType(item).toString();
        } else if (isObjectSchemaObject(item)) {
          processProperties(item.properties);

          if(isFilterPropertySchemaObject(item)) {
            processProperties(item['x-weclapp-filterProperties'], true);
          }

          if(isFilterPathsSchemaObject(item)) {
            const fPaths: Record<string, string> = item['x-weclapp-filterPaths'];
            for(const path in fPaths) {
              if(!path.includes('.')) {
                filterableInterfaceProperties.push({name: path, type: fPaths[path]});
              }
            }
          }
        }
      }
    }

    processProperties(schema.properties);

    entities.set(schemaName, {
      name: schemaName,
      properties,
      filterableInterfaceProperties: filterableInterfaceProperties.sort((propA, propB) => propA.name.localeCompare(propB.name)),
      parentName: parentEntityInterfaceName ? camelCase(parentEntityInterfaceName) : undefined,
      source: generateStatements(
        generateInterface(entityInterfaceName, entityInterfaceProperties, parentEntityInterfaceName)
      )
    });
  }

  return entities;
};

export const generateEntityFilterProps = (entities: Map<string, GeneratedEntity>, enums: Map<string, GeneratedEnum>): Map<string, GeneratedEntityFilterProp> => {
  const entityFilterProps: Map<string, GeneratedEntityFilterProp> = new Map();

  const transformFilterProps = (props: InterfaceProperty[]) => {
    return props.map((prop) => {
      if(!prop.type || enums.has(prop.type) || prop.type === 'string' || prop.type === 'number' || prop.type === 'boolean' || prop.type.endsWith('[]')) {
        return prop;
      }

      return {...prop, type: `${pascalCase(prop.type)}_${FILTER_PROPS_SUFFIX}`}
    })
  }

  entities.forEach((entity, name) => {
    const entityFilterName = `${pascalCase(name)}_${FILTER_PROPS_SUFFIX}`
    const parentName = entity.parentName ? `${pascalCase(entity.parentName)}_${FILTER_PROPS_SUFFIX}` : undefined;
    const filterableInterfaceProperties = transformFilterProps(entity.filterableInterfaceProperties);

    entityFilterProps.set(entityFilterName, {
      name: entityFilterName,
      parentName,
      source: generateStatements(
          generateInterface(entityFilterName, filterableInterfaceProperties, parentName)
      )
    });
  });

  return entityFilterProps;
}
