import {indent} from '@utils/indent';
import {isObject} from '@utils/openapi/guards';

export interface ObjectDefinition {
    [key: string | number | symbol]: string | number | undefined | null | boolean | ObjectDefinition;
}

export const generateObject = (values: ObjectDefinition): string => {
    const body = [];

    for (const [name, value] of Object.entries(values)) {
        if (value!== undefined) {
            body.push(`${name}: ${isObject(value) ? generateObject(value) : value}`);
        }
    }

    return body.length ? `{\n${indent(body.join(',\n'))}\n}` : `{}`;
};
