import 'jest-extended';
import Joi from 'joi';
import {sdk, testSchema} from '../utils';

describe('.first', () => {

    it('Should return the first customer it can find', async () => {
        expect(await sdk.customer.first()).toBeObject();
    });

    it('Should return the first non-blocked customer', async () => {
        expect(await sdk.customer.first({
            filter: {blocked: {eq: false}}
        })).toBeObject();
    });

    it('Should select nested properties', async () => {
        testSchema(
            await sdk.customer.first({
                select: {
                    id: true,
                    blocked: true,
                    salesPartner: true,
                    contacts: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }),
            Joi.object({
                id: Joi.string(),
                blocked: Joi.boolean(),
                salesPartner: Joi.boolean(),
                contacts: Joi.array().items(
                    Joi.object({
                        id: Joi.string(),
                        firstName: Joi.string(),
                        lastName: Joi.string()
                    })
                )
            })
        );
    });

    it('Should select whole nested properties', async () => {
        testSchema(
            await sdk.customer.first({
                select: {
                    contacts: true
                }
            }),
            Joi.object({
                contacts: Joi.array().items(Joi.object())
            })
        );
    });
});
