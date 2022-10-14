import {GeneratedEntity} from '@generator/03-entities';
import {generateStatements} from '@ts/generateStatements';
import {generateString} from '@ts/generateString';
import {generateObject, ObjectProperty} from '@ts/generateObject';

const resolveInheritedEntities = (
    root: GeneratedEntity,
    entities: Map<string, GeneratedEntity>
): GeneratedEntity[] => {
    const parent = root.extends ? entities.get(root.extends) : undefined;
    return parent ? [parent, ...resolveInheritedEntities(parent, entities)] : [];
};

const generatePropertyDescriptors = (
    entity: GeneratedEntity,
    entities: Map<string, GeneratedEntity>
): ObjectProperty[] => [
    ...resolveInheritedEntities(entity, entities).flatMap(v => [...v.properties]),
    ...entity.properties
].map(([property, meta]) => ({
    key: property,
    value: Object.entries(meta).map(([key, value]) => ({
        key,
        value: value ? generateString(value as string) : undefined
    }))
}));

export const generateEntityPropertyMap = (entities: Map<string, GeneratedEntity>): string => {
    const typeName = 'WEntityProperties';
    const propertyMap: ObjectProperty[] = [...entities].map(([entity, data]) => ({
        key: entity,
        value: generatePropertyDescriptors(data, entities)
    }));

    return generateStatements(
        `export type ${typeName} = Partial<Record<WEntity, Partial<Record<string, WEntityPropertyMeta>>>>;`,
        `export const wEntityProperties: ${typeName} = ${generateObject(propertyMap)};`
    );
};