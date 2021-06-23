/**
 * Tries to match the content using the given regular expresison
 * @param content Content
 * @param r Regexp
 * @param g Optional group to extract
 */
export const match = (content: string, r: RegExp, g = 0): string | null => {
    return r.exec(content)?.[g] ?? null;
};

/**
 * Tries to match all.
 * @param content Content
 * @param r Regexp
 * @param g Optional group to extract every time.
 */
export const matchAll = (content: string, r: RegExp, g = 0): string[] => {
    const results: string[] = [];

    for (let value; (value = match(content, r, g)) !== null;) {
        if (value !== null) {
            results.push(value);
        }
    }

    return results;
};
