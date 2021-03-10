import 'jest-extended';
import {sdk} from '../utils';
import {Article} from "@/sdk";

describe('.create,.delete', () => {

    it('Should create a new article and delete it afterwards', async () => {
        const unit = await sdk.unit.first();
        const article = await sdk.article.create({
            name: 'Keyboard',
            articleNumber: 'XYZ123',
            unitId: unit?.id
        }) as Article;

        expect(article).toBeObject();
        await sdk.article.delete(article.id);
    });
});
