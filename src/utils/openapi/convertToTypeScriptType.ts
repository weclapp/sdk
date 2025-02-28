import { concat } from "@utils/concat";
import { loosePascalCase } from "@utils/case";
import { indent } from "@utils/indent";
import { isReferenceObject } from "@utils/openapi/guards";
import { OpenAPIV3 } from "openapi-types";

interface Type {
  type: string;
  toString(): string;
}

export interface ReferenceType extends Type {
  type: "reference";
}

export interface RawType extends Type {
  type: "raw";
}

export interface ArrayType extends Type {
  type: "array";
}

export interface TupleType extends Type {
  type: "tuple";
}

export interface ObjectType extends Type {
  type: "object";

  isFullyOptional(): boolean;

  toString(propagateOptionalProperties?: boolean): string;
}

export const createReferenceType = (value: string): ReferenceType => ({
  type: "reference",
  toString: () => loosePascalCase(value),
});

export const createRawType = (value: string): RawType => ({
  type: "raw",
  toString: () => value,
});

export const createArrayType = (value: Type): ArrayType => ({
  type: "array",
  toString: () => `(${value.toString()})[]`,
});

export const createTupleType = (value: (Type | string)[]): TupleType => ({
  type: "tuple",
  toString: () =>
    concat(
      [
        ...new Set(
          value.map((v) => (typeof v === "string" ? `'${v}'` : v.toString())),
        ),
      ],
      " | ",
    ),
});

export const createObjectType = (
  value: Record<string, Type | undefined>,
  required: string[] = [],
): ObjectType => ({
  type: "object",
  isFullyOptional: () => {
    return (
      !required.length &&
      Object.values(value)
        .filter((v) => v?.type === "object")
        .every((v) => (v as ObjectType).isFullyOptional())
    );
  },
  toString: (propagateOptionalProperties = false) => {
    const properties = Object.entries(value)
      .filter((v) => v[1])
      .map((v) => {
        const name = v[0];
        const value = v[1] as AnyType;
        const isRequired =
          required.includes(name) ||
          (value.type === "object" &&
            !value.isFullyOptional() &&
            propagateOptionalProperties);
        return `${name + (isRequired ? "" : "?")}: ${value.toString()};`;
      });

    return properties.length ? `{\n${indent(properties.join("\n"))}\n}` : "{}";
  },
});

export type AnyType =
  | ArrayType
  | ObjectType
  | RawType
  | ReferenceType
  | TupleType;

export const getRefName = (obj: OpenAPIV3.ReferenceObject) => {
  return obj.$ref.replace(/.*\//, "");
};

export const convertToTypeScriptType = (
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  property?: string,
): AnyType => {
  if (isReferenceObject(schema)) {
    return createReferenceType(getRefName(schema));
  } else {
    switch (schema.type) {
      case "integer":
      case "number":
        return createRawType("number");
      case "string":
        if (schema.enum) {
          return property
            ? createReferenceType(property)
            : createTupleType(schema.enum as string[]);
        } else {
          return schema.format === "binary"
            ? createRawType("binary")
            : createRawType("string");
        }
      case "boolean":
        return createRawType("boolean");
      case "object": {
        const { properties = {}, required = [] } = schema;
        return createObjectType(
          Object.fromEntries(
            Object.entries(properties).map((v) => [
              v[0],
              convertToTypeScriptType(v[1]),
            ]),
          ),
          required,
        );
      }
      case "array":
        return createArrayType(convertToTypeScriptType(schema.items, property));
      default:
        return createRawType("unknown");
    }
  }
};
