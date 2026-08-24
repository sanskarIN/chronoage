import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryRoots: string[] = [];

const packageFixture = {
  scripts: {
    'native:lock:check':
      'cargo metadata --manifest-path src-tauri/Cargo.toml --locked --no-deps --format-version 1',
    'native:lint':
      'cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets --all-features -- -D warnings',
    'native:check':
      'npm run release:cargo-lock:check && npm run native:lock:check && cargo check --manifest-path src-tauri/Cargo.toml --locked && npm run native:lint',
  },
};

const ciWorkflow = `jobs:
  quality:
    steps:
      - run: npm ci --no-fund --no-audit
  e2e:
    steps:
      - run: npm ci --no-fund --no-audit
`;

const nativeWorkflow = `jobs:
  desktop:
    steps:
      - run: npm ci --no-fund --no-audit
      - run: npm run release:cargo-lock:check
      - run: npm run native:lock:check
  android:
    steps:
      - run: npm ci --no-fund --no-audit
      - run: npm run release:cargo-lock:check
      - run: npm run native:lock:check
  ios:
    steps:
      - run: npm ci --no-fund --no-audit
      - run: npm run release:cargo-lock:check
      - run: npm run native:lock:check
`;

const releaseWorkflow = `jobs:
  verify:
    steps:
      - run: npm ci --no-fund --no-audit
`;

async function createFixture(options?: {
  packageJson?: typeof packageFixture;
  ci?: string;
  native?: string;
  release?: string;
}) {
  const root = await mkdtemp(join(tmpdir(), 'chronoage-ci-reproducibility-'));
  temporaryRoots.push(root);
  await mkdir(join(root, 'scripts'), { recursive: true });
  await mkdir(join(root, '.github', 'workflows'), { recursive: true });
  await copyFile(
    new URL('../scripts/check-ci-reproducibility.mjs', import.meta.url),
    join(root, 'scripts', 'check-ci-reproducibility.mjs'),
  );
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify(options?.packageJson ?? packageFixture, null, 2),
  );
  await writeFile(join(root, '.github', 'workflows', 'ci.yml'), options?.ci ?? ciWorkflow);
  await writeFile(
    join(root, '.github', 'workflows', 'native.yml'),
    options?.native ?? nativeWorkflow,
  );
  await writeFile(
    join(root, '.github', 'workflows', 'release.yml'),
    options?.release ?? releaseWorkflow,
  );
  return root;
}

function runPolicy(root: string) {
  return spawnSync(process.execPath, [join(root, 'scripts', 'check-ci-reproducibility.mjs')], {
    encoding: 'utf8',
  });
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('CI reproducibility policy', () => {
  it('accepts lockfile-only npm and Cargo verification', async () => {
    const root = await createFixture();

    const result = runPolicy(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('use lockfile-only npm installs');
  });

  it('rejects npm install in a permanent CI workflow', async () => {
    const root = await createFixture({
      ci: ciWorkflow.replace('npm ci --no-fund --no-audit', 'npm install --no-fund --no-audit'),
    });

    const result = runPolicy(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('npm install is forbidden');
  });

  it('rejects native lint without Cargo --locked', async () => {
    const root = await createFixture({
      packageJson: {
        scripts: {
          ...packageFixture.scripts,
          'native:lint':
            'cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings',
        },
      },
    });

    const result = runPolicy(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('native:lint must run cargo clippy with --locked');
  });

  it('rejects missing native lockfile verification in the matrix', async () => {
    const root = await createFixture({
      native: nativeWorkflow.replace('npm run native:lock:check', 'echo skipped'),
    });

    const result = runPolicy(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('locked Cargo metadata verification');
  });
});
