import 'jest-extended';
import * as Joi from 'joi';
import {sdk, testSchema} from '../utils';

describe('.unique', () => {
    it('Should fetch a single customer', async () => {
        const customer = await sdk.customer.unique('508692');

        expect(customer).toBeObject();
        expect(customer!.insolvent).toBeBoolean();
        expect(customer!.id).toBeString();
    });

    it('Should only fetch return selected properties', async () => {
        const customer = await sdk.customer.unique('508692', {
            select: {
                firstName: true,
                email: true,
                id: true
            }
        });

        testSchema(customer, Joi.object({
            firstName: Joi.string().optional(),
            email: Joi.string().optional(),
            id: Joi.string().required()
        }));
    });
});
