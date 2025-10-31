import { camelCase } from 'change-case';
import { RESERVERD_FUNCTION_NAMES as RESERVED_METHOD_NAMES } from '..';

export const generateGenericFunctionName = (path: string, suffix = '', prefix = '') => {
  const processedPath = path.replace(/.*\//, '').replace(/\W+/, '_').replace(/[_]+/, '_');
  return camelCase(
    `${!RESERVED_METHOD_NAMES.includes(processedPath) ? '' : prefix + '_'}` + processedPath + `_${suffix}`
  );
};
