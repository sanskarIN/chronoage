import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const markdownFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && entry.name.endsWith('.md')) markdownFiles.push(path);
  }
}

await walk(root);
const failures = [];
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(linkPattern)) {
    const target = match[1]?.trim();
    if (!target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    const withoutAnchor = target.split('#', 1)[0];
    if (!withoutAnchor) continue;
    const resolved = resolve(dirname(file), decodeURIComponent(withoutAnchor));
    try {
      await stat(resolved);
    } catch {
      failures.push(`${relative(root, file)} -> ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Broken local Markdown links:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${markdownFiles.length} Markdown files: local links are valid.`);
}
