import {sdk} from '@tests/utils';
import {Article} from '@sdk/node';
import {readFile} from 'fs-extra';
import {resolve} from 'path';
import {createArticle, deleteArticle} from './utils/article';

describe('special functions', () => {
    let article: Article;

    beforeAll(async () => {
       article = await createArticle();
    });
    afterAll(async () => {
        await deleteArticle(article.id!, article.unitId);
    });

    it('Should get special function extraInfoForApp for article', async () => {
        const extraInfoForApp = await sdk.article.extraInfoForAppById(article.id!);
        expect(extraInfoForApp).toBeObject();
    });

    it('Should use special post function to upload image for article', async () => {
        const articleImage = await sdk.article.uploadArticleImageById(
          article.id!,
          await readFile(resolve(__dirname, '../fixtures/logo.png')),
          {
              name: 'testUploadSDK'
          }
        );
        expect(articleImage).toBeObject();
    });
});
