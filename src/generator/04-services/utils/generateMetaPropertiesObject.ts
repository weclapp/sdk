import {GeneratedEntity} from '@generator/03-entities';
import {generateObject} from '@ts/generateObject';
import {generateString} from '@ts/generateString';

const resolveInheritedEntities = (
    root: GeneratedEntity,
    entities: Map<string, GeneratedEntity>
): GeneratedEntity[] => {
    const parent = root.extends ? entities.get(root.extends) : undefined;
    return parent ? [parent, ...resolveInheritedEntities(parent, entities)] : [];
};

export const generateMetaPropertiesObject = (
    entity: GeneratedEntity,
    entities: Map<string, GeneratedEntity>
) => generateObject(Object.fromEntries(
    [
        ...resolveInheritedEntities(entity, entities).flatMap(v => [...v.properties]),
        ...entity.properties
    ].map(([property, meta]) => [
        property,
        Object.fromEntries(Object.entries(meta).map(([property, value]) => [
            property,
            value ? generateString(value as string) : undefined
        ]))
    ])
));