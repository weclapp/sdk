import {Customer} from '../../sdk/src/types.models';
import {sdk} from '../utils';
import 'jest-extended';

describe('.update', () => {

    it('Should update a customer', async () => {
        // TODO: Grab first customer, currently not possible because internal references are invalid
        const customer = await sdk.customer.unique('1949325');
        const updated = await sdk.customer.update(customer.id, {
            company: 'Hello world'
        });

        expect((updated as Customer).company).toEqual('Hello world');

        await sdk.customer.update(customer.id, {
            company: customer.company
        });
    });
});
