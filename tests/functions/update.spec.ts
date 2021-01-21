import {Customer} from '@sdk/src/types.models';
import 'jest-extended';
import {sdk} from '../utils';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe('.update', () => {

    it('Should update a customer', async () => {
        const customer = await sdk.customer.unique('1949325');
        expect(customer).toBeObject();

        const updated = await sdk.customer.update(customer!.id, {
            company: 'Hello world'
        });

        expect(updated).toBeObject();
        expect((updated as Customer).company).toEqual('Hello world');

        await sdk.customer.update(customer!.id, {
            company: customer!.company
        });
    });
});
