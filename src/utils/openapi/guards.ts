/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAPIV3 } from "openapi-types";

interface EnumSchemaObject {
  enum: string[];
  type: "string";
}

interface ObjectSchemaObject {
  type: "object";
  properties: Record<
    string,
    OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
  >;
}

export const isObject = (v: any): v is Record<any, any> => {
  return v !== null && typeof v === "object" && !Array.isArray(v);
};

export const isParameterObject = (v: any): v is OpenAPIV3.ParameterObject => {
  return isObject(v) && typeof v.name === "string" && typeof v.in === "string";
};

export const isReferenceObject = (v: any): v is OpenAPIV3.ReferenceObject => {
  return isObject(v) && typeof v.$ref === "string";
};

export const isObjectSchemaObject = (
  v: any,
): v is OpenAPIV3.SchemaObject & ObjectSchemaObject => {
  return isObject(v) && v.type === "object" && isObject(v.properties);
};

export const isEnumSchemaObject = (
  v: any,
): v is OpenAPIV3.NonArraySchemaObject & EnumSchemaObject => {
  return isObject(v) && v.type === "string" && Array.isArray(v.enum);
};

export const isArraySchemaObject = (
  v: any,
): v is OpenAPIV3.ArraySchemaObject => {
  return isObject(v) && v.type === "array" && typeof v.items === "object";
};

export const isResponseObject = (v: any): v is OpenAPIV3.ResponseObject => {
  return isObject(v) && typeof v.description === "string";
};

export const isNonArraySchemaObject = (
  v: any,
): v is OpenAPIV3.NonArraySchemaObject => {
  return isObject(v) && ["string", "undefined"].includes(typeof v.type);
};

export interface WeclappMetaProperties {
  entity?: string;
  service?: string;
  required?: boolean;
}

export interface WeclappSchemaObject extends OpenAPIV3.NonArraySchemaObject {
  "x-weclapp": WeclappMetaProperties;
}

export const isRelatedEntitySchema = (v: any): v is WeclappSchemaObject => {
  return (
    isObject(v) &&
    isNonArraySchemaObject(v) &&
    "x-weclapp" in v &&
    isObject(v["x-weclapp"])
  );
};
