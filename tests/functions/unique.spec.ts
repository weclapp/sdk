import {createCustomers} from '@tests/functions/utils/createCustomers';
import 'jest-extended';
import * as Joi from 'joi';
import {sdk, testSchema} from '../utils';

describe('.unique', () => {
    let customerId: string;

    createCustomers(['Foo'], ids => customerId = ids[0]);

    it('Should fetch a single customer', async () => {
        const customer = await sdk.customer.unique(customerId);

        expect(customer).toBeObject();
        expect(customer?.insolvent).toBeBoolean();
        expect(customer?.id).toBeString();
    });

    it('Should only fetch return selected properties', async () => {
        testSchema(
            await sdk.customer.unique(customerId, {
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
