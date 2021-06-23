/**
 * Creates a comment block.
 */
export const tsBlockComment = (comment: string): string => `/**
${comment.trim().replace(/^/gm, ' * ')}
 */`;

/**
 * Creates an inline comment.
 */
export const tsInlineComment = (comment: string): string => `/* ${comment} */`;

