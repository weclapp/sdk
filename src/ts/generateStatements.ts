export const generateStatements = (...statements: string[]): string =>
    statements
        .map(v => v.trim())
        .filter(v => v.length)
        .join('\n\n');
