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
  if (!indexHtml.includes(fragment)) failures.push(`index.html: missing security policy fragment ${fragment}`);
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
      failures.push(`${repositoryPath}: bypasses the privacy-safe structured logger with direct console output`);
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
  console.log('Static security invariants are present.');
}
