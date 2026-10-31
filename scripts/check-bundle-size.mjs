import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST_DIRECTORY = 'dist';
const DEFAULT_JS_BUDGET_KIB = 250;
const DEFAULT_CSS_BUDGET_KIB = 60;

function parseBudget(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number when set.`);
  }
  return parsed;
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function formatKib(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

if (!existsSync(DIST_DIRECTORY)) {
  console.error('Bundle budget check requires an existing dist/ directory. Run npm run build first.');
  process.exit(1);
}

const jsBudgetBytes = parseBudget('CHRONOAGE_JS_GZIP_BUDGET_KIB', DEFAULT_JS_BUDGET_KIB) * 1024;
const cssBudgetBytes = parseBudget('CHRONOAGE_CSS_GZIP_BUDGET_KIB', DEFAULT_CSS_BUDGET_KIB) * 1024;
const assets = walk(DIST_DIRECTORY)
  .filter((path) => ['.js', '.css'].includes(extname(path)))
  .sort();

const measured = assets.map((path) => ({
  path: relative(DIST_DIRECTORY, path),
  extension: extname(path),
  gzipBytes: gzipSync(readFileSync(path), { level: 9 }).byteLength,
}));

const jsBytes = measured
  .filter((asset) => asset.extension === '.js')
  .reduce((total, asset) => total + asset.gzipBytes, 0);
const cssBytes = measured
  .filter((asset) => asset.extension === '.css')
  .reduce((total, asset) => total + asset.gzipBytes, 0);

for (const asset of measured) {
  console.log(`${asset.path}: ${formatKib(asset.gzipBytes)} gzip`);
}
console.log(`Total JavaScript: ${formatKib(jsBytes)} / ${formatKib(jsBudgetBytes)}`);
console.log(`Total CSS: ${formatKib(cssBytes)} / ${formatKib(cssBudgetBytes)}`);

const failures = [];
if (jsBytes > jsBudgetBytes) failures.push(`JavaScript exceeds the gzip budget by ${formatKib(jsBytes - jsBudgetBytes)}.`);
if (cssBytes > cssBudgetBytes) failures.push(`CSS exceeds the gzip budget by ${formatKib(cssBytes - cssBudgetBytes)}.`);

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log('Production bundle budgets are within configured limits.');
