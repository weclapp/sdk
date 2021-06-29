import {sdk} from '@tests/utils';
import {Article, Unit} from '@sdk/node';
import {readFile} from 'fs-extra';
import {resolve} from 'path';
import {generateRandomName} from './utils/generateRandomName';

describe('special functions', () => {
    let article: Article;
    let unit: Unit;
    beforeAll(async () => {
        unit = await sdk.unit.create({
            name: generateRandomName()
        }) as Unit;

        article = await sdk.article.create({
            name: generateRandomName(),
            articleNumber: generateRandomName(),
            unitId: unit.id
        }) as Article;
    });

    afterAll(async () => {
        await sdk.article.delete(article.id!);
        await sdk.unit.delete(unit.id!);
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
