import {params, unwrap} from '@sdk/utils';
import 'jest-extended';
import {sdk} from '../utils';
import {Customer} from "@/sdk";

describe('Utilities', () => {

    it('Should unwrap a raw request', async () => {
        const customer = (await sdk.raw<{ result: Customer[] }>('/customer').then(unwrap)) as Customer[];
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
