import {Customer} from '@sdk/node';
import 'jest-extended';
import {createCustomers} from '@tests/functions/utils/createCustomers';
import {sdk} from '../utils';

describe('.replace', () => {
    let customerId: string;

    createCustomers(['Foo'], ids => customerId = ids[0]);

    it('Should replace a customer with a modified version', async () => {
        let customer = await sdk.customer.unique(customerId);

        if (!customer) {
            throw new Error('Customer not found');
        }

        // Modify company
        const originalCompany = customer.company;
        const company = `${originalCompany} (modified)`;
        customer = await sdk.customer.replace(customer.id, {
            ...customer,
            company
        }) as Customer;

        expect(customer.company).toEqual(company);

        // Change back
        customer = await sdk.customer.replace(customer.id, {
            ...customer,
            company: originalCompany
        }) as Customer;

        expect(customer.company).toEqual(originalCompany);
    });
});
