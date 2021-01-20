import 'jest-extended';
import {sdk} from '../utils';

describe('.first', () => {

    it('Should return the first customer it can find', async () => {
        const customers = await sdk.customer.first();
        expect(customers).toBeObject();
    });

    it('Should return the first non-blocked customer', async () => {
        const customers = await sdk.customer.first({
            filter: {'blocked-eq': false}
        });

        expect(customers).toBeObject();
    });
});
