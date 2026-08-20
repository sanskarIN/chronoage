import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const appTsConfig = JSON.parse(await readFile(new URL('../tsconfig.app.json', import.meta.url), 'utf8'));
const viteConfig = await readFile(new URL('../vite.config.ts', import.meta.url), 'utf8');
const tauriConfig = JSON.parse(
  await readFile(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'),
);
const mainSource = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
const arrayAtPolyfill = await readFile(
  new URL('../src/polyfills/arrayAt.ts', import.meta.url),
  'utf8',
);
const randomIdSource = await readFile(new URL('../src/utils/randomId.ts', import.meta.url), 'utf8');

const failures = [];
const expectedEcmaTarget = 'ES2020';
const compilerOptions = appTsConfig.compilerOptions ?? {};

if (String(compilerOptions.target ?? '').toUpperCase() !== expectedEcmaTarget) {
  failures.push(`tsconfig.app.json target must remain ${expectedEcmaTarget}.`);
}

const libs = Array.isArray(compilerOptions.lib)
  ? compilerOptions.lib.map((value) => String(value).toUpperCase())
  : [];
if (!libs.includes(expectedEcmaTarget)) {
  failures.push(`tsconfig.app.json lib must include ${expectedEcmaTarget}.`);
}
if (libs.some((value) => /^ES20(2[1-9]|[3-9]\d)$/.test(value) || value === 'ESNEXT')) {
  failures.push('tsconfig.app.json must not expose post-ES2020 runtime APIs to application code.');
}

const viteTarget = viteConfig.match(/\btarget:\s*['"]([^'"]+)['"]/)?.[1];
if (viteTarget?.toLowerCase() !== 'es2020') {
  failures.push('Vite production build target must remain es2020 for the declared native webview baseline.');
}

const iosMinimum = tauriConfig.bundle?.iOS?.minimumSystemVersion;
if (typeof iosMinimum !== 'string' || Number.parseFloat(iosMinimum) < 14) {
  failures.push('Tauri iOS minimumSystemVersion must be 14.0 or newer for the ES2020 webview baseline.');
}

if (!mainSource.includes("import './polyfills/arrayAt';")) {
  failures.push('src/main.tsx must load the Array.at compatibility polyfill before application startup.');
}
if (!arrayAtPolyfill.includes('Array.prototype') || !arrayAtPolyfill.includes("'at'")) {
  failures.push('Array.at compatibility polyfill is missing its runtime implementation.');
}
if (!randomIdSource.includes('getRandomValues') || !randomIdSource.includes('randomUUID')) {
  failures.push('UUID generation must retain the secure getRandomValues fallback for older webviews.');
}

const runtimeExtensions = new Set(['.ts', '.tsx']);
const directRandomUuidCallers = [];

async function walkRuntime(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walkRuntime(path);
      continue;
    }
    if (!entry.isFile() || !runtimeExtensions.has(extname(entry.name))) continue;
    const repositoryPath = relative(root, path).replaceAll('\\', '/');
    if (repositoryPath === 'src/utils/randomId.ts') continue;
    const source = await readFile(path, 'utf8');
    if (/\bcrypto\.randomUUID\s*\(/.test(source)) directRandomUuidCallers.push(repositoryPath);
  }
}

await walkRuntime(join(root, 'src'));
if (directRandomUuidCallers.length > 0) {
  failures.push(
    `Direct crypto.randomUUID calls bypass the iOS 14 fallback: ${directRandomUuidCallers.join(', ')}`,
  );
}

if (failures.length > 0) {
  console.error('Runtime compatibility check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('ES2020, iOS 14 webview, Array.at, and secure UUID compatibility invariants are consistent.');
}
