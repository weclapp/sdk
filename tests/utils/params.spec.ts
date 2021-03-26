import {params} from '@sdk/utils';
import 'jest-extended';

describe('Params', () => {

    it('Should build an url', () => {
        expect(params('/customer', {
            'page': 25,
            'pageSize': undefined,
            'id-eq': ['123', '456']
        })).toEqual(`/customer?page=${encodeURIComponent('25')}&id-eq=${encodeURIComponent('[123,456]')}`);
    });
});
