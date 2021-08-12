import {sdk} from '@tests/utils';
import {Customer, CUSTOMER_PARTY_TYPE} from '@sdk/node';
import {generateRandomName} from '@tests/functions/utils/generateRandomName';

export const createRandomIds = (amount: number, prefix = 'R-'): string[] =>
    new Array(amount).fill(0).map(() => prefix + String(Math.floor(Math.random() * 1e14)));

export const createCustomers = async (
    companies: string[]
): Promise<Customer[]> => {
    return await Promise.all(
      companies.map(v => sdk.customer.create({
          // TODO: Only company and partyType are actually needed!
          company: v,
          partyType: CUSTOMER_PARTY_TYPE.ORGANIZATION
      })));
};

export const deleteCustomers = async (ids: string[]): Promise<void> => {
    await Promise.all(
      ids.map(id => sdk.customer.delete(id))
    );
};

export const createCustomer = async (companyName?: string): Promise<Customer> => {
    return await sdk.customer.create({
        company: companyName ?? generateRandomName(),
        partyType: CUSTOMER_PARTY_TYPE.ORGANIZATION
    });
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
    await sdk.customer.delete(customerId);
};
