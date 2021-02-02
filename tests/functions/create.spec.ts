import {Party} from '@/sdk/node';
import 'jest-extended';
import {sdk} from '../utils';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe('.create,.delete', () => {

    it('Should create a new article and delete it afterwards', async () => {
        const unit = await sdk.unit.first();
        const contact = await sdk.article.create({
            name: 'Keyboard',
            unitId: unit!.id
        });

        expect(contact).toBeObject();
        await sdk.article.delete((contact as Party).id);
    });
});
