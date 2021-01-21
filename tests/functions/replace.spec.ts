import 'jest-extended';
import {sdk} from '../utils';

describe('.replace', () => {

    /* eslint-disable */
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
        }) as any;

        expect(customer.company).toEqual(company);

        // Change back
        customer = await sdk.customer.replace(customer.id, {
            ...customer,
            company: originalCompany
        }) as any;

        expect(customer.company).toEqual(originalCompany);
    });
});
