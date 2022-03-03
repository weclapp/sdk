export const typeFallback = (type: string | undefined) =>
    type ?? 'any /* error: failed to extract type */';
