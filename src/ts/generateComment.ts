export const generateInlineComment = (comment: string): string => `/* ${comment} */`;

export const generateBlockComment = (comment: string): string => `/**
${comment.trim().replace(/^/gm, ' * ')}
 */`;
