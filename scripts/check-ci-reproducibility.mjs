import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const ciWorkflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const nativeWorkflow = await readFile(
  new URL('../.github/workflows/native.yml', import.meta.url),
  'utf8',
);
const releaseWorkflow = await readFile(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
);

const failures = [];
const reproducibleNpmInstall = 'npm ci --no-fund --no-audit';

function countOccurrences(source, fragment) {
  return source.split(fragment).length - 1;
}

function requireCount(label, source, fragment, minimum) {
  const count = countOccurrences(source, fragment);
  if (count < minimum) {
    failures.push(
      `${label}: expected at least ${minimum} occurrence(s) of ${JSON.stringify(fragment)}, found ${count}`,
    );
  }
}

for (const [label, workflow] of [
  ['CI workflow', ciWorkflow],
  ['Native CI workflow', nativeWorkflow],
  ['Release workflow', releaseWorkflow],
]) {
  if (/\brun:\s*npm install\b/.test(workflow)) {
    failures.push(`${label}: npm install is forbidden in permanent verification workflows`);
  }
}

requireCount('CI workflow', ciWorkflow, reproducibleNpmInstall, 2);
requireCount('Native CI workflow', nativeWorkflow, reproducibleNpmInstall, 3);
requireCount('Release workflow', releaseWorkflow, reproducibleNpmInstall, 1);
requireCount(
  'Native CI workflow Cargo lockfile preflight',
  nativeWorkflow,
  'npm run release:cargo-lock:check',
  3,
);
requireCount(
  'Native CI workflow locked Cargo metadata verification',
  nativeWorkflow,
  'npm run native:lock:check',
  3,
);

const expectedNativeLockScript =
  'cargo metadata --manifest-path src-tauri/Cargo.toml --locked --no-deps --format-version 1';
if (packageJson.scripts?.['native:lock:check'] !== expectedNativeLockScript) {
  failures.push(
    `package scripts: native:lock:check=${JSON.stringify(packageJson.scripts?.['native:lock:check'])} expected=${JSON.stringify(expectedNativeLockScript)}`,
  );
}

const nativeLint = String(packageJson.scripts?.['native:lint'] ?? '');
if (!nativeLint.includes('cargo clippy') || !nativeLint.includes('--locked')) {
  failures.push('package scripts: native:lint must run cargo clippy with --locked');
}

const nativeCheck = String(packageJson.scripts?.['native:check'] ?? '');
for (const fragment of [
  'npm run release:cargo-lock:check',
  'npm run native:lock:check',
  'cargo check --manifest-path src-tauri/Cargo.toml --locked',
]) {
  if (!nativeCheck.includes(fragment)) {
    failures.push(`package scripts: native:check is missing ${JSON.stringify(fragment)}`);
  }
}

if (failures.length > 0) {
  console.error('CI reproducibility policy check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    'Permanent web, native, and release workflows use lockfile-only npm installs, and native verification requires locked Cargo dependency state.',
  );
}
