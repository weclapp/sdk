import {Customer} from '@sdk/node';
import 'jest-extended';
import {sdk} from '../utils';
import {createCustomer, deleteCustomer} from './utils/customer';

describe('.update', () => {
    let customer: Customer;

    beforeAll( async () => {
        customer = await createCustomer('Foo');
    });
    afterAll(async () => {
        await deleteCustomer(customer.id!);
    });

    it('Should update a customer', async () => {
        const customerFound = await sdk.customer.unique(customer.id!);

        if (!customerFound) {
            throw new Error('Customer not found');
        }

        const updated = await sdk.customer.update(customerFound.id!, {
            company: 'Hello world'
        }) as (Customer | null);

        expect(updated?.company).toEqual('Hello world');
    });
});
