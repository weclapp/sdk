import { generateType } from "@ts/generateType";
import { indent } from "@utils/indent";

interface Options {
  type: string;
  returns?: string;
  generics?: string[];
  params?: string[];
}

export const generateArrowFunctionType = ({
  type,
  returns = "void",
  generics,
  params,
}: Options) => {
  const genericsString = generics?.length
    ? `<\n${indent(generics.join(",\n"))}\n>`
    : "";
  const paramsString = params?.length ? `(${params.join(", ")})` : `()`;
  return generateType(
    type,
    `${genericsString + paramsString} =>\n${indent(returns)}`,
  );
};
