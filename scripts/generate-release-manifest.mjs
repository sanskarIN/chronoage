import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

function fail(message, exitCode = 1) {
  console.error(message);
  process.exitCode = exitCode;
}

function parseArgs(argv) {
  const values = new Map();
  const supported = new Set([
    '--archive',
    '--checksum',
    '--output',
    '--tag',
    '--commit',
    '--source-date-epoch',
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!supported.has(key)) throw new Error(`Unknown release manifest option ${key}.`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}.`);
    if (values.has(key)) throw new Error(`Duplicate release manifest option ${key}.`);
    values.set(key, value);
    index += 1;
  }

  return values;
}

async function sha256(path) {
  const content = await readFile(path);
  return createHash('sha256').update(content).digest('hex');
}

function parseChecksum(source) {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length !== 1) {
    throw new Error('Release checksum file must contain exactly one non-empty SHA-256 entry.');
  }
  const match = lines[0].match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/);
  if (!match) {
    throw new Error(
      'Release checksum file must use sha256sum-compatible "<hash> <file>" syntax.',
    );
  }
  return { sha256: match[1].toLowerCase(), file: match[2] };
}

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (error) {
  fail(error instanceof Error ? error.message : 'Unable to parse release manifest options.', 2);
}

if (!process.exitCode) {
  const archiveArg = args.get('--archive');
  const checksumArg = args.get('--checksum');
  const outputArg = args.get('--output');
  const tag = args.get('--tag') || process.env.GITHUB_REF_NAME;
  const commit = args.get('--commit') || process.env.GITHUB_SHA;
  const sourceDateEpoch = args.get('--source-date-epoch') || process.env.SOURCE_DATE_EPOCH;

  if (!archiveArg || !checksumArg || !outputArg) {
    fail('Release manifest generation requires --archive, --checksum, and --output.', 2);
  } else {
    try {
      const packageJson = JSON.parse(
        await readFile(new URL('../package.json', import.meta.url), 'utf8'),
      );
      const expectedTag = `v${packageJson.version}`;
      if (tag !== expectedTag) {
        throw new Error(`Release manifest tag ${JSON.stringify(tag)} must equal ${expectedTag}.`);
      }
      if (!/^[a-fA-F0-9]{40}$/.test(commit || '')) {
        throw new Error('Release manifest commit must be a full 40-character Git SHA.');
      }
      if (!/^\d+$/.test(sourceDateEpoch || '') || Number(sourceDateEpoch) <= 0) {
        throw new Error(
          'Release manifest SOURCE_DATE_EPOCH must be a positive integer Unix timestamp.',
        );
      }

      const archivePath = resolve(archiveArg);
      const checksumPath = resolve(checksumArg);
      const outputPath = resolve(outputArg);
      const archiveName = basename(archivePath);
      const archiveStats = await stat(archivePath);
      if (!archiveStats.isFile()) throw new Error(`Release archive is not a file: ${archiveArg}`);

      const archiveHash = await sha256(archivePath);
      const checksum = parseChecksum(await readFile(checksumPath, 'utf8'));
      if (basename(checksum.file) !== archiveName) {
        throw new Error(
          `Release checksum references ${JSON.stringify(checksum.file)} instead of ${archiveName}.`,
        );
      }
      if (checksum.sha256 !== archiveHash) {
        throw new Error('Release checksum does not match the archive SHA-256 digest.');
      }

      const lockCandidates = ['package-lock.json', 'src-tauri/Cargo.lock'];
      const dependencyLocks = [];
      for (const relativePath of lockCandidates) {
        const lockUrl = new URL(`../${relativePath}`, import.meta.url);
        try {
          dependencyLocks.push({ file: relativePath, sha256: await sha256(lockUrl) });
        } catch (error) {
          if (error?.code !== 'ENOENT') throw error;
        }
      }

      const manifest = {
        schemaVersion: 1,
        name: packageJson.name,
        version: packageJson.version,
        tag,
        commit: commit.toLowerCase(),
        sourceDateEpoch: Number(sourceDateEpoch),
        runtime: { node: process.version },
        artifact: {
          file: archiveName,
          bytes: archiveStats.size,
          sha256: archiveHash,
        },
        dependencyLocks,
      };

      await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
      console.log(`Release evidence manifest written to ${outputArg}.`);
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Unable to generate release evidence manifest.');
    }
  }
}
