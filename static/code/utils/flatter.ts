import {Filterable, Selectable, Sortable} from '../types.base';

/**
 * Flattens a selectable, possibly nested, record.
 * @param obj Object.
 * @param base Recursive base property.
 */
export const flattenSelectable = <T = any>(obj: Selectable<T>, base = ''): string[] => {
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

export const flattenSortable = <T = any>(obj: Sortable<T>): string[] => {
    return Object.entries(obj)
      .filter(([,value]) => value)
      .map(([key, value]) => `${value === 'desc' ? '-' : ''}${key}`);
}
