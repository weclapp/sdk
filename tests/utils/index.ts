import {Customer} from '@sdk/node';
import {params, unwrap} from '@sdk/utils';
import 'jest-extended';
import {sdk} from '../utils';

describe('Utilities', () => {

    it('Should unwrap a raw request', async () => {

        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const customer = await sdk.raw<Customer[]>('/customer')
            .then(unwrap);

        expect(customer).toBeArray();
    });

    it('Should build an url', () => {
        expect(params('/customer', {
            'page': 25,
            'pageSize': undefined,
            'id-eq': ['123', '456']
        })).toEqual(`/customer?page=${encodeURIComponent('25')}&id-eq=${encodeURIComponent('[123,456]')}`);
    });
});
