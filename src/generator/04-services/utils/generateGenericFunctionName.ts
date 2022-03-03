import {camelCase} from 'change-case';

export const generateGenericFunctionName = (path: string, suffix = '') => {
    return camelCase(
        path
            .replace(/.*\//, '')
            .replace(/\W+/, '_')
            .replace(/[_]+/, '_') + `_${suffix}`
    );
};
