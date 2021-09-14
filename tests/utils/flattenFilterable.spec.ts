import {flattenFilterable} from '@sdk/utils';
import {EmploymentStatus, RelatedEntities_User, SkillLevel, User} from '@tests/utils/utils/test.types';
import 'jest-extended';

describe('flattenFilterable', () => {

    it('Should flatten a simple filterable', () => {
        const expected = new Map();
        expected.set('id-ge', '10');
        expected.set('age-notin', '[14,15]');

        expect(flattenFilterable<User>({
            id: {GE: '10'},
            age: {NOT_IN: [14, 15]}
        })).toEqual(expected);
    });

    it('Should work with nested objects', () => {
        const expected = new Map();
        expected.set('id-ge', '10');
        expected.set('contacts.firstName-eq', 'Foo');
        expected.set('contacts.addresses.city-ne', 'Baz');
        expected.set('contacts.addresses.zipcode-ge', '123');

        expect(flattenFilterable<User>({
            id: {GE: '10'},
            contacts: {
                firstName: {EQ: 'Foo'},
                addresses: {
                    city: {NE: 'Baz'},
                    zipcode: {GE: '123'}
                }
            }
        })).toEqual(expected);
    });

    it('Should work with OR operations', () => {
        const expected = new Map();
        expected.set('id-in', '[1,2,3]');
        expected.set('or-contacts.firstName-eq', 'Foo');
        expected.set('or-contacts.addresses.city-eq', 'Bam');
        expected.set('or-age-eq', '20');

        expect(flattenFilterable<User>({
            id: {IN: ['1', '2', '3']},
            OR: [
                [
                    {contacts: {firstName: {EQ: 'Foo'}}},
                    {contacts: {addresses: {city: {EQ: 'Bam'}}}},
                    {age: {EQ: 20}}
                ]
            ]
        })).toEqual(expected);
    });

    it('Should work with nested array, objects and references', () => {
        const expected = new Map();
        expected.set('id-eq', '1');
        expected.set('contacts.firstName-eq', 'Foo');
        expected.set('contacts.addresses.city-eq', 'Bam');
        expected.set('age-eq', '20');
        expected.set('company.name-eq', 'Baz');
        expected.set('employmentStatus-eq', 'EMPLOYED');
        expected.set('profession.level-eq', '0');

        expect(flattenFilterable<User, RelatedEntities_User>({
            id: {EQ: '1'},
            contacts: {firstName: {EQ: 'Foo'}, addresses: {city: {EQ: 'Bam'}}},
            company: {name: {EQ: 'Baz'}},
            age: {EQ: 20},
            employmentStatus: {EQ: EmploymentStatus.EMPLOYED},
            profession: {level: {EQ: SkillLevel.JUNIOR}}
        })).toEqual(expected);
    });
});
