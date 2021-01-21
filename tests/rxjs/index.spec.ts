import 'jest-extended';
import {sdkRx} from '../utils';

describe('RxJS', () => {

    it('Should fetch the total amount of customers', done => {
        sdkRx.customer.count().subscribe(total => {
            expect(total).toBeNumber();
            done();
        });
    });

    it('Should fetch a customer', done => {
        sdkRx.customer.first().subscribe(customer => {
            expect(customer).toBeObject();
            done();
        });
    });
});
