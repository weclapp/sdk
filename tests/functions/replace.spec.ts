import {Customer} from '@sdk/node';
import 'jest-extended';
import {sdk} from '../utils';
import {createCustomer, deleteCustomer} from './utils/customer';

describe('.replace', () => {
    let customer: Customer;

    beforeAll( async () => {
        customer = await createCustomer('Foo');
    });
    afterAll(async () => {
        await deleteCustomer(customer.id!);
    });

    it('Should replace a customer with a modified version', async () => {
        let customerFound = await sdk.customer.unique(customer.id!);

        if (!customerFound) {
            throw new Error('Customer not found');
        }

        // Modify company
        const originalCompany = customerFound?.company ?? '';
        const company = `${originalCompany} (modified)`;
        customerFound = await sdk.customer.replace({
            ...customerFound,
            company
        });

        expect(customerFound.company).toEqual(company);

        // Change back
        customerFound = await sdk.customer.replace({
            ...customerFound,
            company: originalCompany
        });

        expect(customerFound.company).toEqual(originalCompany);
    });
});
