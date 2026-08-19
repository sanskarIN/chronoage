import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'dist', 'coverage', 'playwright-report', 'test-results', '.domain-check']);
const checkedExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css', '.md', '.yml', '.yaml', '.html', '.svg', '.txt']);
const explicitNames = new Set(['.editorconfig', '.gitattributes', '.gitignore', '.npmrc', '.prettierignore']);
const failures = [];
let checked = 0;

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (!entry.isFile()) continue;
    const extension = extname(entry.name);
    if (!checkedExtensions.has(extension) && !explicitNames.has(entry.name)) continue;
    const content = await readFile(path, 'utf8');
    checked += 1;
    if (content.includes('\r')) failures.push(`${relative(root, path)}: contains CR line endings`);
    if (content.includes('\t')) failures.push(`${relative(root, path)}: contains tab characters`);
    if (!content.endsWith('\n')) failures.push(`${relative(root, path)}: missing final newline`);
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const trailing = line.match(/\s+$/)?.[0] ?? '';
      const allowedMarkdownBreak = extension === '.md' && trailing === '  ';
      if (trailing && !allowedMarkdownBreak) {
        failures.push(`${relative(root, path)}:${index + 1}: trailing whitespace`);
      }
    });
  }
}

await walk(root);
if (failures.length) {
  console.error('Formatting convention violations:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Checked ${checked} text files for repository formatting conventions.`);
}
