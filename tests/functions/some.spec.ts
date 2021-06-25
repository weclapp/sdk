import {createCustomers, createRandomIds} from '@tests/functions/utils/createCustomers';
import 'jest-extended';
import * as Joi from 'joi';
import {sdk, testSchema} from '../utils';

describe('.some', () => {
    const companies = createRandomIds(4);
    createCustomers(companies);

    it('Should return a list of customers', async () => {
        const customers = await sdk.customer.some();
        expect(customers).toBeArray();
    });

    it('Should return a specific amount of customers from the second page', async () => {
        const customers = await sdk.customer.some({
            page: 2,
            pageSize: 3
        });

        expect(customers).toBeArrayOfSize(3);
    });

    it('Should return only the id\'s of customers', async () => {
        const customers = await sdk.customer.some({
            pageSize: 5,
            select: {id: true}
        });

        testSchema(customers, Joi.array().items(Joi.object({
            id: Joi.string()
        })));
    });

    it('Should return only the id\'s of customers', async () => {
        const customers = await sdk.customer.some({
            pageSize: 5,
            select: {id: true}
        });

        testSchema(customers, Joi.array().items(Joi.object({
            id: Joi.string()
        })));
    });

    it('Should serialize optional fields', async () => {

        // Test with serialization
        testSchema(
            await sdk.customer.some({
                serialize: true,
                select: {id: true, birthDate: true},
                pageSize: 5
            }),
            Joi.array().items(Joi.object({
                id: Joi.string(),
                birthDate: Joi.alternatives(
                    Joi.string(),
                    Joi.valid(null)
                )
            }))
        );

        // Test without serialization
        testSchema(
            await sdk.customer.some({
                select: {id: true, birthDate: true},
                pageSize: 5
            }),
            Joi.array().items(Joi.object({
                id: Joi.string(),
                birthDate: Joi.string().optional()
            }))
        );
    });

    it('Should return an object with include responsibleUserId', async () => {
        testSchema(
            await sdk.customer.some({
                select: {id: true},
                include: ['responsibleUserId']
            }),
            Joi.object({
                data: Joi.array(),
                references: Joi.alternatives(
                    Joi.object(),
                    Joi.valid(null)
                )
            })
        );
    });

    it('Should work with filters', async () => {
        testSchema(
            await sdk.customer.some({
                select: {id: true},
                include: ['responsibleUserId'],
                filter: {id: {GT: 25}}
            }),
            Joi.object({
                data: Joi.array(),
                references: Joi.alternatives(
                    Joi.object(),
                    Joi.valid(null)
                )
            })
        );
    });

    it('Should find a company by it\'s name', async () => {
        expect(
            await sdk.customer.first({
                select: {company: true},
                filter: {company: {EQ: 'Bazzam'}}
            })
        ).toEqual({
            company: 'Bazzam'
        });
    });

    it('Should select two companies by an OR', async () => {
        expect(
            await sdk.customer.some({
                select: {company: true},
                filter: {
                    OR: [
                        {company: {EQ: companies[0]}},
                        {company: {IN: [companies[1]]}}
                    ]
                }
            })
        ).toBeArrayOfSize(2);
    });
});
