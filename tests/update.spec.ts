import {PartyType} from '@sdk/node';
import {getService} from '@tests/utils/service';
import {assert, test} from 'vitest';

test('Update a party', async () => {
    const service = getService('party');

    const party = await service.create({
        partyType: PartyType.ORGANIZATION,
        company: 'Corporation'
    });

    const updated = await service.update(party.id as string, {
        company: 'Update Corporation'
    });

    assert.equal(updated.company, 'Update Corporation');
});
