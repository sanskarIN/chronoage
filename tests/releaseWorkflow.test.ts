import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryRoots: string[] = [];

async function createFixture(
  transformWorkflow: (workflow: string) => string = (workflow) => workflow,
  manifestScript = 'node scripts/generate-release-manifest.mjs',
) {
  const root = await mkdtemp(join(tmpdir(), 'chronoage-release-workflow-'));
  temporaryRoots.push(root);
  await mkdir(join(root, 'scripts'), { recursive: true });
  await mkdir(join(root, '.github', 'workflows'), { recursive: true });
  await copyFile(
    new URL('../scripts/check-release-workflow.mjs', import.meta.url),
    join(root, 'scripts', 'check-release-workflow.mjs'),
  );
  const workflow = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
  await writeFile(
    join(root, '.github', 'workflows', 'release.yml'),
    transformWorkflow(workflow),
  );
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ scripts: { 'release:manifest': manifestScript } }, null, 2),
  );
  return root;
}

function runPolicy(root: string) {
  return spawnSync(process.execPath, [join(root, 'scripts', 'check-release-workflow.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('release workflow policy', () => {
  it('accepts the repository release workflow', async () => {
    const root = await createFixture();

    const result = runPolicy(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('canonical manifest generator');
    expect(result.stdout).toContain('evidence manifests');
    expect(result.stdout).toContain('publish-time integrity verification');
  });

  it('rejects a redirected release manifest package script', async () => {
    const root = await createFixture((workflow) => workflow, 'node scripts/unreviewed-generator.mjs');

    const result = runPolicy(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('package scripts: release:manifest');
  });

  it('rejects removal of publish-time checksum verification', async () => {
    const root = await createFixture((workflow) =>
      workflow.replace(
        '      - name: Verify downloaded release checksum\n        run: sha256sum --check "chronoage-web-${GITHUB_REF_NAME}.tar.gz.sha256"\n',
        '',
      ),
    );

    const result = runPolicy(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('downloaded artifact checksum verification');
  });

  it('rejects removal of release evidence generation', async () => {
    const root = await createFixture((workflow) =>
      workflow.replace('          npm run release:manifest --\n', '          node scripts/removed-manifest-step.mjs\n'),
    );

    const result = runPolicy(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('release evidence manifest');
  });

  it('rejects a GitHub Release that does not attach its evidence manifest', async () => {
    const root = await createFixture((workflow) =>
      workflow.replace(
        '          "chronoage-web-${GITHUB_REF_NAME}.manifest.json"\n          --repo "$GITHUB_REPOSITORY"',
        '          --repo "$GITHUB_REPOSITORY"',
      ),
    );

    const result = runPolicy(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('GitHub Release creation must attach the release manifest');
  });
});
