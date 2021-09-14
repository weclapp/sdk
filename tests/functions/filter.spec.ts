import 'jest-extended';
import {sdk, testSchema} from '../utils';
import {createArticle, deleteArticle} from '@tests/functions/utils/article';
import {Article, ARTICLE_ARTICLE_TYPE} from '@sdk/node';
import * as Joi from 'joi';

describe('filter entities', () => {
    let createdArticle: Article;
    beforeAll(async () => {
        createdArticle = await createArticle({articleType: ARTICLE_ARTICLE_TYPE.BASIC});
    });
    afterAll(async () => {
        await deleteArticle(createdArticle.id!, createdArticle.unitId);
    });

    it('Should allow nested filtering also with references from article', async () => {
        testSchema(
          await sdk.article.some({
              filter: {id: {EQ: createdArticle.id}, unit: {id: {EQ: createdArticle.unitId}}, articleType: {EQ: ARTICLE_ARTICLE_TYPE.BASIC}}
          }),
          Joi.array().min(1)
        );
    });
});
