import {config} from 'dotenv';

const {parsed = {}} = config();

/**
 * Module augmentation doesn't seem to work correctly here, hence the custom function.
 * See https://stackoverflow.com/questions/45194598/using-process-env-in-typescript
 */
interface CustomEnv {
    NODE_ENV: 'production' | 'development';
}

/**
 * Returns the corresponding value for an env variable.
 * @param k
 */
export function env<K extends keyof CustomEnv>(k: K): CustomEnv[K] {
    return parsed[k] as CustomEnv[K];
}
