import 'jest-extended';
import {createArticle, deleteArticle} from './utils/article';
import {ARTICLE_ARTICLE_TYPE} from '@sdk/node';

describe('.create,.delete', () => {

    it('Should create a new article and delete it afterwards', async () => {
        const article = await createArticle();
        expect(article).toBeObject();
        await deleteArticle(article.id!, article.unitId);
    });
    it('Should create a new article with type basic', async () => {
        const article = await createArticle({articleType: ARTICLE_ARTICLE_TYPE.BASIC});
        expect(article.articleType).toBe(ARTICLE_ARTICLE_TYPE.BASIC);
        await deleteArticle(article.id!, article.unitId);
    });
});
