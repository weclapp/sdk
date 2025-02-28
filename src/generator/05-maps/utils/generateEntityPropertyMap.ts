import { GeneratedEntity } from "@generator/03-entities";
import { GeneratedService } from "@generator/04-services";
import { GeneratorOptions } from "@generator/generate";
import { generateStatements } from "@ts/generateStatements";
import { generateString } from "@ts/generateString";
import { generateObject, ObjectProperty } from "@ts/generateObject";

const resolveInheritedEntities = (
  root: GeneratedEntity,
  entities: Map<string, GeneratedEntity>,
): GeneratedEntity[] => {
  const parent = root.extends ? entities.get(root.extends) : undefined;
  return parent ? [parent, ...resolveInheritedEntities(parent, entities)] : [];
};

const generatePropertyDescriptors = (
  entity: GeneratedEntity,
  entities: Map<string, GeneratedEntity>,
  services: GeneratedService[],
  options: GeneratorOptions,
): ObjectProperty[] =>
  [
    ...resolveInheritedEntities(entity, entities).flatMap((v) => [
      ...v.properties,
    ]),
    ...entity.properties,
  ]
    .filter(([, meta]) => {
      // If we generate deprecated things we can skip the filtering
      if (options.deprecated) {
        return true;
      }

      // Check if corresponding service is deprecated and can be removed
      const service = services.find((v) => v.entity === meta.service);
      return !meta.service || (service && !service.deprecated);
    })
    .map(([property, meta]) => ({
      key: property,
      value: Object.entries(meta).map(([key, value]) => ({
        key,
        value:
          value !== undefined
            ? typeof value === "number"
              ? value
              : generateString(value as string)
            : undefined,
      })),
    }));

export const generateEntityPropertyMap = (
  entities: Map<string, GeneratedEntity>,
  services: GeneratedService[],
  options: GeneratorOptions,
): string => {
  const typeName = "WEntityProperties";
  const propertyMap: ObjectProperty[] = [...entities].map(([entity, data]) => ({
    key: entity,
    value: generatePropertyDescriptors(data, entities, services, options),
  }));

  return generateStatements(
    `export type ${typeName} = Partial<Record<WEntity, Partial<Record<string, WEntityPropertyMeta>>>>;`,
    `export const wEntityProperties: ${typeName} = ${generateObject(propertyMap)};`,
  );
};
