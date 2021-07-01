import {EntityWithCustomAttributes, getCustomAttribute, upsertCustomAttribute} from '@sdk/utils';
import 'jest-extended';

describe('customAttributes', () => {

    it('Should return a custom attribute',  () => {
        const entity: EntityWithCustomAttributes = {
            customAttributes: [
                {attributeDefinitionId: '1539'}
            ]
        };

        expect(getCustomAttribute(entity, '1539')).toBeObject();
        expect(getCustomAttribute(entity, '9832')).toBeNull();
        expect(getCustomAttribute({}, '1539')).toBeNull();
    });

    it('Should create a custom attribute with upsert',  () => {
        const entity: EntityWithCustomAttributes = {};

        upsertCustomAttribute(entity, '6585', 'entityId', '2151');

        expect(entity).toEqual({
            customAttributes: [
                {attributeDefinitionId: '6585', entityId: '2151'}
            ]
        });
    });

    it('Should update  a custom attribute with upsert',  () => {
        const entity: EntityWithCustomAttributes = {
            customAttributes: [
                {attributeDefinitionId: '2165', numberValue: 666}
            ]
        };

        upsertCustomAttribute(entity, '2165', 'numberValue', 9000);

        expect(entity).toEqual({
            customAttributes: [
                {attributeDefinitionId: '2165', numberValue: 9000}
            ]
        });
    });
});
