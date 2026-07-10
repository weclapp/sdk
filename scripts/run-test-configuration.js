#!/usr/bin/env node
// @ts-check

import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** @param {string} flag */
const hasFlag = (flag) => process.argv.includes(flag);

/**
 * @param {string} flag
 * @param {string} [defaultValue]
 */
const getFlagValue = (flag, defaultValue) => {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : defaultValue;
};

/** @param {string} cmd */
const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

const version = getFlagValue('--version');
if (!version) {
  console.error('Error: --version is required (e.g. --version v1)');
  process.exit(1);
}

const target = getFlagValue('--target', 'browser');

const validTargets = ['browser', 'browser.rx', 'node', 'node.rx'];
if (!validTargets.includes(target)) {
  console.error(`Error: --target must be one of ${validTargets.join(', ')} (got "${target}")`);
  process.exit(1);
}

const useQueryLanguage = hasFlag('--use-query-language');
const deprecated = hasFlag('--deprecated');
const generateUnique = hasFlag('--generate-unique');

const openapiFile = version === 'v1' ? 'test/openapi.json' : `test/openapi_${version}.json`;

if (!existsSync(resolve(openapiFile))) {
  console.error(`Error: OpenAPI file not found: ${openapiFile}`);
  process.exit(1);
}

const resolvedTarget = target.replace('.', '-');

/** @type {string[]} */
const testFolders = [];

if (!useQueryLanguage && !deprecated && !generateUnique && target === 'browser') {
  testFolders.push('unparameterized');
}
if (useQueryLanguage) {
  testFolders.push('use-query-language');
}
if (deprecated) {
  testFolders.push('deprecated');
}
if (generateUnique) {
  testFolders.push('generate-unique');
}
if (target !== 'browser') {
  testFolders.push(`target/${resolvedTarget}`);
}

// --- Build CLI args for SDK generation ---

/** @type {string[]} */
const cliArgs = [`--target ${target}`];

if (useQueryLanguage) {
  cliArgs.push('--use-query-language');
}
if (deprecated) {
  cliArgs.push('--deprecated');
}
if (generateUnique) {
  cliArgs.push('--generate-unique');
}

console.log('');
console.log('run-combo configuration:');
console.log(`  version          : ${version}`);
console.log(`  target           : ${target}`);
console.log(`  use-query-language: ${useQueryLanguage}`);
console.log(`  deprecated       : ${deprecated}`);
console.log(`  generate-unique  : ${generateUnique}`);
console.log(`  test folders     : ${testFolders.join(', ')}`);
console.log('');

// --- Step 1: Generate SDK ---

run(`node ./bin/cli.js ${openapiFile} ${cliArgs.join(' ')}`);

// --- Step 2: Generate temporary tsconfig for type-checking ---

const tsconfigIncludes = testFolders.map((folder) => `test/${folder}/${version}/**/*.spec.ts`);
const tsconfigContent = JSON.stringify({ extends: './tsconfig.node.json', include: tsconfigIncludes }, null, 2) + '\n';
writeFileSync(resolve('tsconfig.typecheck-generated.json'), tsconfigContent);
console.log(`\nGenerated tsconfig.typecheck-generated.json`);
console.log(`  includes: ${tsconfigIncludes.join(', ')}`);

// --- Step 3: Type-check generated test files ---

run(`npx tsc -p tsconfig.typecheck-generated.json --noEmit --skipLibCheck`);

// --- Step 4: Run vitest for all resolved folders at the given version ---

const testPaths = testFolders.map((folder) => `test/${folder}/${version}`).join(' ');
run(`npx vitest run ${testPaths}`);
