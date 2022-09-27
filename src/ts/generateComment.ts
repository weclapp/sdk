export const generateInlineComment = (comment: string): string => `/** ${comment} */`;

export const generateBlockComment = (comment: string, body?: string): string =>
    `/**\n${comment.trim().replace(/^ */gm, ' * ')}\n */${body ? `\n${body}` : ''}`;
