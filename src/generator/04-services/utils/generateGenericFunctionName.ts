import {camelCase} from 'change-case';

export const generateGenericFunctionName = (path: string, suffix = '', prefix = '') => {
    return camelCase(
        `${prefix}_` +
        path
            .replace(/.*\//, '')
            .replace(/\W+/, '_')
            .replace(/[_]+/, '_') + `_${suffix}`
    );
};
