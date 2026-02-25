import { loosePascalCase } from '@utils/case';
import { getRefName } from '@utils/openapi/convertToTypeScriptType';
import { ExtendedSchema, isArraySchemaObject, isEnumSchemaObject, isReferenceObject } from '@utils/openapi/guards';
import { OpenAPIV3 } from 'openapi-types';
import { OpenApiContext } from '@utils/weclapp/extractContext';

export interface PropertyMetaData {
  type?: string;
  format?: string;
  maxLength?: number;
  pattern?: string;
  service?: string;
  entity?: string;
  enum?: string;
}

const setReferenceMeta = (prop: OpenAPIV3.ReferenceObject, metaData: PropertyMetaData, context: OpenApiContext) => {
  const referenceName = getRefName(prop);
  const referenceSchema = context.schemas.get(referenceName);

  if (isEnumSchemaObject(referenceSchema)) {
    metaData.enum = loosePascalCase(referenceName);
  } else {
    metaData.entity = referenceName;
  }
};

export const extractPropertyMetaData = (
  prop: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  context: OpenApiContext
): PropertyMetaData => {
  const metaData: PropertyMetaData = {};

  const weclappExtension = (prop as ExtendedSchema)['x-weclapp'];
  if (weclappExtension) {
    metaData.service = weclappExtension.service;
    metaData.entity = weclappExtension.entity;
  }

  if (isReferenceObject(prop)) {
    metaData.type = 'reference';
    setReferenceMeta(prop, metaData, context);
  } else {
    metaData.type = prop.type;
    metaData.format = prop.format;
    metaData.maxLength = prop.maxLength;
    metaData.pattern = prop.pattern;

    if (isArraySchemaObject(prop)) {
      if (isReferenceObject(prop.items)) {
        metaData.format = 'reference';
        setReferenceMeta(prop.items, metaData, context);
      } else {
        metaData.format = 'string';
      }
    }
  }

  return metaData;
};
