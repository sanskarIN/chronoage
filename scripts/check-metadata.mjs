import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const projectSource = await readFile(new URL('../src/config/project.ts', import.meta.url), 'utf8');
const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const releaseNotes = await readFile(
  new URL(`../docs/releases/${packageJson.version}.md`, import.meta.url),
  'utf8',
).catch(() => null);
const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const tauriConfig = JSON.parse(
  await readFile(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'),
);
const cargoToml = await readFile(new URL('../src-tauri/Cargo.toml', import.meta.url), 'utf8');
const rustToolchain = await readFile(
  new URL('../rust-toolchain.toml', import.meta.url),
  'utf8',
);
const dependabotConfig = await readFile(
  new URL('../.github/dependabot.yml', import.meta.url),
  'utf8',
);
const nodeVersion = (await readFile(new URL('../.nvmrc', import.meta.url), 'utf8')).trim();
const ciWorkflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const nativeWorkflow = await readFile(
  new URL('../.github/workflows/native.yml', import.meta.url),
  'utf8',
);
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

function readCargoSection(source, section) {
  return source.match(new RegExp(`\\[${section.replaceAll('-', '\\-')}\\]([\\s\\S]*?)(?:\\n\\[|$)`))?.[1];
}

function readCargoPackageString(source, key) {
  const packageSection = readCargoSection(source, 'package');
  const value = packageSection?.match(new RegExp(`^${key}\\s*=\\s*["']([^"']+)["']`, 'm'))?.[1];
  if (!value) throw new Error(`Unable to read [package] ${key} from src-tauri/Cargo.toml.`);
  return value;
}

function readCargoDependencyVersion(source, section, dependency) {
  const dependencySection = readCargoSection(source, section);
  const escapedDependency = dependency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const line = dependencySection?.match(new RegExp(`^${escapedDependency}\\s*=\\s*\\{([^}]*)\\}`, 'm'))?.[1];
  const version = line?.match(/\bversion\s*=\s*["']([^"']+)["']/)?.[1];
  if (!version) {
    throw new Error(`Unable to read [${section}] ${dependency} version from src-tauri/Cargo.toml.`);
  }
  return version;
}

function readRustToolchainChannel(source) {
  const channel = source.match(/^\s*channel\s*=\s*["']([^"']+)["']/m)?.[1];
  if (!channel) throw new Error('Unable to read Rust channel from rust-toolchain.toml.');
  return channel;
}

function readRustToolchainComponents(source) {
  const rawComponents = source.match(/^\s*components\s*=\s*\[([^\]]*)\]/m)?.[1];
  if (!rawComponents) return [];
  return [...rawComponents.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
}

const projectName = readProjectString('name');
const projectVersion = readProjectString('version');
const projectLicense = readProjectString('license');
const repositoryUrl = readProjectString('repositoryUrl');
const fundingUrl = readProjectString('fundingUrl');
const cargoVersion = readCargoPackageString(cargoToml, 'version');
const cargoRustVersion = readCargoPackageString(cargoToml, 'rust-version');
const tauriCrateVersion = readCargoDependencyVersion(cargoToml, 'dependencies', 'tauri');
const tauriBuildVersion = readCargoDependencyVersion(cargoToml, 'build-dependencies', 'tauri-build');
const rustChannel = readRustToolchainChannel(rustToolchain);
const rustComponents = readRustToolchainComponents(rustToolchain);

const checks = [
  ['name', packageJson.name, projectName.toLowerCase()],
  ['version', packageJson.version, projectVersion],
  ['license', packageJson.license, projectLicense],
  ['repository', packageJson.repository?.url, `git+${repositoryUrl}.git`],
  ['homepage', packageJson.homepage, `${repositoryUrl}#readme`],
  ['bugs', packageJson.bugs?.url, `${repositoryUrl}/issues`],
  ['funding', packageJson.funding, fundingUrl],
  ['node engine', packageJson.engines?.node, `>=${nodeVersion}`],
  ['Tauri version', tauriConfig.version, packageJson.version],
  ['Cargo package version', cargoVersion, packageJson.version],
  ['Cargo rust-version', cargoRustVersion, rustChannel],
];

const failures = checks
  .filter(([, packageValue, projectValue]) => packageValue !== projectValue)
  .map(
    ([label, packageValue, projectValue]) =>
      `${label}: package.json=${JSON.stringify(packageValue)} project=${JSON.stringify(projectValue)}`,
  );

if (tauriConfig.productName !== projectName) {
  failures.push(
    `Tauri product name: tauri.conf.json=${JSON.stringify(tauriConfig.productName)} project=${JSON.stringify(projectName)}`,
  );
}

if (!/^\d+\.\d+\.\d+$/.test(rustChannel)) {
  failures.push(
    `Rust toolchain: channel must be an exact MAJOR.MINOR.PATCH pin, received ${JSON.stringify(rustChannel)}`,
  );
}

for (const [label, version] of [
  ['tauri', tauriCrateVersion],
  ['tauri-build', tauriBuildVersion],
]) {
  if (!/^=\d+\.\d+\.\d+$/.test(version)) {
    failures.push(
      `Cargo dependency ${label}: version must use an exact =MAJOR.MINOR.PATCH pin, received ${JSON.stringify(version)}`,
    );
  }
}

for (const component of ['clippy', 'rustfmt']) {
  if (!rustComponents.includes(component)) {
    failures.push(`Rust toolchain: missing required ${component} component`);
  }
}

if (nativeWorkflow.includes('rustup update stable')) {
  failures.push('Native CI workflow: must not update to an unpinned stable Rust toolchain');
}

if (!nativeWorkflow.includes('rustup show active-toolchain')) {
  failures.push('Native CI workflow: must report the active pinned Rust toolchain');
}

const cargoDependabotBlock = dependabotConfig.match(
  /-\s+package-ecosystem:\s*["']?cargo["']?([\s\S]*?)(?=\n\s*-\s+package-ecosystem:|$)/,
)?.[1];
if (!cargoDependabotBlock) {
  failures.push('Dependabot: missing Cargo dependency update configuration');
} else if (!/^\s*directory:\s*["']?\/src-tauri["']?\s*$/m.test(cargoDependabotBlock)) {
  failures.push('Dependabot: Cargo dependency updates must target /src-tauri');
}

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
  ['Native CI workflow', nativeWorkflow],
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
  console.log(
    'Project metadata, native versions, dependency monitoring, release documentation, PWA cache version, and runtime pins are consistent.',
  );
}
