import 'jest-extended';
import {createArticle, deleteArticle} from './utils/article';

describe('.create,.delete', () => {

    it('Should create a new article and delete it afterwards', async () => {
        const article = await createArticle();
        expect(article).toBeObject();
        await deleteArticle(article.id!, article.unitId);
    });
});
