import {FilterObject} from './types.base';

/**
 * Unwraps the result property from a weclapp response.
 * @param res The response
 */
export const unwrap = (res: {result: unknown}): any => res.result;

/**
 * Builds a search query base on the given object
 * @param url Base url
 * @param params Search params
 * @returns {string} The whole url string
 */
export const params = (url: string, params: Record<string, unknown> = {}): string => {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            search.append(key, Array.isArray(value) ? `[${value.join(',')}]` : String(value));
        }
    }

    const query = search.toString();
    return query ? `${url}?${query}` : url;
};

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

export type SelectableRecord = {
    [key: string]: undefined | boolean | SelectableRecord;
}

/**
 * Flattens a selectable, possibly nested, record
 * @param obj Object
 * @param base Recursive base property
 */
export const flattenSelectable = (obj: SelectableRecord, base = ''): string[] => {
    return Object.entries(obj)
        .filter(v => v[1])
        .map(([key, value]) => {
            const path = base + key;
            return typeof value === 'object' ? flattenSelectable(value, `${path}.`) : path;
        })
        .flat();
};


export type FilterableRecord = {
    [key: string]: undefined | FilterableRecord | FilterObject;
}

/**
 * Flattens a filterable, possibly nested, record.
 * @param obj Object.
 * @param base Recursive base property.
 */
export const flattenFilterable = (obj: FilterableRecord, base = ''): Map<string, string> => {
    const props = new Map<string, string>();

    for (const [key, val] of Object.entries(obj)) {
        if (Array.isArray(val)) {
            props.set(`${base}-${key}`, `[${val}]`);
        } else if (val !== null && typeof val === 'object') {
            const path = base ? `${base}.${key}` : key;

            for (const [key, prop] of flattenFilterable(val as FilterableRecord, path)) {
                props.set(key, prop);
            }
        } else if (val !== undefined) {
            props.set(`${base}-${key}`, String(val));
        }
    }

    return props;
};
