import {Filterable, Selectable} from './types.base';
import {WeclappResponse} from './types.api';

/**
 * Unwraps the result property from a weclapp response.
 * @param res The response
 */
export const unwrap = <T>(res: WeclappResponse<T>): T => res.result;

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

/**
 * Flattens a selectable, possibly nested, record.
 * @param obj Object.
 * @param base Recursive base property.
 */
export const flattenSelectable = <T = any>(obj: Selectable<T>, base = ''): string[] => {
    const res = [];

    for (const [key, value] of Object.entries(obj)) {
        if (value) {
            const path = base + key;

            if (typeof value === 'object') {
                res.push(...flattenSelectable(value as Selectable<T>, `${path}.`));
            } else {
                res.push(path);
            }
        }
    }

    return res;
};

/**
 * Flattens a filterable, possibly nested, record.
 * @param obj Object.
 * @param base Recursive base property.
 */
export const flattenFilterable = <T = any>(obj: Filterable<T>, base = ''): Map<string, string> => {
    const props = new Map<string, string>();

    for (const [key, val] of Object.entries(obj)) {

        // Special OR operator
        if (key === 'OR' && !base && Array.isArray(val)) {
            for (const or of val) {
                for (const [key, prop] of flattenFilterable(or)) {
                    props.set(`or-${key}`, prop);
                }
            }
            continue;
        }

        // Normal comparison
        const operator = key.replace('_', '').toLowerCase();
        if (Array.isArray(val)) {
            props.set(`${base}-${operator}`, `[${val}]`);
        } else if (val !== null && typeof val === 'object') {
            const currentPath = base ? `${base}.${key}` : key;

            for (const [key, prop] of flattenFilterable(val, currentPath)) {
                props.set(key, prop);
            }
        } else if (val === null && ['EQ', 'NE'].includes(key)) {

            // Map to -null/-notnull operators.
            props.set(`${base}-${key === 'EQ' ? 'null' : 'notnull'}`, '1');
        } else if (val !== undefined) {
            props.set(`${base}-${operator}`, String(val));
        }
    }

    return props;
};
