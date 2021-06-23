import {Address, Contact} from '@sdk/node';
import {resolvePrimaryAddress, resolvePrimaryContact} from '@sdk/utils';
import 'jest-extended';
import Joi from 'joi';
import {sdk, testSchema} from '../utils';

describe('Resolver', () => {

    it('Should resolve the primary contact', async () => {
        const customer = await sdk.customer.first({
            select: {contacts: true, primaryContactId: true}
        });

        if (customer) {
            testSchema(
                resolvePrimaryContact<Contact>(customer),
                Joi.alternatives(Joi.object(), null)
            );
        }
    });

    it('Should resolve the primary address', async () => {
        const customer = await sdk.customer.first({
            select: {addresses: true, primaryAddressId: true}
        });

        if (customer) {
            testSchema(
                resolvePrimaryAddress<Address>(customer),
                Joi.alternatives(Joi.object(), null)
            );
        }
    });
});
