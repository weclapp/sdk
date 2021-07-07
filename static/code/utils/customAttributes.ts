import { CustomAttribute } from '../types.models';

export type EntityWithCustomAttributes = {
    customAttributes?: CustomAttribute[];
}

/**
 * Resolves a custom-attribute's value.
 * @param entity Source entity.
 * @param id Custom-attribute id.
 */
export const getCustomAttribute = <E extends EntityWithCustomAttributes, K extends keyof CustomAttribute | null = null>(
    entity: E,
    id: string
): CustomAttribute | null => {
    return entity.customAttributes?.find(v => v.attributeDefinitionId === id) ?? null;
};

/**
 * Sets or creates a custom-attribute with it's value for an entity.
 *
 * @param entity Target entity.
 * @param id Custom attribute id.
 * @param type Custom-attribute type.
 * @param value Custom-attribute value.
 */
export const upsertCustomAttribute = <
    E extends EntityWithCustomAttributes,
    K extends keyof CustomAttribute
>(entity: E, id: string, type: K, value: CustomAttribute[K]): void => {
    const customAttribute = entity.customAttributes?.find(v => v.attributeDefinitionId === id);

    if (customAttribute) {
        customAttribute[type] = value;
    } else {
        entity.customAttributes = entity.customAttributes ?? [];
        entity.customAttributes.push({
            attributeDefinitionId: id,
            [type]: value
        })
    }
};
