import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const projectSource = await readFile(new URL('../src/config/project.ts', import.meta.url), 'utf8');
const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const releaseNotes = await readFile(
  new URL(`../docs/releases/${packageJson.version}.md`, import.meta.url),
  'utf8',
).catch(() => null);
const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const nodeVersion = (await readFile(new URL('../.nvmrc', import.meta.url), 'utf8')).trim();
const ciWorkflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const releaseWorkflow = await readFile(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
);

function readProjectString(key) {
  const match = projectSource.match(new RegExp(`\\b${key}:\\s*'([^']+)'`));
  if (!match?.[1]) throw new Error(`Unable to read project.${key} from src/config/project.ts.`);
  return match[1];
}

function workflowNodeVersions(source) {
  return [...source.matchAll(/node-version:\s*["']?([^\s"']+)/g)].map((match) => match[1]);
}

const projectName = readProjectString('name');
const projectVersion = readProjectString('version');
const projectLicense = readProjectString('license');
const repositoryUrl = readProjectString('repositoryUrl');
const fundingUrl = readProjectString('fundingUrl');

const checks = [
  ['name', packageJson.name, projectName.toLowerCase()],
  ['version', packageJson.version, projectVersion],
  ['license', packageJson.license, projectLicense],
  ['repository', packageJson.repository?.url, `git+${repositoryUrl}.git`],
  ['homepage', packageJson.homepage, `${repositoryUrl}#readme`],
  ['bugs', packageJson.bugs?.url, `${repositoryUrl}/issues`],
  ['funding', packageJson.funding, fundingUrl],
  ['node engine', packageJson.engines?.node, `>=${nodeVersion}`],
];

const failures = checks
  .filter(([, packageValue, projectValue]) => packageValue !== projectValue)
  .map(
    ([label, packageValue, projectValue]) =>
      `${label}: package.json=${JSON.stringify(packageValue)} project=${JSON.stringify(projectValue)}`,
  );

const changelogHeading = `## [${packageJson.version}] - `;
if (!changelog.includes(changelogHeading)) {
  failures.push(`changelog: missing released-version heading beginning ${JSON.stringify(changelogHeading)}`);
}

if (!releaseNotes) {
  failures.push(`release notes: missing docs/releases/${packageJson.version}.md`);
} else {
  const releaseNotesHeading = `# ChronoAge ${packageJson.version}`;
  if (!releaseNotes.includes(releaseNotesHeading)) {
    failures.push(`release notes: missing heading ${JSON.stringify(releaseNotesHeading)}`);
  }
}

const expectedCacheName = `chronoage-${packageJson.version}`;
const cacheNameMatch = serviceWorker.match(/\bCACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
if (!cacheNameMatch?.[1]) {
  failures.push('service worker: unable to read CACHE_NAME from public/sw.js');
} else if (cacheNameMatch[1] !== expectedCacheName) {
  failures.push(
    `service worker: CACHE_NAME=${JSON.stringify(cacheNameMatch[1])} expected=${JSON.stringify(expectedCacheName)}`,
  );
}

const author = String(packageJson.author ?? '');
const businessEmail = projectSource.match(/businessEmails:\s*\['([^']+)'/)?.[1];
if (!businessEmail || !author.includes(businessEmail)) {
  failures.push('author: package.json must include the primary business email from project metadata');
}

for (const [label, source] of [
  ['CI workflow', ciWorkflow],
  ['release workflow', releaseWorkflow],
]) {
  const versions = workflowNodeVersions(source);
  if (versions.length === 0) {
    failures.push(`${label}: no node-version value found`);
    continue;
  }
  for (const version of versions) {
    if (version !== nodeVersion) {
      failures.push(`${label}: node-version=${JSON.stringify(version)} .nvmrc=${JSON.stringify(nodeVersion)}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Project metadata consistency check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Project metadata, release documentation, PWA cache version, and runtime pins are consistent.');
}
