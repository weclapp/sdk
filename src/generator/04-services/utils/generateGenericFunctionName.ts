import { camelCase } from 'change-case';

export const generateGenericFunctionName = (path: string, suffix = '', prefix = '') => {
  const processedPath = path.replace(/.*\//, '').replace(/\W+/, '_').replace(/[_]+/, '_');
  return camelCase(
    `${['update', 'some', 'count', 'unique', 'create', 'remove'].includes(processedPath) ? prefix : ''}_${processedPath}_${suffix}`
  );
};
