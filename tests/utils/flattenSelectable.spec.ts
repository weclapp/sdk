import {flattenSelectable} from '@sdk/utils';
import {User} from '@tests/utils/utils/test.types';
import 'jest-extended';

describe('flattenSelectable', () => {

    it('Should flatten a simple selectable', () => {
        expect(flattenSelectable<User>({
            id: true,
            username: true,
            age: undefined
        })).toEqual(['id', 'username']);
    });

    it('Should flatten a nested selectable', () => {
        expect(flattenSelectable<User>({
            id: true,
            age: true,
            contact: {
                firstName: true,
                lastName: true,
                address: true
            }
        })).toEqual(['id', 'age', 'contact.firstName', 'contact.lastName', 'contact.address']);
    });
});
