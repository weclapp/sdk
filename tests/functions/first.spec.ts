import 'jest-extended';
import Joi from 'joi';
import {sdk, testSchema} from '../utils';
import {Article, Comment} from '@sdk/node';
import {createArticle, deleteArticle} from '@tests/functions/utils/article';
import {generateRandomName} from '@tests/functions/utils/generateRandomName';

describe('.first', () => {
    let createdArticle: Article;
    let createdComment: Comment;

    beforeAll(async () => {
        createdArticle = await createArticle();
        createdComment = await sdk.comment.create({
            comment: generateRandomName(),
            entityId: createdArticle.id!,
            entityName: 'article'
        });
    });
    afterAll(async() => {
        await sdk.comment.delete(createdComment.id!);
        await deleteArticle(createdArticle.id!);
    });

    it('Should return the first customer it can find', async () => {
        expect(await sdk.customer.first()).toBeObject();
    });

    it('Should return the first non-blocked customer', async () => {
        expect(await sdk.customer.first({
            filter: {blocked: {EQ: false}}
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

    it('Should work with custom attributes', async () => {
        expect(await sdk.customer.first({
            filter: {
                'customAttribute.entityId-eq': 4
            }
        })).toBeObject();
    });

    it('Should need required params to find comments', async() => {
        expect(await sdk.comment.first({
            params: {entityName: 'article', entityId: createdArticle.id!}
        })).toBeObject();
    });
});
