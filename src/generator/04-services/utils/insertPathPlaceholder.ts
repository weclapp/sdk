export const insertPathPlaceholder = (path: string, record: Record<string, string>): string => {
    return path.replace(/{(\w+)}/g, (_, name: string) => record[name]);
};
