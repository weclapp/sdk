import {getService} from '@tests/utils/service';
import {assert, test} from 'vitest';

test('Get the total amount of parties', async () => {
    const party = getService('party');
    assert.isNumber(await party.count());
});
