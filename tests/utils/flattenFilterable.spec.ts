import {flattenFilterable} from '@sdk/utils';
import {User} from '@tests/utils/utils/test.types';
import 'jest-extended';

describe('flattenFilterable', () => {

    it('Should flatten a simple filterable', () => {
        const expected = new Map();
        expected.set('id-ge', '10');
        expected.set('age-notin', '[14,15]');

        expect(flattenFilterable<User>({
            id: {GE: 10},
            age: {NOT_IN: [14, 15]}
        })).toEqual(expected);
    });

    it('Should work with nested objects', () => {
        const expected = new Map();
        expected.set('id-ge', '10');
        expected.set('contact.firstName-eq', 'Foo');
        expected.set('contact.address.city-ne', 'Baz');
        expected.set('contact.address.zipcode-ge', '123');

        expect(flattenFilterable<User>({
            id: {GE: 10},
            contact: {
                firstName: {EQ: 'Foo'},
                address: {
                    city: {NE: 'Baz'},
                    zipcode: {GE: 123}
                }
            }
        })).toEqual(expected);
    });

    it('Should work with OR operations', () => {
        const expected = new Map();
        expected.set('id-in', '[1,2,3]');
        expected.set('or-contact.firstName-eq', 'Foo');
        expected.set('or-contact.address.city-eq', 'Bam');
        expected.set('or-age-eq', '20');

        expect(flattenFilterable<User>({
            id: {IN: [1, 2, 3]},
            OR: [
                {contact: {firstName: {EQ: 'Foo'}}},
                {contact: {address: {city: {EQ: 'Bam'}}}},
                {age: {EQ: 20}}
            ]
        })).toEqual(expected);
    });
});
