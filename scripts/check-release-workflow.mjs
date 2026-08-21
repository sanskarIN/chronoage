import { readFile } from 'node:fs/promises';

const workflow = await readFile(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
);

const failures = [];

const requiredFragments = [
  ['npm lockfile preflight', 'npm run release:npm-lock:check'],
  ['lockfile-only npm install', 'npm ci --no-fund --no-audit'],
  ['deterministic tar ordering', '--sort=name'],
  ['normalized tar timestamp', '--mtime="@${source_date_epoch}"'],
  ['normalized tar owner', '--owner=0'],
  ['normalized tar group', '--group=0'],
  ['numeric tar ownership', '--numeric-owner'],
  ['timestamp-free gzip metadata', 'gzip -n "$archive"'],
  ['SHA-256 checksum', 'sha256sum "chronoage-web-${GITHUB_REF_NAME}.tar.gz"'],
  ['verified release tag', '--verify-tag'],
  ['publish dependency on verification', 'needs: verify'],
];

for (const [label, fragment] of requiredFragments) {
  if (!workflow.includes(fragment)) {
    failures.push(`${label}: missing ${JSON.stringify(fragment)}`);
  }
}

if (/\brun:\s*npm install\b/.test(workflow)) {
  failures.push('dependency installation: release workflow must not fall back to npm install');
}

if (/\btar\s+-czf\b/.test(workflow)) {
  failures.push(
    'archive creation: combined tar -z packaging is forbidden because gzip metadata must be normalized explicitly',
  );
}

const preflightIndex = workflow.indexOf('npm run release:npm-lock:check');
const npmCiIndex = workflow.indexOf('npm ci --no-fund --no-audit');
if (preflightIndex >= 0 && npmCiIndex >= 0 && preflightIndex > npmCiIndex) {
  failures.push('dependency installation: npm lockfile preflight must run before npm ci');
}

const archiveIndex = workflow.indexOf('gzip -n "$archive"');
const checksumIndex = workflow.indexOf('sha256sum "chronoage-web-${GITHUB_REF_NAME}.tar.gz"');
if (archiveIndex >= 0 && checksumIndex >= 0 && archiveIndex > checksumIndex) {
  failures.push('release artifact: checksum must be generated after the deterministic archive');
}

const verifyJobIndex = workflow.indexOf('  verify:');
const publishJobIndex = workflow.indexOf('  publish:');
if (verifyJobIndex < 0 || publishJobIndex < 0 || verifyJobIndex > publishJobIndex) {
  failures.push('workflow structure: verify job must be declared before publish job');
}

if (failures.length > 0) {
  console.error('Release workflow policy check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    'Release workflow preserves lockfile-only installation, deterministic packaging, checksum generation, and verify-before-publish policy.',
  );
}
