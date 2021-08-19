import 'jest-extended';
import * as Joi from 'joi';
import {sdk, testSchema} from '../utils';
import {Article, Customer} from '@sdk/node';
import {createArticle, deleteArticle} from './utils/article';
import {createCustomer, deleteCustomer} from './utils/customer';

describe('.unique', () => {
    let customer: Customer;
    let createdArticle: Article;

    beforeAll( async () => {
        customer = await createCustomer();
        createdArticle = await createArticle();
    });
    afterAll(async () => {
        await deleteCustomer(customer.id!);
        await deleteArticle(createdArticle.id!, createdArticle.unitId);
    });

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

    it('Should only fetch article with unit reference', async () => {
        testSchema(
            await sdk.article.unique(createdArticle.id!, {
                include: ['unitId']
            }),
            Joi.object({
                data: Joi.object(),
                references: Joi.alternatives(
                  Joi.object(),
                  Joi.valid(null)
                )
            })
        );
    });
});
