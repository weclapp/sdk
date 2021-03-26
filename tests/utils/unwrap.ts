import {Customer} from '@sdk/node';
import {unwrap} from '@sdk/utils';
import 'jest-extended';
import {sdk} from '../utils';

describe('unwrap', () => {

    it('Should unwrap a raw request', async () => {
        const customer = (await sdk.raw<{result: Customer[]}>('/customer').then(unwrap)) as Customer[];
        expect(customer).toBeArray();
    });
});
