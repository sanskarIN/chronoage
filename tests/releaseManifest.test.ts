import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryRoots: string[] = [];
const releaseCommit = '0123456789abcdef0123456789abcdef01234567';
const sourceDateEpoch = '1787600000';
const fixtureVersion = '2.0.13';

function digest(content: string | Buffer) {
  return createHash('sha256').update(content).digest('hex');
}

async function createFixture(withLocks = false) {
  const root = await mkdtemp(join(tmpdir(), 'chronoage-release-manifest-'));
  temporaryRoots.push(root);
  await mkdir(join(root, 'scripts'), { recursive: true });
  await mkdir(join(root, 'src-tauri'), { recursive: true });
  await copyFile(
    new URL('../scripts/generate-release-manifest.mjs', import.meta.url),
    join(root, 'scripts', 'generate-release-manifest.mjs'),
  );
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ name: 'chronoage', version: fixtureVersion }, null, 2),
  );
  await writeFile(join(root, '.nvmrc'), `${process.version.slice(1)}\n`);

  const archive = Buffer.from('deterministic release archive\n');
  await writeFile(join(root, `chronoage-web-v${fixtureVersion}.tar.gz`), archive);
  await writeFile(
    join(root, `chronoage-web-v${fixtureVersion}.tar.gz.sha256`),
    `${digest(archive)}  chronoage-web-v${fixtureVersion}.tar.gz\n`,
  );

  if (withLocks) {
    await writeFile(join(root, 'package-lock.json'), '{"lockfileVersion":3}\n');
    await writeFile(join(root, 'src-tauri', 'Cargo.lock'), 'version = 4\n');
  }

  return root;
}

function runManifest(root: string, extraArgs: string[] = [], env: Record<string, string> = {}) {
  return spawnSync(
    process.execPath,
    [
      join(root, 'scripts', 'generate-release-manifest.mjs'),
      '--archive',
      `chronoage-web-v${fixtureVersion}.tar.gz`,
      '--checksum',
      `chronoage-web-v${fixtureVersion}.tar.gz.sha256`,
      '--output',
      `chronoage-web-v${fixtureVersion}.manifest.json`,
      ...extraArgs,
    ],
    {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_REF_NAME: `v${fixtureVersion}`,
        GITHUB_SHA: releaseCommit,
        SOURCE_DATE_EPOCH: sourceDateEpoch,
        ...env,
      },
    },
  );
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('release evidence manifest generation', () => {
  it('writes deterministic release identity and artifact evidence', async () => {
    const root = await createFixture(true);

    const result = runManifest(root);
    const manifest = JSON.parse(
      await readFile(join(root, `chronoage-web-v${fixtureVersion}.manifest.json`), 'utf8'),
    );

    expect(result.status).toBe(0);
    expect(manifest).toMatchObject({
      schemaVersion: 1,
      name: 'chronoage',
      version: fixtureVersion,
      tag: `v${fixtureVersion}`,
      commit: releaseCommit,
      sourceDateEpoch: Number(sourceDateEpoch),
      artifact: {
        file: `chronoage-web-v${fixtureVersion}.tar.gz`,
        sha256: digest(Buffer.from('deterministic release archive\n')),
      },
    });
    expect(manifest.runtime.node).toBe(process.version);
    expect(manifest.dependencyLocks).toEqual([
      { file: 'package-lock.json', sha256: digest('{"lockfileVersion":3}\n') },
      { file: 'src-tauri/Cargo.lock', sha256: digest('version = 4\n') },
    ]);
  });

  it('rejects a runtime that differs from the repository Node pin', async () => {
    const root = await createFixture();
    await writeFile(join(root, '.nvmrc'), '0.0.1\n');

    const result = runManifest(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Release manifest generation requires Node 0.0.1');
  });

  it('rejects a checksum that does not match the release archive', async () => {
    const root = await createFixture();
    await writeFile(
      join(root, `chronoage-web-v${fixtureVersion}.tar.gz.sha256`),
      `${'0'.repeat(64)}  chronoage-web-v${fixtureVersion}.tar.gz\n`,
    );

    const result = runManifest(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Release checksum does not match the archive SHA-256 digest.');
  });

  it('rejects release tag drift from package version', async () => {
    const root = await createFixture();

    const result = runManifest(root, [], { GITHUB_REF_NAME: 'v9.9.9' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`must equal v${fixtureVersion}`);
  });

  it('requires a full commit SHA for release evidence', async () => {
    const root = await createFixture();

    const result = runManifest(root, [], { GITHUB_SHA: 'abc1234' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('must be a full 40-character Git SHA');
  });

  it('rejects unknown command-line options', async () => {
    const root = await createFixture();

    const result = runManifest(root, ['--unknown', 'value']);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Unknown release manifest option --unknown.');
  });
});
