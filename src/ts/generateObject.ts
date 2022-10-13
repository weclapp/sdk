import {indent} from '@utils/indent';
import {isObject} from '@utils/openapi/guards';

export interface ObjectDefinition {
    [key: string | number | symbol]: string | number | undefined | null | boolean | ObjectDefinition;
}

export const generateObject = (values: ObjectDefinition): string => {
    const body = [];

    for (const [name, value] of Object.entries(values)) {
        if (value === undefined) {
            continue;
        }

        if (isObject(value)) {
            const str = generateObject(value);

            if (str.length > 2) {
                body.push(`${name}: ${str}`);
            }
        } else {
            body.push(`${name}: ${String(value)}`);
        }
    }

    return body.length ? `{\n${indent(body.join(',\n'))}\n}` : `{}`;
};
