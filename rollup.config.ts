import ts from "@rollup/plugin-typescript";
import pkg from "./package.json" with { type: "json" };
import { createFilter } from "@rollup/pluginutils";
import { defineConfig, Plugin } from "rollup";

const txt = (): Plugin => {
  const filter = createFilter("**/*.ts.txt");
  return {
    name: "txt",
    transform(code: string, id: string) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: "" },
        };
      }
    },
  };
};

export default defineConfig({
  input: "src/index.ts",
  plugins: [txt(), ts({ tsconfig: "tsconfig.node.json" })],
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    "path",
    "crypto",
    "yargs/helpers",
    "fs/promises",
    "url",
    "../package.json",
  ],
  output: {
    file: "dist/cli.js",
    format: "es",
    importAttributesKey: "with",
  },
});
