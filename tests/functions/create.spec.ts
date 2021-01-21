import 'jest-extended';
import {Article} from '@sdk/src/types.models';
import {sdk} from '../utils';

describe('.create,.delete', () => {

    it('Should create a new article and delete it afterwards', async () => {
        const article = await sdk.article.create({
            name: 'Hello world',
            unitId: '108'
        });

        // TODO: Do not cast to object after swagger.json is fixed
        // TODO: Add more tests after required types / return types are fixed
        expect(article).toBeObject();
        await sdk.article.delete((article as Article).id);
    });
});
