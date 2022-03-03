/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
type AnyFunction = (...args: any[]) => any;

export const memoize = <F extends AnyFunction>(f: F): F => {
    const cache = new Map();

    return ((...args) => {
        const value = cache.get(args) ?? f(...args);
        cache.set(args, value);
        return value;
    }) as F;
};
