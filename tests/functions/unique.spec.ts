import 'jest-extended';
import * as Joi from 'joi';
import {sdk, testSchema} from '../utils';
import {Customer} from '@sdk/node';
import {createCustomer, deleteCustomer} from './utils/customer';

describe('.unique', () => {
    let customer: Customer;

    beforeAll( async () => {
        customer = await createCustomer();
    })
    afterAll(async () => {
        await deleteCustomer(customer.id!)
    })

    it('Should fetch a single customer', async () => {
        const customerFound = await sdk.customer.unique(customer.id!);
        expect(customerFound).toBeObject();
        expect(customerFound?.insolvent).toBeBoolean();
        expect(customerFound?.id).toBeString();
    });

    it('Should only fetch return selected properties', async () => {
        testSchema(
            await sdk.customer.unique(customer.id!, {
                select: {
                    firstName: true,
                    email: true,
                    id: true
                }
            }),
            Joi.object({
                firstName: Joi.string().optional(),
                email: Joi.string().optional(),
                id: Joi.string().required()
            })
        );
    });
});
