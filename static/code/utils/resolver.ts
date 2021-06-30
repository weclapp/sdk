interface IDObject {
    id: string;
}

/**
 * Resolves the primary address.
 * @param party Source, can be a customer, party, lead or any similar type.
 */
export const resolvePrimaryAddress = <T extends IDObject>(
    party: {primaryAddressId: string; addresses: T[];}
): T | null => {
    const {primaryAddressId, addresses} = party;
    return addresses.find(v => v.id === primaryAddressId) ?? null;
};

/**
 * Resolves the primary contact.
 * @param party Source, can be a customer, party, lead or any similar type.
 */
export const resolvePrimaryContact = <T extends IDObject>(
    party: {primaryContactId: string; contacts: T[];}
): T | null => {
    const {primaryContactId, contacts} = party;
    return contacts.find(v => v.id === primaryContactId) ?? null;
};
