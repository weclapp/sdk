import {InterfaceProperty} from '@ts/generateInterface';

export const isEntityPropertyDeprecated = (
    entityProperties: InterfaceProperty[],
    property: InterfaceProperty
) => {
    if (property.name.endsWith('Name')) {
        const rawName = property.name.slice(0, -4);
        return entityProperties.some(v => v.name.endsWith('Id') && v.name.slice(0, -2) === rawName);
    }

    return false;
};