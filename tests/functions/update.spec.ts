import {Customer} from '@sdk/node';
import {createCustomers} from '@tests/functions/utils/createCustomers';
import 'jest-extended';
import {sdk} from '../utils';

describe('.update', () => {
    let customerId: string;

    createCustomers(['Foo'], ids => customerId = ids[0]);

    it('Should update a customer', async () => {
        const customer = await sdk.customer.unique(customerId);

        if (!customer) {
            throw new Error('Customer not found');
        }

        const updated = await sdk.customer.update(customerId, {
            company: 'Hello world'
        }) as (Customer | null);

        expect(updated?.company).toEqual('Hello world');
        await sdk.customer.update(customerId, {
            company: customer.company
        });
    });
});
