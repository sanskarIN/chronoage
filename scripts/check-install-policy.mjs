import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const workflowPaths = [
  '.github/workflows/ci.yml',
  '.github/workflows/native.yml',
  '.github/workflows/release.yml',
];

const npmLockPath = new URL('package-lock.json', root);
let hasNpmLockfile = true;
try {
  await readFile(npmLockPath);
} catch {
  hasNpmLockfile = false;
}

const failures = [];
for (const workflowPath of workflowPaths) {
  const workflow = await readFile(new URL(workflowPath, root), 'utf8');
  const usesNpmCi = /\bnpm ci(?:\s|$)/m.test(workflow);
  const usesNpmInstall = /\bnpm install(?:\s|$)/m.test(workflow);

  if (hasNpmLockfile && usesNpmInstall) {
    failures.push(`${workflowPath}: npm install is forbidden once package-lock.json exists; use npm ci`);
  }

  if (!hasNpmLockfile && usesNpmCi && !workflowPath.endsWith('release.yml')) {
    failures.push(`${workflowPath}: npm ci requires package-lock.json; keep npm install until the genuine lockfile is committed`);
  }

  if (workflowPath.endsWith('release.yml')) {
    if (!usesNpmCi) failures.push(`${workflowPath}: release verification must install with npm ci`);
    if (usesNpmInstall) failures.push(`${workflowPath}: release verification must not use npm install`);
  }
}

if (failures.length > 0) {
  console.error('Workflow dependency-install policy failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Workflow dependency-install policy passed (${hasNpmLockfile ? 'package-lock.json present' : 'package-lock.json absent; pre-lockfile mode'}).`,
  );
}
