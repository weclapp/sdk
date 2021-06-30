export interface EntityReference {
    entityName: string;
    entityId: string;
}

export interface SelectedValue {
    id: string;
}

export interface CustomAttribute {
    attributeDefinitionId: string;
    booleanValue?: boolean;
    dateValue?: number;
    entityId?: string;
    entityReferences?: EntityReference[];
    numberValue?: number;
    selectedValueId?: string;
    selectedValues?: SelectedValue[];
    stringValue?: string;
}

export interface EntityWithCustomAttributes {
    customAttributes?: CustomAttribute[];
}

/**
 * Resolves a custom-attribute's value.
 * @param entity Source entity.
 * @param id Custom-attribute id.
 */
export const getCustomAttribute = <E extends EntityWithCustomAttributes, K extends keyof CustomAttribute | undefined = undefined>(
    entity: E,
    id: string
): CustomAttribute | undefined => {
    return entity.customAttributes?.find(v => v.attributeDefinitionId === id);
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
