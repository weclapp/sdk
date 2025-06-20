import { BinaryLike, createHash } from 'crypto';

export const hash = (content: BinaryLike | BinaryLike[], algorithm = 'sha256'): string => {
  const hash = createHash(algorithm);

  if (Array.isArray(content)) {
    content.map(hash.update.bind(hash));
  } else {
    hash.update(content);
  }

  return hash.digest('hex');
};
