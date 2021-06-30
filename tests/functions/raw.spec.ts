import {Customer, Method, WeclappResponse} from '@sdk/node';
import {unwrap} from '@sdk/utils';
import {sdk} from '@tests/utils';
import {readFile} from 'fs-extra';
import 'jest-extended';
import {resolve} from 'path';
import {createCustomer, deleteCustomer} from './utils/customer';

describe('.raw', () => {
    let customer: Customer;
    beforeAll(async () => {
        customer = await createCustomer();
    })
    afterAll(async () => {
        await deleteCustomer(customer.id!)
    })

    it('Should be possible to make a raw request', async () => {
        expect(
            await sdk.raw<WeclappResponse<number>>('/customer/count')
                .then(unwrap)
        ).toBeNumber();
    });

    it('Should be possible to create a new customer', async () => {
        const customer = await sdk.raw<Customer>('/customer', {
            method: Method.POST,
            body: {
                company: 'Baz',
                partyType: 'ORGANIZATION'
            }
        });

        expect(customer).toBeObject();
        await sdk.customer.delete(customer.id!);
    });

    it('Should be possible to upload binary data or documents', async () => {
        expect(
            await sdk.raw<WeclappResponse<Document>>('/document/upload', {
                method: Method.POST,
                body: await readFile(resolve(__dirname, '../fixtures/logo.png')),
                query: {
                    entityName: 'customer',
                    entityId: customer.id,
                    name: 'logo.png'
                }
            }).then(unwrap)
        ).toBeObject();
    });
});
