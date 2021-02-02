import {Article} from '@sdk/node';
import 'jest-extended';
import {sdk} from '../utils';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe('.update', () => {

    it('Should update an article', async () => {
        const first = await sdk.article.first();
        const article = await sdk.article.unique(first!.id);
        expect(article).toBeObject();

        const updated = await sdk.article.update(article!.id, {
            name: 'Hello world'
        });

        expect(updated).toBeObject();
        expect((updated as Article).name).toEqual('Hello world');

        await sdk.article.update(article!.id, {
            name: article!.name
        });
    });
});
