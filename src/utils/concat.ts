import { indent } from "@utils/indent";

export const concat = (
  strings: string[],
  separator = ", ",
  maxLength = 80,
): string => {
  const joined = strings.join(separator);

  if (joined.length > maxLength) {
    const length = strings.length - 1;

    return `\n${indent(
      strings
        .map((value, index) =>
          index === length ? value : `${(value + separator).trim()}\n`,
        )
        .join(""),
    )}\n`;
  } else {
    return joined;
  }
};
