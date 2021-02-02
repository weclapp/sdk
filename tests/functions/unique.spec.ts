import 'jest-extended';
import * as Joi from 'joi';
import {sdk, testSchema} from '../utils';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe('.unique', () => {
    it('Should fetch a single customer', async () => {
        const first = await sdk.customer.first();
        const customer = await sdk.customer.unique(first!.id);

        expect(customer).toBeObject();
        expect(customer!.insolvent).toBeBoolean();
        expect(customer!.id).toBeString();
    });

    it('Should only fetch return selected properties', async () => {
        const first = await sdk.customer.first();

        testSchema(
            await sdk.customer.unique(first!.id, {
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
