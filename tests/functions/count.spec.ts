import 'jest-extended';
import {sdk} from '../utils';

describe('.count', () => {
    for (const [entity, obj] of Object.entries(sdk)) {
        const count = (obj as any)?.count;

        if (count) {
            it(`Should return the total amount of ${entity}s`, async () => {
                expect(await (sdk as any)[entity].count()).toBeNumber();
            });
        }
    }

    it('Should work with filters', async () => {
        expect(await sdk.customer.count({
            'salesPartner-eq': true
        })).toBeNumber();

        expect(await sdk.article.count({
            'active-eq': true
        })).toBeNumber();

        expect(await sdk.opportunity.count({
            'id-ge': String(Math.floor(Math.random() * 10000))
        })).toBeNumber();
    });
});
