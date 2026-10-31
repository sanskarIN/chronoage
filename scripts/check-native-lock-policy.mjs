import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const cargoLockUrl = new URL('src-tauri/Cargo.lock', root);
const nativeWorkflowUrl = new URL('.github/workflows/native.yml', root);
const releaseWorkflowUrl = new URL('.github/workflows/release.yml', root);

let hasCargoLockfile = true;
try {
  await access(cargoLockUrl);
} catch {
  hasCargoLockfile = false;
}

const failures = [];
const nativeWorkflow = await readFile(nativeWorkflowUrl, 'utf8');
const releaseWorkflow = await readFile(releaseWorkflowUrl, 'utf8');

if (hasCargoLockfile) {
  if (!/npm run native:locked:check(?:\s|$)/m.test(nativeWorkflow)) {
    failures.push('native.yml: locked native dependency verification must run when Cargo.lock exists');
  }

  if (!/npm run native:locked:check(?:\s|$)/m.test(releaseWorkflow)) {
    failures.push('release.yml: release verification must run locked native dependency verification when Cargo.lock exists');
  }
}

if (failures.length > 0) {
  console.error('Native dependency-lock policy failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Native dependency-lock policy passed (${hasCargoLockfile ? 'Cargo.lock present; locked verification required' : 'Cargo.lock absent; pre-lockfile mode'}).`,
  );
}
