import 'jest-extended';
import {sdk} from '../utils';

describe('.count', () => {

    it('Sould fetch the total amount of customers, articles and sales-orders', async () => {
        expect(await sdk.article.count()).toBeNumber();
        expect(await sdk.customer.count()).toBeNumber();
        expect(await sdk.salesOrder.count()).toBeNumber();
    });

    it('Should work with filters', async () => {
        expect(await sdk.customer.count({
            'customerNumber-in': ['1039', '1036']
        })).toBeNumber();

        expect(await sdk.article.count({
            'active-eq': true
        })).toBeNumber();

        expect(await sdk.opportunity.count({
            'id-ge': String(Math.floor(Math.random() * 10000))
        })).toBeNumber();
    });
});
