import {indent} from '@utils/indent';

type Value = Record<string, string> | string;

export const generateObject = (values: Value[] | Value): string => {
    const body = [];

    for (const value of Array.isArray(values) ? values : [values]) {
        if (typeof value === 'string') {
            body.push(value);
        } else {
            body.push(...Object.entries(value).map(val => `${val[0]}: ${val[1]}`));
        }
    }

    return `{\n${indent(body.join(',\n'))}\n}`;
};
