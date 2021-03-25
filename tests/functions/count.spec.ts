import 'jest-extended';
import {sdk} from '../utils';

describe('.count', () => {

    it('Should fetch the total amount of customers, articles and sales-orders', async () => {
        expect(await sdk.article.count()).toBeNumber();
        expect(await sdk.customer.count()).toBeNumber();
        expect(await sdk.salesOrder.count()).toBeNumber();
    });

    it('Should work with filters', async () => {
        expect(await sdk.customer.count({
            customerNumber: {GE: 5}
        })).toBeNumber();

        expect(await sdk.article.count({
            active: {EQ: true}
        })).toBeNumber();

        expect(await sdk.opportunity.count({
            id: {GE: Math.floor(Math.random() * 10000)}
        })).toBeNumber();
    });
});
