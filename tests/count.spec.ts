import 'jest-extended';
import {weclapp} from '../sdk/node';

describe('.count', () => {
    const api = weclapp({
        apiKey: process.env.TEST_API_KEY as string,
        domain: process.env.TEST_DOMAIN as string
    });

    for (const [entity, obj] of Object.entries(api)) {
        const count = (obj as any)?.count;

        if (count) {
            it(`Should return the total amount of ${entity}s`, async () => {
                expect(await (api as any)[entity].count()).toBeNumber();
            });
        }
    }

    it('Should work with filters', async () => {
        expect(await api.customer.count({
            'salesPartner-eq': true
        })).toBeNumber();

        expect(await api.article.count({
            'active-eq': true
        })).toBeNumber();

        expect(await api.opportunity.count({
            'id-ge': String(Math.floor(Math.random() * 10000))
        })).toBeNumber();
    });
});
