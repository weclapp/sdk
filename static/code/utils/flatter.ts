import {Filterable, Selectable, Sortable} from '../types.base';

export const flattenSelectable = <T>(obj: Selectable<T> = {}, base = ''): string[] => {
    const res: string[] = [];

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

export const flattenFilterable = <T, R = undefined>(obj: Filterable<T, R> = {}, base = ''): Map<string, string> => {
    const props = new Map<string, string>();

    for (const [key, val] of Object.entries(obj)) {

        // Special OR operator
        if (key === 'OR' && !base && Array.isArray(val)) {
            for (const [i, orGroup] of Object.entries(val)) {
                for (const or of orGroup) {
                    for (const [key, prop] of flattenFilterable(or)) {
                        props.set(`or${i === '0' ? '' : i}-${key}`, prop);
                    }
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

            for (const [key, prop] of flattenFilterable(val as Filterable<T, R>, currentPath)) {
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

export const flattenSortable = <T, R = undefined>(obj: Sortable<T, R> = {}, base = ''): string[] => {
    const res: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        if (value) {
            const path = base + key;

            if (typeof value === 'object') {
                res.push(...flattenSortable(value as Sortable<T, R>, `${path}.`));
            } else {
                const direction = value === 'desc' ? '-': '';
                res.push(`${direction}${path}`);
            }
        }
    }

    return res;
}
