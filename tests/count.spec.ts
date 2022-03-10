import {getService} from '@tests/utils/service';
import {assert, test} from 'vitest';

test('Get the total amount of parties', async () => {
    assert.isNumber(await getService('party').count());
});

test('Get the total amount of contacts', async () => {
    assert.isNumber(await getService('contact').count());
});
