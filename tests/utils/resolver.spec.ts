import {Address, Contact} from '@sdk/node';
import {resolvePrimaryAddress, resolvePrimaryContact} from '@sdk/utils';
import 'jest-extended';
import {sdk} from '../utils';

describe('Resolver', () => {

    it('Should resolve the primary contact', async () => {
        const customer = await sdk.customer.first({
            select: {contacts: true, primaryContactId: true}
        });

        if (customer) {
            expect(resolvePrimaryContact<Contact>(customer)).toBeObject();
        }
    });

    it('Should resolve the primary address', async () => {
        const customer = await sdk.customer.first({
            select: {addresses: true, primaryAddressId: true}
        });

        if (customer) {
            expect(resolvePrimaryAddress<Address>(customer)).toBeObject();
        }
    });
});
