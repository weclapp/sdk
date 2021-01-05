/**
 * Module augmentation doesn't seem to work correctly here, hence the custom function.
 * See https://stackoverflow.com/questions/45194598/using-process-env-in-typescript
 */
interface CustomEnv {
    SWAGGER_FILE: string;
    SDK_DIST: string;
    CODE_INDENTATION: string;
}

/**
 * Returns the corresponding value for an env variable.
 * @param k
 */
export function env<K extends keyof CustomEnv>(k: K): CustomEnv[K] {
    return process.env[k] as CustomEnv[K];
}
