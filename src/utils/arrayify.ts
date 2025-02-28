export const arrayify = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
