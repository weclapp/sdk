import { GeneratedEntity } from '@generator/03-entities';
import { GeneratorOptions } from '@generator/generate';
import { generateStatements } from '@ts/generateStatements';
import { generateString } from '@ts/generateString';
import { generateObject, ObjectProperty } from '@ts/generateObject';
import { GeneratedService } from '../../04-services/types';

const resolveInheritedEntities = (root: GeneratedEntity, entities: Map<string, GeneratedEntity>): GeneratedEntity[] => {
  const parent = root.parentName ? entities.get(root.parentName) : undefined;
  return parent ? [parent, ...resolveInheritedEntities(parent, entities)] : [];
};

const generatePropertyDescriptors = (
  entity: GeneratedEntity,
  entities: Map<string, GeneratedEntity>,
  services: GeneratedService[],
  options: GeneratorOptions
): ObjectProperty[] =>
  [...resolveInheritedEntities(entity, entities).flatMap((v) => [...v.properties]), ...entity.properties]
    .filter(([, meta]) => {
      // If we generate deprecated things we can skip the filtering
      if (options.deprecated) {
        return true;
      }

      // Check if corresponding service is deprecated and can be removed
      const service = services.find((v) => v.name === meta.service);
      return !meta.service || (service && !service.deprecated);
    })
    .map(([property, meta]) => ({
      key: property,
      value: Object.entries(meta).map(([key, value]) => ({
        key,
        value: value !== undefined ? (typeof value === 'number' ? value : generateString(value as string)) : undefined
      }))
    }));

export const generateEntityProperties = (
  entities: Map<string, GeneratedEntity>,
  services: GeneratedService[],
  options: GeneratorOptions
): string => {
  const typeName = 'WEntityProperties';
  const propertyMap: ObjectProperty[] = [
    ...entities.entries(),
    ...services
      .filter(({ relatedEntity }) => !!relatedEntity)
      .filter(({ name }) => !entities.get(name))
      .map(({ name, relatedEntity }) => {
        return [name, relatedEntity] as [string, GeneratedEntity];
      })
  ].map(([entityName, entity]) => ({
    key: entityName,
    value: generatePropertyDescriptors(entity, entities, services, options)
  }));

  return generateStatements(
    `export type ${typeName} = Partial<Record<WEntity, Partial<Record<string, WEntityPropertyMeta>>>>;`,
    `export const wEntityProperties: ${typeName} = ${generateObject(propertyMap)};`
  );
};
