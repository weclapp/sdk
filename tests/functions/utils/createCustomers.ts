import {sdk} from '@tests/utils';
import {CreateCustomer, Customer} from '@sdk/node';

/**
 * Helper function to temporarily create a set of customers.
 * All customers created are automatically removed after the tests run.
 * @param companies List of names for the company.
 * @param created Optional callback to store the customer-ids.
 */
export const createCustomers = (
    companies: (string | CreateCustomer)[],
    created?: (ids: string[]) => void
): void => {
    let customerIds: string[];

    beforeAll(async () => {
        customerIds = await Promise.all(
            companies.map(v => sdk.customer.create({
                // TODO: Only company and partyType are actually needed!
                company: v,
                partyType: 'ORGANIZATION'
            } as CreateCustomer) as Promise<Customer>)
        ).then(customers => customers.map(v => v.id));

        created?.(customerIds);
    });

    afterAll(() => customerIds.map(id => sdk.customer.delete(id)));
};
