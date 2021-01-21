import {Customer} from '@/sdk/node';
import 'jest-extended';
import {sdk} from '../utils';

describe('.replace', () => {

    it('Should replace a customer with a modified version', async () => {
        let [customer] = await sdk.customer.some({
            filter: {
                'customerNumber-eq': '8811'
            }
        });

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
