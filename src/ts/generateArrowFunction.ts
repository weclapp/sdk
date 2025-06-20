import { indent } from '@utils/indent';

interface Options {
  name: string;
  signature: string;
  returns: string;
  params?: string[];
}

export const generateArrowFunction = ({ name, signature, returns, params }: Options) => {
  return `const ${name}: ${signature} = (${params?.join(', ') ?? ''}) =>\n${indent(returns)};`;
};
