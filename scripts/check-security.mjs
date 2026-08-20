import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const failures = [];

const indexHtml = await readFile(join(root, 'index.html'), 'utf8');
const requiredIndexFragments = [
  `http-equiv="Content-Security-Policy"`,
  `default-src 'self'`,
  `script-src 'self'`,
  `object-src 'none'`,
  `frame-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `name="referrer" content="no-referrer"`,
];
for (const fragment of requiredIndexFragments) {
  if (!indexHtml.includes(fragment))
    failures.push(`index.html: missing security policy fragment ${fragment}`);
}

const tauriConfig = JSON.parse(await readFile(join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
const defaultCapability = JSON.parse(
  await readFile(join(root, 'src-tauri/capabilities/default.json'), 'utf8'),
);

if (tauriConfig.app?.withGlobalTauri !== false) {
  failures.push('src-tauri/tauri.conf.json: app.withGlobalTauri must remain false');
}
if (tauriConfig.build?.frontendDist !== '../dist') {
  failures.push('src-tauri/tauri.conf.json: native production frontend must use ../dist');
}
if (tauriConfig.build?.devUrl !== 'http://localhost:5173') {
  failures.push('src-tauri/tauri.conf.json: native development URL must remain loopback-only');
}

const tauriCsp = String(tauriConfig.app?.security?.csp ?? '');
const requiredTauriCspFragments = [
  `default-src 'self'`,
  `script-src 'self'`,
  `object-src 'none'`,
  `frame-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
];
for (const fragment of requiredTauriCspFragments) {
  if (!tauriCsp.includes(fragment)) {
    failures.push(`src-tauri/tauri.conf.json: missing native CSP fragment ${fragment}`);
  }
}

const nativePermissions = defaultCapability.permissions;
if (
  !Array.isArray(nativePermissions) ||
  nativePermissions.length !== 1 ||
  nativePermissions[0] !== 'core:default'
) {
  failures.push(
    'src-tauri/capabilities/default.json: default native permissions must remain exactly ["core:default"]',
  );
}
if (!Array.isArray(defaultCapability.windows) || !defaultCapability.windows.includes('main')) {
  failures.push('src-tauri/capabilities/default.json: capability must be scoped to the main window');
}

const forbiddenSourcePatterns = [
  ['dangerouslySetInnerHTML', /\bdangerouslySetInnerHTML\b/],
  ['eval()', /\beval\s*\(/],
  ['Function constructor', /\bnew\s+Function\s*\(/],
  ['document.write()', /\bdocument\.write\s*\(/],
];
const directConsolePattern = /\bconsole\.(?:log|info|warn|error|debug)\s*\(/;
const directConsoleAllowlist = new Set(['src/utils/logger.ts']);

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }
    if (!entry.isFile() || !['.ts', '.tsx', '.js', '.mjs'].includes(extname(entry.name))) continue;
    const content = await readFile(path, 'utf8');
    const repositoryPath = relative(root, path).replaceAll('\\', '/');
    for (const [label, pattern] of forbiddenSourcePatterns) {
      if (pattern.test(content)) failures.push(`${repositoryPath}: contains forbidden ${label}`);
    }
    if (directConsolePattern.test(content) && !directConsoleAllowlist.has(repositoryPath)) {
      failures.push(
        `${repositoryPath}: bypasses the privacy-safe structured logger with direct console output`,
      );
    }
  }
}

await scan(join(root, 'src'));
await scan(join(root, 'public'));

if (failures.length > 0) {
  console.error('Static security invariant check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Static browser and native security invariants are present.');
}
