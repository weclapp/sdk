import {generateString} from '@ts/generateString';
import {generateType} from '@ts/generateType';
import {indent} from '@utils/indent';

export const generateTuple = (name: string, values: string[]): string => {
    const quoted = values.map(generateString);
    const joined = quoted.join(' | ');
    const value = joined.length > 80 ? indent(quoted.join(' |\n')).trim() : joined;
    return generateType(name, value);
};
