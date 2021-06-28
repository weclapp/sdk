import 'jest-extended';
import {Unit} from '@sdk/node';
import {sdk} from '../utils';
import {Article} from "@sdk/node";

describe('.create,.delete', () => {

    it('Should create a new article and delete it afterwards', async () => {
        const unit = await sdk.unit.create({
            name: 'Foobar'
        }) as Unit;

        const article = await sdk.article.create({
            name: 'Keyboard',
            articleNumber: 'XYZ123',
            unitId: unit.id
        }) as Article;

        expect(article).toBeObject();
		await sdk.article.delete(article.id!);
        await sdk.unit.delete(unit.id!);
    });
});
