
/**
 * Creates a comment block.
 */
export const tsBlockComment = (comment: string): string => `/**
${comment.trim().replace(/^/gm, ' * ')}
 */`;

